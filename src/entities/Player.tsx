import { Sphere } from "@react-three/drei";
import { RigidBody, useRapier } from "@react-three/rapier";
import { useEffect, useState } from "react";
import { ECS, PhysicsCollision, PhysicsGroup } from "../state";
import { useCharacterController } from "../lib/useCharacterController";
import { ResourceKind } from "../lib/resources/types";

export function Player() {
  const controller = useCharacterController({
    offset: 0.1,
    autoStep: {
      height: 0.5,
      minDistance: 0.2,
      dynamic: false,
    },
    maxSlopeAngleDeg: 60,
    minSlopeSlideAngleDeg: 20,
    slideEnabled: true,
    snapToGround: 0.5,
    applyImpulsesToDynamicBodies: true,
  });

  if (!controller) return null;

  return (
    <ECS.Entity>
      <ECS.Component name="isPlayer" data={true} />
      <ECS.Component name="chunkRevealer" data={true} />
      <ECS.Component name="characterController" data={controller} />
      <ECS.Component name="rigidBody">
        <RigidBody
          type="kinematicPosition"
          colliders="ball"
          collisionGroups={
            PhysicsGroup.Player |
            PhysicsCollision.Terrain |
            PhysicsCollision.Tool
          }
          userData={{
            type: "player",
          }}
        >
          <Sphere castShadow receiveShadow args={[0.333]}>
            <meshStandardMaterial color="hotpink" attach="material" />
          </Sphere>
        </RigidBody>
      </ECS.Component>
      <ECS.Component name="spatialHashing" data={true} />
      <ECS.Component name="neighbors" data={[]} />
      <ECS.Component
        name="inventoryResources"
        data={{
          [ResourceKind.Blue]: 0,
          [ResourceKind.Green]: 0,
          [ResourceKind.Red]: 0,
          [ResourceKind.Purple]: 0,
          [ResourceKind.Gold]: 0,
        }}
      />
    </ECS.Entity>
  );
}
