import { World, With, Bucket } from "miniplex";
import createReactAPI from "miniplex/react";
import { ReactNode, RefObject } from "react";
import { Object3D } from "three";
import { RapierRigidBody as RigidBody } from "@react-three/rapier";
import type { KinematicCharacterController } from "@dimforge/rapier3d-compat";
import { ToolData } from "./lib/tools/data";
import { ResourceData, ResourceKind } from "./lib/resources/types";

/* prettier-ignore */
export const PhysicsCollision = {
  Player:  0b0000_0000_0000_0000_0000_0000_0000_0001,
  Terrain: 0b0000_0000_0000_0000_0000_0000_0000_0010,
  Tool:    0b0000_0000_0000_0000_0000_0000_0000_0100,
  Wire:    0b0000_0000_0000_0000_0000_0000_0000_1000,
  All:     0b0000_0000_0000_0000_0000_0000_1111_1111,
};
/* prettier-ignore */
export const PhysicsGroup = {
  Player:  0b0000_0000_0000_0001_0000_0000_0000_0000,
  Terrain: 0b0000_0000_0000_0010_0000_0000_0000_0000,
  Tool:    0b0000_0000_0000_0100_0000_0000_0000_0000,
  Wire:    0b0000_0000_0000_1000_0000_0000_0000_0000,
  All:     0b1111_1111_1111_1111_0000_0000_0000_0000,
};

export const UpdatePriority = {
  Early: -100,
  Normal: 0,
  Late: 100,
  Render: 200,
} as const;

export const CHUNK_SIZE = 8;
export const MAP_SIZE = 128;
export const MAP_HEIGHT = 4;

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
    resources: ResourceData[];
  };
  chunkRevealed?: boolean;

  tool?: ToolData;
  toolState?: {
    falling: boolean;
    fallTime: number;
  };
  initialPosition?: [number, number, number];

  wire?: {
    start: RigidBody;
    startOffset: [number, number, number];
    end: RigidBody;
    endOffset: [number, number, number];
  };
  wireSegments?: RefObject<RigidBody>[];

  render?: ReactNode;

  chunkRevealer?: boolean;

  inventoryResources?: {
    [Kind in ResourceKind]: number;
  };
};

export type Player = With<Entity, "isPlayer" | "rigidBody">;

export type Camera = With<Entity, "isCamera" | "transform">;

export type PhysicsEntity = With<Entity, "rigidBody">;

export type Tool = With<Entity, "tool" | "rigidBody">;

export type Chunk = With<Entity, "terrainChunk">;

const world = new World<Entity>();

export const ECS = createReactAPI(world);

export const archetypes = {};

const halfMapSize = MAP_SIZE / 2;
for (let x = -halfMapSize; x < halfMapSize; x += 1) {
  for (let y = -halfMapSize; y < halfMapSize; y += 1) {
    for (let z = -1; z < MAP_HEIGHT; z += 1) {
      ECS.world.add({
        terrainChunk: {
          x,
          y,
          z,
          resources: new Array(4).fill(null).map(() => ({
            kind: Math.floor(Math.random() * 5) + 1,
            quantity: Math.floor(Math.random() * 100) + 1,
            position: [
              x * CHUNK_SIZE + Math.random() * CHUNK_SIZE,
              y * CHUNK_SIZE + Math.random() * CHUNK_SIZE,
              z * CHUNK_SIZE + Math.random() * CHUNK_SIZE,
            ],
          })),
        },
      });
    }
  }
}
