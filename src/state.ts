import { World, With, Bucket } from "miniplex";
import createReactAPI from "miniplex/react";
import { ReactNode, RefObject } from "react";
import { Object3D } from "three";
import { RapierRigidBody as RigidBody } from "@react-three/rapier";
import type { KinematicCharacterController } from "@dimforge/rapier3d-compat";
import { ToolData } from "./lib/tools/data";

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

export const CHUNK_SIZE = 6;
export const MAP_SIZE = 4;

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
  };

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
};

export type Player = With<Entity, "isPlayer" | "rigidBody">;

export type Camera = With<Entity, "isCamera" | "transform">;

export type PhysicsEntity = With<Entity, "rigidBody">;

export type Tool = With<Entity, "tool" | "rigidBody">;

export type Chunk = With<Entity, "terrainChunk">;

const world = new World<Entity>();

export const ECS = createReactAPI(world);

export const archetypes = {};

for (let x = 0; x < MAP_SIZE; x += 1) {
  for (let y = 0; y < MAP_SIZE; y += 1) {
    for (let z = 0; z < MAP_SIZE; z += 1) {
      // const z = 0;
      // entities.push(
      ECS.world.add({
        terrainChunk: { x, y, z },
      });
      // );
    }
  }
}
