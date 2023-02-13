import cubesValues from "./cubesValues";

export type CellGetter<T> = (x: number, y: number, z: number) => T;
export type ChunkCoord = { x: number; y: number; z: number };

export class MarchingCubesChunks {
  private getCell;
  private getCellColor;
  private chunkSize: number;
  private chunkSize2: number;
  private chunkSize3: number;
  private maxCount: number;
  private halfChunkSize: number;
  private delta: number;
  private yDelta: number;
  private zDelta: number;
  private isolation = 0;
  private tmpState;
  private flatShading = true;
  private cells = new Map<number, number>();
  private readableIndexCells = new Map<string, number>();

  constructor({
    getCell,
    getCellColor,
    chunkSize = 16,
  }: {
    getCell: CellGetter<number>;
    chunkSize?: number;
    getCellColor?: CellGetter<[number, number, number]>;
  }) {
    this.getCell = getCell;
    this.chunkSize = chunkSize;
    this.chunkSize2 = chunkSize * chunkSize;
    this.chunkSize3 = chunkSize * chunkSize * chunkSize;
    this.maxCount = this.chunkSize3 * 3;
    this.halfChunkSize = chunkSize / 2;
    this.getCellColor = getCellColor;
    this.delta = 2 / chunkSize;
    this.yDelta = chunkSize;
    this.zDelta = chunkSize * chunkSize;
    this.tmpState = {
      colorList: new Float32Array(12 * 3),
      normalList: new Float32Array(12 * 3),
      vertexList: new Float32Array(12 * 3),
      count: 0,
      positionArray: new Float32Array(this.maxCount * 3),
      normalArray: new Float32Array(this.maxCount * 3),
      colorArray: new Float32Array(this.maxCount * 3),
      uvArray: new Float32Array(this.maxCount * 2),
      normalCache: new Float32Array(this.chunkSize3 * 3),
      chunkCoordinate: { x: 0, y: 0, z: 0 },
    };
  }

  private resetTmpState = () => {
    this.tmpState.count = 0;
    this.tmpState.colorList.fill(0);
    this.tmpState.normalList.fill(0);
    this.tmpState.vertexList.fill(0);
    this.tmpState.positionArray.fill(0);
    this.tmpState.normalArray.fill(0);
    this.tmpState.colorArray.fill(0);
    this.tmpState.uvArray.fill(0);
    this.tmpState.normalCache.fill(0);
  };

  /**
   * Returns the raw voxel data for a chunk as a flat array
   */
  // getChunk = (coord: ChunkCoord) => {
  //   const chunk = new Float32Array(this.chunkSize3);
  //   const { x, y, z } = coord;
  //   const { chunkSize } = this;
  //   for (let i = 0; i < chunkSize; i++) {
  //     for (let j = 0; j < chunkSize; j++) {
  //       for (let k = 0; k < chunkSize; k++) {
  //         chunk[i * chunkSize * chunkSize + j * chunkSize + k] = this.getCachedCell(
  //         );
  //       }
  //     }
  //   }
  //   return chunk;
  // };

  getChunkCoord = (x: number, y: number, z: number) => {
    const { chunkSize } = this;
    return {
      x: Math.floor(x / chunkSize),
      y: Math.floor(y / chunkSize),
      z: Math.floor(z / chunkSize),
    };
  };

  getChunkOffset = () => {
    return (
      this.chunkSize2 * this.tmpState.chunkCoordinate.z +
      this.chunkSize * this.tmpState.chunkCoordinate.y +
      this.tmpState.chunkCoordinate.x
    );
  };

  /**
   * Computes the polgonized geometry of a chunk
   */
  getChunkGeometry = (coord: ChunkCoord) => {
    this.resetTmpState();
    this.tmpState.chunkCoordinate = coord;

    const startValue = 0;
    const endValue = this.chunkSize;
    for (let z = startValue; z < endValue; z++) {
      const zOffset = this.chunkSize2 * z;
      const fz = (z - this.halfChunkSize) / this.halfChunkSize;
      for (let y = startValue; y < endValue; y++) {
        const yOffset = zOffset + this.chunkSize * y;
        const fy = (y - this.halfChunkSize) / this.halfChunkSize;
        for (let x = startValue; x < endValue; x++) {
          const fx = (x - this.halfChunkSize) / this.halfChunkSize;
          const q = yOffset + x;

          this.polygonize(fx, fy, fz, q, this.isolation);
        }
      }
    }

    return this.tmpState;
  };

  private offsetToChunkCoord = (offset: number) => {
    // get the color based on coordinate extracted from offset
    const z = Math.floor(offset / this.chunkSize2);
    const y = Math.floor((offset - z * this.chunkSize2) / this.chunkSize);
    const x = offset - z * this.chunkSize2 - y * this.chunkSize;

    return { x, y, z };
  };

  private offsetToAbsoluteCoord = (offset: number) => {
    const coord = this.offsetToChunkCoord(offset);
    coord.x += this.tmpState.chunkCoordinate.x * this.chunkSize;
    coord.y += this.tmpState.chunkCoordinate.y * this.chunkSize;
    coord.z += this.tmpState.chunkCoordinate.z * this.chunkSize;
    return coord;
  };

  private getCellColorComponent = (offset: number) => {
    if (!this.getCellColor) return 0;
    const { x, y, z } = this.offsetToAbsoluteCoord(offset);
    // recreate absolute cell position using chunk coordinate from state
    const color = this.getCellColor(x, y, z);
    // index back into the color array using the offset
    return color[offset % 3];
  };

  private getCachedCell = (offset: number) => {
    const { x, y, z } = this.offsetToAbsoluteCoord(offset);
    const absoluteOffset = this.getChunkOffset() + offset;
    if (this.cells.has(absoluteOffset)) {
      return this.cells.get(absoluteOffset)!;
    }
    const cell = this.getCell(x, y, z);
    this.cells.set(absoluteOffset, cell);
    this.readableIndexCells.set(`${x},${y},${z}`, cell);
    return cell;
  };

  /**
   * The Marching Cubes stuff
   */
  private vertexInterpolateX(
    q: number,
    offset: number,
    isol: number,
    x: number,
    y: number,
    z: number,
    valp1: number,
    valp2: number,
    colorOffset1: number,
    colorOffset2: number
  ) {
    const mu = (isol - valp1) / (valp2 - valp1);

    this.tmpState.vertexList[offset + 0] = x + mu * this.delta;
    this.tmpState.vertexList[offset + 1] = y;
    this.tmpState.vertexList[offset + 2] = z;

    this.tmpState.normalList[offset + 0] = lerp(
      this.tmpState.normalCache[q + 0],
      this.tmpState.normalCache[q + 3],
      mu
    );
    this.tmpState.normalList[offset + 1] = lerp(
      this.tmpState.normalCache[q + 1],
      this.tmpState.normalCache[q + 4],
      mu
    );
    this.tmpState.normalList[offset + 2] = lerp(
      this.tmpState.normalCache[q + 2],
      this.tmpState.normalCache[q + 5],
      mu
    );

    this.tmpState.colorList[offset + 0] = lerp(
      this.getCellColorComponent(colorOffset1 * 3 + 0),
      this.getCellColorComponent(colorOffset2 * 3 + 0),
      mu
    );
    this.tmpState.colorList[offset + 1] = lerp(
      this.getCellColorComponent(colorOffset1 * 3 + 1),
      this.getCellColorComponent(colorOffset2 * 3 + 1),
      mu
    );
    this.tmpState.colorList[offset + 2] = lerp(
      this.getCellColorComponent(colorOffset1 * 3 + 2),
      this.getCellColorComponent(colorOffset2 * 3 + 2),
      mu
    );
  }

  private vertexInterpolateY(
    q: number,
    offset: number,
    isol: number,
    x: number,
    y: number,
    z: number,
    valp1: number,
    valp2: number,
    colorOffset1: number,
    colorOffset2: number
  ) {
    const mu = (isol - valp1) / (valp2 - valp1);

    this.tmpState.vertexList[offset + 0] = x;
    this.tmpState.vertexList[offset + 1] = y + mu * this.delta;
    this.tmpState.vertexList[offset + 2] = z;

    const q2 = q + this.yDelta * 3;

    this.tmpState.normalList[offset + 0] = lerp(
      this.tmpState.normalCache[q + 0],
      this.tmpState.normalCache[q2 + 0],
      mu
    );
    this.tmpState.normalList[offset + 1] = lerp(
      this.tmpState.normalCache[q + 1],
      this.tmpState.normalCache[q2 + 1],
      mu
    );
    this.tmpState.normalList[offset + 2] = lerp(
      this.tmpState.normalCache[q + 2],
      this.tmpState.normalCache[q2 + 2],
      mu
    );

    this.tmpState.colorList[offset + 0] = lerp(
      this.getCellColorComponent(colorOffset1 * 3 + 0),
      this.getCellColorComponent(colorOffset2 * 3 + 0),
      mu
    );
    this.tmpState.colorList[offset + 1] = lerp(
      this.getCellColorComponent(colorOffset1 * 3 + 1),
      this.getCellColorComponent(colorOffset2 * 3 + 1),
      mu
    );
    this.tmpState.colorList[offset + 2] = lerp(
      this.getCellColorComponent(colorOffset1 * 3 + 2),
      this.getCellColorComponent(colorOffset2 * 3 + 2),
      mu
    );
  }

  private vertexInterpolateZ(
    q: number,
    offset: number,
    isol: number,
    x: number,
    y: number,
    z: number,
    valp1: number,
    valp2: number,
    colorOffset1: number,
    colorOffset2: number
  ) {
    const mu = (isol - valp1) / (valp2 - valp1);

    this.tmpState.vertexList[offset + 0] = x;
    this.tmpState.vertexList[offset + 1] = y;
    this.tmpState.vertexList[offset + 2] = z + mu * this.delta;

    const q2 = q + this.zDelta * 3;

    this.tmpState.normalList[offset + 0] = lerp(
      this.tmpState.normalCache[q + 0],
      this.tmpState.normalCache[q2 + 0],
      mu
    );
    this.tmpState.normalList[offset + 1] = lerp(
      this.tmpState.normalCache[q + 1],
      this.tmpState.normalCache[q2 + 1],
      mu
    );
    this.tmpState.normalList[offset + 2] = lerp(
      this.tmpState.normalCache[q + 2],
      this.tmpState.normalCache[q2 + 2],
      mu
    );

    this.tmpState.colorList[offset + 0] = lerp(
      this.getCellColorComponent(colorOffset1 * 3 + 0),
      this.getCellColorComponent(colorOffset2 * 3 + 0),
      mu
    );
    this.tmpState.colorList[offset + 1] = lerp(
      this.getCellColorComponent(colorOffset1 * 3 + 1),
      this.getCellColorComponent(colorOffset2 * 3 + 1),
      mu
    );
    this.tmpState.colorList[offset + 2] = lerp(
      this.getCellColorComponent(colorOffset1 * 3 + 2),
      this.getCellColorComponent(colorOffset2 * 3 + 2),
      mu
    );
  }

  private computeNormal(q: number) {
    const q3 = q * 3;
    if (this.tmpState.normalCache[q3] === 0.0) {
      this.tmpState.normalCache[q3 + 0] =
        this.getCachedCell(q - 1) - this.getCachedCell(q + 1);
      this.tmpState.normalCache[q3 + 1] =
        this.getCachedCell(q - this.yDelta) -
        this.getCachedCell(q + this.yDelta);
      this.tmpState.normalCache[q3 + 2] =
        this.getCachedCell(q - this.zDelta) -
        this.getCachedCell(q + this.zDelta);
    }
  }

  polygonize(fx: number, fy: number, fz: number, q: number, isol: number) {
    // cache indices
    let q1 = q + 1,
      qy = q + this.yDelta,
      qz = q + this.zDelta,
      q1y = q1 + this.yDelta,
      q1z = q1 + this.zDelta,
      qyz = q + this.yDelta + this.zDelta,
      q1yz = q1 + this.yDelta + this.zDelta;

    let cubeIndex = 0,
      field0 = this.getCachedCell(q),
      field1 = this.getCachedCell(q1),
      field2 = this.getCachedCell(qy),
      field3 = this.getCachedCell(q1y),
      field4 = this.getCachedCell(qz),
      field5 = this.getCachedCell(q1z),
      field6 = this.getCachedCell(qyz),
      field7 = this.getCachedCell(q1yz);

    if (field0 < isol) cubeIndex |= 1;
    if (field1 < isol) cubeIndex |= 2;
    if (field2 < isol) cubeIndex |= 8;
    if (field3 < isol) cubeIndex |= 4;
    if (field4 < isol) cubeIndex |= 16;
    if (field5 < isol) cubeIndex |= 32;
    if (field6 < isol) cubeIndex |= 128;
    if (field7 < isol) cubeIndex |= 64;

    const bits = cubesValues.edgeTable[cubeIndex];

    // cube is entirely included or excluded; no vertices to render
    if (bits === 0) return 0;

    let fx2 = fx + this.delta,
      fy2 = fy + this.delta,
      fz2 = fz + this.delta;

    // top of the cube
    if (bits & 1) {
      this.computeNormal(q);
      this.computeNormal(q1);
      this.vertexInterpolateX(
        q * 3,
        0,
        isol,
        fx,
        fy,
        fz,
        field0,
        field1,
        q,
        q1
      );
    }

    if (bits & 2) {
      this.computeNormal(q1);
      this.computeNormal(q1y);
      this.vertexInterpolateY(
        q1 * 3,
        3,
        isol,
        fx2,
        fy,
        fz,
        field1,
        field3,
        q1,
        q1y
      );
    }

    if (bits & 4) {
      this.computeNormal(qy);
      this.computeNormal(q1y);
      this.vertexInterpolateX(
        qy * 3,
        6,
        isol,
        fx,
        fy2,
        fz,
        field2,
        field3,
        qy,
        q1y
      );
    }

    if (bits & 8) {
      this.computeNormal(q);
      this.computeNormal(qy);
      this.vertexInterpolateY(
        q * 3,
        9,
        isol,
        fx,
        fy,
        fz,
        field0,
        field2,
        q,
        qy
      );
    }

    // bottom of the cube
    if (bits & 16) {
      this.computeNormal(qz);
      this.computeNormal(q1z);
      this.vertexInterpolateX(
        qz * 3,
        12,
        isol,
        fx,
        fy,
        fz2,
        field4,
        field5,
        qz,
        q1z
      );
    }

    if (bits & 32) {
      this.computeNormal(q1z);
      this.computeNormal(q1yz);
      this.vertexInterpolateY(
        q1z * 3,
        15,
        isol,
        fx2,
        fy,
        fz2,
        field5,
        field7,
        q1z,
        q1yz
      );
    }

    if (bits & 64) {
      this.computeNormal(qyz);
      this.computeNormal(q1yz);
      this.vertexInterpolateX(
        qyz * 3,
        18,
        isol,
        fx,
        fy2,
        fz2,
        field6,
        field7,
        qyz,
        q1yz
      );
    }

    if (bits & 128) {
      this.computeNormal(qz);
      this.computeNormal(qyz);
      this.vertexInterpolateY(
        qz * 3,
        21,
        isol,
        fx,
        fy,
        fz2,
        field4,
        field6,
        qz,
        qyz
      );
    }

    // vertical lines of the cube
    if (bits & 256) {
      this.computeNormal(q);
      this.computeNormal(qz);
      this.vertexInterpolateZ(
        q * 3,
        24,
        isol,
        fx,
        fy,
        fz,
        field0,
        field4,
        q,
        qz
      );
    }
    if (bits & 512) {
      this.computeNormal(q1);
      this.computeNormal(q1z);
      this.vertexInterpolateZ(
        q1 * 3,
        27,
        isol,
        fx2,
        fy,
        fz,
        field1,
        field5,
        q1,
        q1z
      );
    }
    if (bits & 1024) {
      this.computeNormal(q1y);
      this.computeNormal(q1yz);
      this.vertexInterpolateZ(
        q1y * 3,
        30,
        isol,
        fx2,
        fy2,
        fz,
        field3,
        field7,
        q1y,
        q1yz
      );
    }
    if (bits & 2048) {
      this.computeNormal(qy);
      this.computeNormal(qyz);
      this.vertexInterpolateZ(
        qy * 3,
        33,
        isol,
        fx,
        fy2,
        fz,
        field2,
        field6,
        qy,
        qyz
      );
    }

    cubeIndex <<= 4; // re-purpose cube index into an offset into triangle table

    let o1,
      o2,
      o3,
      numTris = 0,
      i = 0;

    while (cubesValues.triTable[cubeIndex + i] !== -1) {
      o1 = cubeIndex + i;
      o2 = o1 + 1;
      o3 = o1 + 2;

      this.posnormtriv({
        o1: 3 * cubesValues.triTable[o1],
        o2: 3 * cubesValues.triTable[o2],
        o3: 3 * cubesValues.triTable[o3],
      });

      i += 3;
      numTris++;
    }

    return numTris;
  }

  posnormtriv({ o1, o2, o3 }: { o1: number; o2: number; o3: number }) {
    const c = this.tmpState.count * 3;

    // positions
    this.tmpState.positionArray[c + 0] = this.tmpState.vertexList[o1 + 0];
    this.tmpState.positionArray[c + 1] = this.tmpState.vertexList[o1 + 1];
    this.tmpState.positionArray[c + 2] = this.tmpState.vertexList[o1 + 2];
    this.tmpState.positionArray[c + 3] = this.tmpState.vertexList[o2 + 0];
    this.tmpState.positionArray[c + 4] = this.tmpState.vertexList[o2 + 1];
    this.tmpState.positionArray[c + 5] = this.tmpState.vertexList[o2 + 2];
    this.tmpState.positionArray[c + 6] = this.tmpState.vertexList[o3 + 0];
    this.tmpState.positionArray[c + 7] = this.tmpState.vertexList[o3 + 1];
    this.tmpState.positionArray[c + 8] = this.tmpState.vertexList[o3 + 2];

    // normals
    if (this.flatShading) {
      const nx =
        (this.tmpState.normalList[o1 + 0] +
          this.tmpState.normalList[o2 + 0] +
          this.tmpState.normalList[o3 + 0]) /
        3;
      const ny =
        (this.tmpState.normalList[o1 + 1] +
          this.tmpState.normalList[o2 + 1] +
          this.tmpState.normalList[o3 + 1]) /
        3;
      const nz =
        (this.tmpState.normalList[o1 + 2] +
          this.tmpState.normalList[o2 + 2] +
          this.tmpState.normalList[o3 + 2]) /
        3;

      this.tmpState.normalArray[c + 0] = nx;
      this.tmpState.normalArray[c + 1] = ny;
      this.tmpState.normalArray[c + 2] = nz;
      this.tmpState.normalArray[c + 3] = nx;
      this.tmpState.normalArray[c + 4] = ny;
      this.tmpState.normalArray[c + 5] = nz;
      this.tmpState.normalArray[c + 6] = nx;
      this.tmpState.normalArray[c + 7] = ny;
      this.tmpState.normalArray[c + 8] = nz;
    } else {
      this.tmpState.normalArray[c + 0] = this.tmpState.normalList[o1 + 0];
      this.tmpState.normalArray[c + 1] = this.tmpState.normalList[o1 + 1];
      this.tmpState.normalArray[c + 2] = this.tmpState.normalList[o1 + 2];
      this.tmpState.normalArray[c + 3] = this.tmpState.normalList[o2 + 0];
      this.tmpState.normalArray[c + 4] = this.tmpState.normalList[o2 + 1];
      this.tmpState.normalArray[c + 5] = this.tmpState.normalList[o2 + 2];
      this.tmpState.normalArray[c + 6] = this.tmpState.normalList[o3 + 0];
      this.tmpState.normalArray[c + 7] = this.tmpState.normalList[o3 + 1];
      this.tmpState.normalArray[c + 8] = this.tmpState.normalList[o3 + 2];
    }

    // uvs
    const d = this.tmpState.count * 2;
    this.tmpState.uvArray[d + 0] = this.tmpState.vertexList[o1 + 0];
    this.tmpState.uvArray[d + 1] = this.tmpState.vertexList[o1 + 2];
    this.tmpState.uvArray[d + 2] = this.tmpState.vertexList[o2 + 0];
    this.tmpState.uvArray[d + 3] = this.tmpState.vertexList[o2 + 2];
    this.tmpState.uvArray[d + 4] = this.tmpState.vertexList[o3 + 0];
    this.tmpState.uvArray[d + 5] = this.tmpState.vertexList[o3 + 2];

    // colors
    this.tmpState.colorArray[c + 0] = this.tmpState.colorList[o1 + 0];
    this.tmpState.colorArray[c + 1] = this.tmpState.colorList[o1 + 1];
    this.tmpState.colorArray[c + 2] = this.tmpState.colorList[o1 + 2];
    this.tmpState.colorArray[c + 3] = this.tmpState.colorList[o2 + 0];
    this.tmpState.colorArray[c + 4] = this.tmpState.colorList[o2 + 1];
    this.tmpState.colorArray[c + 5] = this.tmpState.colorList[o2 + 2];
    this.tmpState.colorArray[c + 6] = this.tmpState.colorList[o3 + 0];
    this.tmpState.colorArray[c + 7] = this.tmpState.colorList[o3 + 1];
    this.tmpState.colorArray[c + 8] = this.tmpState.colorList[o3 + 2];

    this.tmpState.count += 3;
  }
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
