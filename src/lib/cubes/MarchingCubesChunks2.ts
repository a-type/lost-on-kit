import { createNoise3D } from "simplex-noise";
import { edgeTable, cornerOffsets } from "./cubesValues";
import { triTable as triTable } from "./cubesValues2";
import { LinearToSRGB } from "three/src/math/ColorManagement";

const noise = createNoise3D();

// revisiting the whole idea using https://polycoding.net/marching-cubes/part-1/#intro
export class MarchingCubesChunks2 {
  getCell;
  chunkSize;
  isoLevel = 0.5;

  constructor({
    getCell,
    chunkSize,
  }: {
    getCell?: (x: number, y: number, z: number) => number;
    chunkSize: number;
  }) {
    this.getCell =
      getCell ||
      ((x: number, y: number, z: number) => {
        return noise(x / chunkSize, y / chunkSize, z / chunkSize) + 0.5;
      });
    this.chunkSize = chunkSize;
  }

  private get halfChunkSize() {
    return this.chunkSize / 2;
  }

  private indexFromCoordinate = (x: number, y: number, z: number) => {
    return x + this.chunkSize * (y + this.chunkSize * z);
  };

  polygonizeChunk = (cx: number, cy: number, cz: number) => {
    const vertices: number[] = [];
    for (let x = 0; x < this.chunkSize; x += 1) {
      for (let y = 0; y < this.chunkSize; y += 1) {
        for (let z = 0; z < this.chunkSize; z += 1) {
          this.polygonizeCube(
            x - this.halfChunkSize,
            y - this.halfChunkSize,
            z - this.halfChunkSize,
            x + cx * this.chunkSize,
            y + cy * this.chunkSize,
            z + cz * this.chunkSize,
            vertices
          );
        }
      }
    }

    const positionArray = new Float32Array(vertices.length);
    for (let i = 0; i < vertices.length; i += 1) {
      positionArray[i] = vertices[i];
    }
    return {
      positionArray,
      count: positionArray.length / 3,
    };
  };

  /**
   * Polygonizes a cube and adds the resulting triangles to the vertex buffer.
   */
  polygonizeCube = (
    localX: number,
    localY: number,
    localZ: number,
    wx: number,
    wy: number,
    wz: number,
    vertexBuffer: number[]
  ) => {
    let cubeIndex = 0;

    let localCorners = cornerOffsets.map(([ox, oy, oz]) => {
      return {
        x: localX + ox,
        y: localY + oy,
        z: localZ + oz,
      };
    });
    // localCorners = cornerOffsets.map((offset) => ({
    //   x: offset[0],
    //   y: offset[1],
    //   z: offset[2],
    // }));
    const worldCorners = cornerOffsets.map((offset) => {
      const [ox, oy, oz] = offset;
      return {
        x: wx + ox,
        y: wy + oy,
        z: wz + oz,
      };
    });
    // corners = worldCorners;

    const cornerValues = worldCorners.map(({ x, y, z }) =>
      this.getCell(x, y, z)
    );
    // cornerValues[0] = this.getCell(wx, wy, wz);
    // cornerValues[1] = this.getCell(wx + 1, wy, wz);
    // cornerValues[2] = this.getCell(wx + 1, wy + 1, wz);
    // cornerValues[3] = this.getCell(wx, wy + 1, wz);
    // cornerValues[4] = this.getCell(wx, wy, wz + 1);
    // cornerValues[5] = this.getCell(wx + 1, wy, wz + 1);
    // cornerValues[6] = this.getCell(wx + 1, wy + 1, wz + 1);
    // cornerValues[7] = this.getCell(wx, wy + 1, wz + 1);

    if (cornerValues[0] < this.isoLevel) cubeIndex |= 1;
    if (cornerValues[1] < this.isoLevel) cubeIndex |= 2;
    if (cornerValues[2] < this.isoLevel) cubeIndex |= 4;
    if (cornerValues[3] < this.isoLevel) cubeIndex |= 8;
    if (cornerValues[4] < this.isoLevel) cubeIndex |= 16;
    if (cornerValues[5] < this.isoLevel) cubeIndex |= 32;
    if (cornerValues[6] < this.isoLevel) cubeIndex |= 64;
    if (cornerValues[7] < this.isoLevel) cubeIndex |= 128;

    if (edgeTable[cubeIndex] === 0) {
      return;
    }

    const vertexList = new Array<{ x: number; y: number; z: number }>(12);
    if (edgeTable[cubeIndex] & 1) {
      vertexList[0] = this.interpolate(
        localCorners[0],
        localCorners[1],
        cornerValues[0],
        cornerValues[1]
      );
    }
    if (edgeTable[cubeIndex] & 2) {
      vertexList[1] = this.interpolate(
        localCorners[1],
        localCorners[2],
        cornerValues[1],
        cornerValues[2]
      );
    }
    if (edgeTable[cubeIndex] & 4) {
      vertexList[2] = this.interpolate(
        localCorners[2],
        localCorners[3],
        cornerValues[2],
        cornerValues[3]
      );
    }
    if (edgeTable[cubeIndex] & 8) {
      vertexList[3] = this.interpolate(
        localCorners[3],
        localCorners[0],
        cornerValues[3],
        cornerValues[0]
      );
    }
    if (edgeTable[cubeIndex] & 16) {
      vertexList[4] = this.interpolate(
        localCorners[4],
        localCorners[5],
        cornerValues[4],
        cornerValues[5]
      );
    }
    if (edgeTable[cubeIndex] & 32) {
      vertexList[5] = this.interpolate(
        localCorners[5],
        localCorners[6],
        cornerValues[5],
        cornerValues[6]
      );
    }
    if (edgeTable[cubeIndex] & 64) {
      vertexList[6] = this.interpolate(
        localCorners[6],
        localCorners[7],
        cornerValues[6],
        cornerValues[7]
      );
    }
    if (edgeTable[cubeIndex] & 128) {
      vertexList[7] = this.interpolate(
        localCorners[7],
        localCorners[4],
        cornerValues[7],
        cornerValues[4]
      );
    }
    if (edgeTable[cubeIndex] & 256) {
      vertexList[8] = this.interpolate(
        localCorners[0],
        localCorners[4],
        cornerValues[0],
        cornerValues[4]
      );
    }
    if (edgeTable[cubeIndex] & 512) {
      vertexList[9] = this.interpolate(
        localCorners[1],
        localCorners[5],
        cornerValues[1],
        cornerValues[5]
      );
    }
    if (edgeTable[cubeIndex] & 1024) {
      vertexList[10] = this.interpolate(
        localCorners[2],
        localCorners[6],
        cornerValues[2],
        cornerValues[6]
      );
    }
    if (edgeTable[cubeIndex] & 2048) {
      vertexList[11] = this.interpolate(
        localCorners[3],
        localCorners[7],
        cornerValues[3],
        cornerValues[7]
      );
    }

    let v0, v1, v2;
    for (let i = 0; triTable[cubeIndex][i] !== -1; i += 3) {
      v0 = vertexList[triTable[cubeIndex][i]];
      v1 = vertexList[triTable[cubeIndex][i + 1]];
      v2 = vertexList[triTable[cubeIndex][i + 2]];
      vertexBuffer.push(
        v0.x / this.chunkSize,
        v0.y / this.chunkSize,
        v0.z / this.chunkSize
      );
      vertexBuffer.push(
        v1.x / this.chunkSize,
        v1.y / this.chunkSize,
        v1.z / this.chunkSize
      );
      vertexBuffer.push(
        v2.x / this.chunkSize,
        v2.y / this.chunkSize,
        v2.z / this.chunkSize
      );
    }
  };

  interpolate = (
    v0: { x: number; y: number; z: number },
    v1: { x: number; y: number; z: number },
    val0: number,
    val1: number
  ) => {
    const t = (this.isoLevel - val0) / (val1 - val0);
    return {
      x: v0.x + t * (v1.x - v0.x),
      y: v0.y + t * (v1.y - v0.y),
      z: v0.z + t * (v1.z - v0.z),
    };
  };
}
