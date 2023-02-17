import { MarchingCube, MarchingCubes, MarchingPlane } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { BufferGeometry, Color, Euler } from "three";
import { generateVoxelGeometries } from "../lib/cubes/generateVoxelGeometries";
import { generateMap, TerrainMap } from "../lib/map/generateMap";
import {
  Chunk,
  ECS,
  CHUNK_SIZE,
  MAP_SIZE,
  Entity,
  PhysicsGroup,
  PhysicsCollision,
} from "../state";
import { MarchingCubesChunks } from "../lib/cubes/MarchingCubesChunks";
import { perlin3 } from "../lib/noise/perlin";
import { toThreeGeometry } from "../lib/cubes/toThreeGeometry";
import { ErrorBoundary } from "../ErrorBoundary";
import { useConst } from "@hmans/use-const";
import { MarchingCubesChunks2 } from "../lib/cubes/MarchingCubesChunks2";
import { terrainNoise } from "../lib/map/terrainNoise";

export interface TerrainProps {}

const terrains = ECS.world.with("terrainChunk", "chunkRevealed");

const RENDER_OFFSETS = [0.5, 0.5, -16.5];

export function Terrain({}: TerrainProps) {
  return (
    <ECS.Entities in={terrains}>
      {(entity) => <TerrainChunk entity={entity} />}
    </ECS.Entities>
  );
}

function TerrainChunk({ entity }: { entity: Chunk }) {
  const map = useConst(
    () =>
      new MarchingCubesChunks2({
        getCell: terrainNoise,
        chunkSize: CHUNK_SIZE,
      })
  );
  (window as any).map = map;
  const geometry = useMarchingCubesGeometry(map, entity);

  const debugColor = useMemo(() => {
    const c = new Color();
    c.setHSL(Math.random(), 1, 0.5);
    return c;
  }, []);

  if (!geometry) return null;

  const position: [number, number, number] = [
    entity.terrainChunk.x * CHUNK_SIZE + RENDER_OFFSETS[0],
    entity.terrainChunk.y * CHUNK_SIZE + RENDER_OFFSETS[1],
    entity.terrainChunk.z * CHUNK_SIZE + RENDER_OFFSETS[2],
  ];

  return (
    <ErrorBoundary>
      <ECS.Component name="rigidBody">
        <RigidBody
          colliders="trimesh"
          type="fixed"
          position={position}
          collisionGroups={
            PhysicsGroup.Terrain |
            PhysicsCollision.Player |
            PhysicsCollision.Tool |
            PhysicsCollision.Wire
          }
          // rotation={new Euler(0, Math.PI, -Math.PI)}
        >
          <mesh
            userData={{
              isTerrain: true,
            }}
            receiveShadow
            geometry={geometry}
            scale={CHUNK_SIZE}
          >
            <meshStandardMaterial color={0xec6d40} />
          </mesh>
        </RigidBody>
      </ECS.Component>
    </ErrorBoundary>
  );
}

function useMarchingCubesGeometry(map: MarchingCubesChunks2, chunk: Chunk) {
  const [geometry] = useState<BufferGeometry | null>(() => {
    const result = map.polygonizeChunk(
      chunk.terrainChunk.x,
      chunk.terrainChunk.y,
      chunk.terrainChunk.z
    );
    console.log(result);
    return toThreeGeometry(result);
  });
  return geometry;
}
