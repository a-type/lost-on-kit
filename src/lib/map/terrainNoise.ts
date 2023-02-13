import { createNoise3D } from "simplex-noise";

const noise = createNoise3D();

const MAX_HEIGHT = 16;
const BASE_DETAIL = 1 / 12;

export function terrainNoise(x: number, y: number, z: number) {
  // make sure there's a floor
  if (z <= 2) {
    return 1;
  }
  const base = noise(x * BASE_DETAIL, y * BASE_DETAIL, z * BASE_DETAIL) + 0.5;
  const detail = 1; //noise(x / 10, y / 10, z / 10) * 0.5 + 0.5;
  // flatten out at higher altitudes on z axis
  const zFactor = Math.max(0, 1 - z / MAX_HEIGHT);
  return Math.round(base * detail * zFactor);
}
