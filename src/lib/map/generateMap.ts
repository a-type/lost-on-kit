// heightmap: voxel array
export type TerrainMap = boolean[][][];

export function generateMap(size = 100) {
  const map: TerrainMap = [];
  for (let i = 0; i < size; i++) {
    map.push([]);
    for (let j = 0; j < size; j++) {
      map[i].push([]);
      for (let k = 0; k < size; k++) {
        map[i][j].push(Math.random() * 4 + 1 > k);
      }
    }
  }
  return map;
}
