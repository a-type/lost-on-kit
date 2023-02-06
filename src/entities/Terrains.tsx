import { Box } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { useEffect, useLayoutEffect } from "react";
import { archetypes, ECS, Terrain } from "../state";

const terrains = ECS.world.with("isTerrain", "initialPosition");

export const Terrains = () => {
  useEffect(() => {
    const size = 20;
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        spawnTerrain({
          position: [
            Math.floor(x - size / 2),
            Math.floor(y - size / 2),
            Math.random() < 0.1 ? -4 : -5,
          ],
        });
      }
    }

    return () => {
      for (const terrain of terrains) {
        ECS.world.remove(terrain);
      }
    };
  }, []);

  return (
    <ECS.Entities in={terrains}>
      {(entity) => (
        <ECS.Component name="rigidBody">
          <RigidBody
            type="fixed"
            colliders="cuboid"
            position={entity.initialPosition}
            includeInvisible
          >
            <Box>
              <meshStandardMaterial color="brown" />
            </Box>
          </RigidBody>
        </ECS.Component>
      )}
    </ECS.Entities>
  );
};

export function spawnTerrain({
  position,
}: {
  position: [number, number, number];
}) {
  const entity = ECS.world.add({
    isTerrain: true,

    health: 1000,

    spatialHashing: true,
    neighbors: [],

    initialPosition: position,
  });

  return entity as Terrain;
}
