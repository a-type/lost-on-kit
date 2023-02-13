import { World, With, Bucket } from "miniplex";
import createReactAPI from "miniplex/react";
import { ReactNode } from "react";
import { Object3D } from "three";
import { RapierRigidBody as RigidBody } from "@react-three/rapier";
import type { KinematicCharacterController } from "@dimforge/rapier3d-compat";
import { ToolData } from "./lib/tools/data";
import { generateMap, generateTestMap } from "./lib/map/generateMap";

export const PhysicsLayers = {
  Player: 1,
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
