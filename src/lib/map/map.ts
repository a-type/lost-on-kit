import { CHUNK_SIZE } from "../../state";
import { MarchingCubesChunks2 } from "../cubes/MarchingCubesChunks2";
import { terrainNoise } from "./terrainNoise";

export const map = new MarchingCubesChunks2({
  getCell: terrainNoise,
  chunkSize: CHUNK_SIZE,
});
