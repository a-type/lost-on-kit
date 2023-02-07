import { Box } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { useEffect, useLayoutEffect, useMemo } from "react";
import { generateMap } from "../lib/map/generateMap";
import { archetypes, ECS, Terrain } from "../state";

const terrains = ECS.world.with("isTerrain", "initialPosition");

export const Terrains = () => {
  const map = useMemo(() => generateMap(20), []);

  useEffect(() => {
    for (let x = 0; x < map.length; x++) {
      for (let y = 0; y < map[0].length; y++) {
        spawnTerrain({
          position: [x, y, map[x][y] - 5],
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
              <meshStandardMaterial color="#ffb663" />
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
