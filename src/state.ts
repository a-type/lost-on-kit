import { World, With, Bucket } from "miniplex";
import createReactAPI from "miniplex/react";
import { ReactNode } from "react";
import { Object3D } from "three";
import { RapierRigidBody as RigidBody } from "@react-three/rapier";
import type { KinematicCharacterController } from "@dimforge/rapier3d-compat";
import { ToolData } from "./lib/tools/data";
import { generateMap } from "./lib/map/generateMap";

export const PhysicsLayers = {
  Player: 1,
};

export const UpdatePriority = {
  Early: -100,
  Normal: 0,
  Late: 100,
  Render: 200,
} as const;

export const CHUNK_SIZE = 16;
export const MAP_SIZE = 1;

export type Entity = {
  isPlayer?: true;
  isCamera?: true;

  transform?: Object3D;
  destroy?: true;

  health?: number;

  spatialHashing?: true;
  neighbors?: Entity[];

  rigidBody?: RigidBody;
  characterController?: KinematicCharacterController;

  terrainChunk?: {
    x: number;
    y: number;
    z: number;
    // TODO: better data structure
    voxels: boolean[][][];
  };

  tool?: ToolData;
  initialPosition?: [number, number, number];

  render?: ReactNode;
};

export type Player = With<Entity, "isPlayer" | "rigidBody">;

export type Camera = With<Entity, "isCamera" | "transform">;

export type PhysicsEntity = With<Entity, "rigidBody">;

export type Tool = With<Entity, "tool" | "rigidBody">;

export type Chunk = With<Entity, "terrainChunk">;

const world = new World<Entity>();

export const ECS = createReactAPI(world);

export const archetypes = {};

const map = generateMap(CHUNK_SIZE * MAP_SIZE);
function getChunk(x: number, y: number, z: number) {
  const subMap: boolean[][][] = [];
  for (let i = 0; i < CHUNK_SIZE; i++) {
    const subMapY: boolean[][] = [];
    for (let j = 0; j < CHUNK_SIZE; j++) {
      const subMapZ: boolean[] = [];
      for (let k = 0; k < CHUNK_SIZE; k++) {
        subMapZ.push(map[x + i][y + j][z + k]);
      }
      subMapY.push(subMapZ);
    }
    subMap.push(subMapY);
  }
  return subMap;
}
for (let x = 0; x < CHUNK_SIZE * MAP_SIZE; x += CHUNK_SIZE) {
  for (let y = 0; y < CHUNK_SIZE * MAP_SIZE; y += CHUNK_SIZE) {
    for (let z = 0; z < CHUNK_SIZE * MAP_SIZE; z += CHUNK_SIZE) {
      const chunk = getChunk(x, y, z);
      if (chunk) {
        // entities.push(
        ECS.world.add({
          terrainChunk: { x, y, z, voxels: chunk },
        });
        // );
      }
    }
  }
}
