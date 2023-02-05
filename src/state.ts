import { World, With, Bucket } from "miniplex";
import createReactAPI from "miniplex/react";
import { ReactNode } from "react";
import { Object3D } from "three";
import { PhysicsData } from "./systems/PhysicsSystem";

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

  physics?: PhysicsData;

  render?: ReactNode;
};

export type Player = With<Entity, "isPlayer" | "transform" | "physics">;

export type Camera = With<Entity, "isCamera" | "transform">;

export type Terrain = With<Entity, "isTerrain" | "transform" | "physics">;

export type PhysicsEntity = With<Entity, "transform" | "physics">;

const world = new World<Entity>();

export const ECS = createReactAPI(world);

function isTerrain(entity: Entity): entity is Terrain {
  return entity.isTerrain === true;
}

export const archetypes = {
  terrains: world.with("isTerrain"),
};
