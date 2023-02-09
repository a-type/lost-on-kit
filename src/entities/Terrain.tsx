import { MarchingCube, MarchingCubes, MarchingPlane } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { BufferGeometry, Color } from "three";
import { generateVoxelGeometries } from "../lib/cubes/generateVoxelGeometries";
import { generateMap, TerrainMap } from "../lib/map/generateMap";
import { Chunk, ECS, CHUNK_SIZE, MAP_SIZE, Entity } from "../state";

export interface TerrainProps {}

const terrains = ECS.world.with("terrainChunk");

const RENDER_OFFSETS = [0.5, 0.5, -10.5];

export function Terrain({}: TerrainProps) {
  // useLayoutEffect(() => {
  //   const entities: Entity[] = [];
  //   // first thing to do is load all map chunks
  //   const map = generateMap(CHUNK_SIZE * MAP_SIZE);
  //   function getChunk(x: number, y: number, z: number) {
  //     const subMap: boolean[][][] = [];
  //     for (let i = 0; i < CHUNK_SIZE; i++) {
  //       const subMapY: boolean[][] = [];
  //       for (let j = 0; j < CHUNK_SIZE; j++) {
  //         const subMapZ: boolean[] = [];
  //         for (let k = 0; k < CHUNK_SIZE; k++) {
  //           subMapZ.push(map[x + i][y + j][z + k]);
  //         }
  //         subMapY.push(subMapZ);
  //       }
  //       subMap.push(subMapY);
  //     }
  //     return subMap;
  //   }
  //   for (let x = 0; x < CHUNK_SIZE * MAP_SIZE; x += CHUNK_SIZE) {
  //     for (let y = 0; y < CHUNK_SIZE * MAP_SIZE; y += CHUNK_SIZE) {
  //       for (let z = 0; z < CHUNK_SIZE * MAP_SIZE; z += CHUNK_SIZE) {
  //         const chunk = getChunk(x, y, z);
  //         if (chunk) {
  //           entities.push(
  //             ECS.world.add({
  //               terrainChunk: { x, y, z, voxels: chunk },
  //             })
  //           );
  //         }
  //       }
  //     }
  //   }
  //   return () => {
  //     entities.forEach((e) => {
  //       ECS.world.remove(e);
  //     });
  //   };
  // }, []);

  return (
    <ECS.Entities in={terrains}>
      {(entity) => <TerrainChunk entity={entity} />}
    </ECS.Entities>
  );
}

function TerrainChunk({ entity }: { entity: Chunk }) {
  const geometry = useMarchingCubesGeometry(entity.terrainChunk.voxels);

  if (!geometry) return null;

  const position: [number, number, number] = [
    entity.terrainChunk.x * CHUNK_SIZE + RENDER_OFFSETS[0],
    entity.terrainChunk.y * CHUNK_SIZE + RENDER_OFFSETS[1],
    entity.terrainChunk.z * CHUNK_SIZE + RENDER_OFFSETS[2],
  ];

  return (
    <RigidBody colliders="trimesh" type="fixed" position={position}>
      <mesh receiveShadow geometry={geometry} scale={CHUNK_SIZE}>
        <meshStandardMaterial color={new Color("brown")} />
      </mesh>
    </RigidBody>
  );
}

function useMarchingCubesGeometry(map: TerrainMap) {
  const [geometry, setGeometry] = useState<BufferGeometry>();

  useEffect(() => {
    generateVoxelGeometries({ resolution: CHUNK_SIZE * 2 + 1, map }).then(
      ({ geometry }) => {
        console.log("Terrain worker finished");
        setGeometry(geometry);
      }
    );
  }, [map]);

  return geometry;
}
