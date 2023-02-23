import {
  BufferAttribute,
  BufferGeometry,
  DynamicDrawUsage,
  Usage,
} from "three";

export function toThreeGeometry(data: {
  positionArray: Float32Array;
  normalArray?: Float32Array;
  colorArray?: Float32Array;
  uvArray?: Float32Array;
  count: number;
}) {
  const geometry = new BufferGeometry();
  let positionArray = new Float32Array();
  let normalArray = new Float32Array();
  let colorArray = new Float32Array();
  let uvArray = new Float32Array();

  if (data.positionArray.length > 0) {
    // console.log("Has positions");
    if (data.positionArray.some((v) => isNaN(v))) {
      console.warn("NANs in position array!");
    }
    positionArray = data.positionArray;
  } else {
    console.debug("No positions");
  }
  const positionAttr = new BufferAttribute(positionArray, 3);
  positionAttr.setUsage(DynamicDrawUsage);
  geometry.setAttribute("position", positionAttr);

  const allZeroes = positionArray.every((v) => v === 0);

  if (allZeroes) return null;

  // if (data.normalArray && data.normalArray.length > 0) {
  //   // console.log("Has normals");
  //   normalArray = data.normalArray;
  // } else {
  //   console.log("No normals");
  // }
  // const normalAttr = new BufferAttribute(normalArray, 3);
  // normalAttr.setUsage(DynamicDrawUsage);
  // geometry.setAttribute("normal", normalAttr);

  // if (data.colorArray && data.colorArray.length > 0) {
  //   // console.log("Has colors");
  //   colorArray = data.colorArray;
  // } else {
  //   console.log("No colors");
  // }
  // geometry.setAttribute("color", new BufferAttribute(colorArray, 3));

  // if (data.uvArray && data.uvArray.length > 0) {
  //   // console.log("Has uvs");
  //   uvArray = data.uvArray;
  // } else {
  //   console.log("No uvs");
  // }
  // geometry.setAttribute("uv", new BufferAttribute(uvArray, 2));

  geometry.computeBoundingSphere();
  geometry.computeBoundingBox();
  if (!data.normalArray) {
    geometry.computeVertexNormals();
  }

  // geometry.setDrawRange(0, data.count);

  return geometry;
}

function concatenate(a: Float32Array, b: Float32Array, length: number) {
  const result = new Float32Array(a.length + length);
  result.set(a, 0);
  result.set(b.slice(0, length), a.length);
  return result;
}
