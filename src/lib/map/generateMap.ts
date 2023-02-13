// heightmap: voxel array
export type TerrainMap = boolean[][][];

export function generateMap(size = 100) {
  const map: TerrainMap = [];
  for (let i = 0; i < size; i++) {
    map.push([]);
    for (let j = 0; j < size; j++) {
      map[i].push([]);
      map[i][j][0] = false;
      for (let k = 1; k < size - 1; k++) {
        map[i][j].push(Math.random() > 0.5);
      }
      map[i][j][size - 1] = true;
    }
  }
  return map;
}

// place a block every 4 blocks
export function generateTestMap(size = 100) {
  const map: TerrainMap = [];
  for (let i = 0; i < size; i++) {
    map.push([]);
    for (let j = 0; j < size; j++) {
      map[i].push([]);
      map[i][j][0] = false;
      for (let k = 1; k < size; k++) {
        map[i][j].push(Math.random() > 0.5);
      }
    }
  }
  return map;
}
