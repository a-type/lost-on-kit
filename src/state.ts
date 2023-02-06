import { World, With, Bucket } from "miniplex";
import createReactAPI from "miniplex/react";
import { ReactNode } from "react";
import { Object3D } from "three";
import { RapierRigidBody as RigidBody } from "@react-three/rapier";
import type { KinematicCharacterController } from "@dimforge/rapier3d-compat";

export const PhysicsLayers = {
  Player: 1,
  Terrain: 2,
};

export const UpdatePriority = {
  Early: -100,
  Normal: 0,
  Late: 100,
  Render: 200,
} as const;

export type Entity = {
  isPlayer?: true;
  isTerrain?: true;
  isCamera?: true;

  transform?: Object3D;
  destroy?: true;

  health?: number;

  spatialHashing?: true;
  neighbors?: Entity[];

  rigidBody?: RigidBody;
  characterController?: KinematicCharacterController;

  render?: ReactNode;

  initialPosition?: [number, number, number];
};

export type Player = With<Entity, "isPlayer" | "rigidBody">;

export type Camera = With<Entity, "isCamera" | "transform">;

export type Terrain = With<Entity, "isTerrain" | "rigidBody">;

export type PhysicsEntity = With<Entity, "rigidBody">;

const world = new World<Entity>();

export const ECS = createReactAPI(world);

function isTerrain(entity: Entity): entity is Terrain {
  return entity.isTerrain === true;
}

export const archetypes = {
  // terrains: world.with(["isTerrain", "initialPosition"]),
};
