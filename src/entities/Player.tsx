import { Box } from "@react-three/drei";
import { ECS, PhysicsLayers } from "../state";
import { physics } from "../systems/PhysicsSystem";
import { bitmask } from "../util/bitmask";

export function Player() {
  return (
    <ECS.Entity>
      <ECS.Component name="isPlayer" data={true} />
      <ECS.Component
        name="physics"
        data={physics({
          mass: 10,
          radius: 0.3,
          linearDamping: 0.04,
          angularDamping: 0.02,
          groupMask: bitmask(PhysicsLayers.Player),
          collisionMask: bitmask([PhysicsLayers.Player, PhysicsLayers.Terrain]),
        })}
      />
      <ECS.Component name="spatialHashing" data={true} />
      <ECS.Component name="neighbors" data={[]} />
      <ECS.Component name="transform">
        {/* <mesh>
          <coneGeometry args={[0.5, 1]} />
          <meshStandardMaterial color="hotpink" />
        </mesh> */}
        <Box>
          <meshStandardMaterial color="hotpink" attach="material" />
        </Box>
      </ECS.Component>
    </ECS.Entity>
  );
}
