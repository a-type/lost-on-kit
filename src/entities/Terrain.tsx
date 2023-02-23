import {
  Box,
  MarchingCube,
  MarchingCubes,
  MarchingPlane,
} from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { BufferGeometry, Color, Euler } from "three";
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
import { perlin3 } from "../lib/noise/perlin";
import { toThreeGeometry } from "../lib/cubes/toThreeGeometry";
import { ErrorBoundary } from "../ErrorBoundary";
import { useConst } from "@hmans/use-const";
import { MarchingCubesChunks2 } from "../lib/cubes/MarchingCubesChunks2";
import { terrainNoise } from "../lib/map/terrainNoise";
import { map } from "../lib/map/map";
import { ResourceData, ResourceKind } from "../lib/resources/types";

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
      <group position={position}>
        {entity.terrainChunk.resources.map((resource, i) => (
          <Resource key={i} resource={resource} />
        ))}
      </group>
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
    return toThreeGeometry(result);
  });
  return geometry;
}

function Resource({ resource }: { resource: ResourceData }) {
  return (
    <Box args={[1.05, 1.05, 1.05]} position={resource.position}>
      <meshStandardMaterial color={getColor(resource.kind)} attach="material" />
    </Box>
  );
}

function getColor(kind: ResourceKind) {
  switch (kind) {
    case ResourceKind.Blue:
      return "blue";
    case ResourceKind.Green:
      return "green";
    case ResourceKind.Red:
      return "red";
    case ResourceKind.Purple:
      return "purple";
    case ResourceKind.Gold:
      return "yellow";
  }
}
