import { BufferAttribute, BufferGeometry } from "three";

import { TerrainWorkerData, CloudWorkerResult } from "./types";

function concatenate(a: Float32Array, b: Float32Array, length: number) {
  const result = new Float32Array(a.length + length);
  result.set(a, 0);
  result.set(b.slice(0, length), a.length);
  return result;
}

export const generateVoxelGeometries = ({
  resolution,
  map,
  color,
  position,
}: {
  resolution: number;
  map: boolean[][][];
  color: [number, number, number];
  position: [number, number, number];
}) => {
  const chunkData: TerrainWorkerData = {
    resolution,
    map,
    color,
    position,
  };

  const worker = new Worker(new URL("./cubes.worker.ts", import.meta.url), {
    type: "module",
  });
  return new Promise<{ geometry: BufferGeometry }>((resolve, reject) => {
    worker.addEventListener("message", (ev) => {
      const data = ev.data as CloudWorkerResult;

      const geometry = new BufferGeometry();
      let positionArray = new Float32Array();
      let normalArray = new Float32Array();
      let colorArray = new Float32Array();
      let uvArray = new Float32Array();

      if (data.hasPositions) {
        console.log("Has positions");
        if (data.positionArray.some((v) => isNaN(v))) {
          console.log("NANs in position array!");
        }
        positionArray = concatenate(
          positionArray,
          data.positionArray,
          data.count * 3
        );
        geometry.setAttribute(
          "position",
          new BufferAttribute(positionArray, 3)
        );
      }
      if (data.hasNormals) {
        console.log("Has normals");
        normalArray = concatenate(
          normalArray,
          data.normalArray,
          data.count * 3
        );
        geometry.setAttribute("normal", new BufferAttribute(normalArray, 3));
      }
      if (data.hasColors) {
        console.log("Has colors");
        colorArray = concatenate(colorArray, data.colorArray, data.count * 3);
        geometry.setAttribute("color", new BufferAttribute(colorArray, 3));
      }
      if (data.hasUvs) {
        console.log("Has uvs");
        uvArray = concatenate(uvArray, data.uvArray, data.count * 2);
        geometry.setAttribute("uv", new BufferAttribute(uvArray, 2));
      }

      // this actually screws up our perfectly good normals from
      // generation!
      geometry.computeVertexNormals();
      // seems to have issues.
      geometry.computeBoundingSphere();

      resolve({ geometry });
    });

    worker.postMessage(chunkData);
  });
};
