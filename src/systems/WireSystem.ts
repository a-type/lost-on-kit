import { useFrame } from "@react-three/fiber";
import { ECS } from "../state";
import { vec3 } from "@react-three/rapier";

const wires = ECS.world.with("wire", "wireSegments");

export function WireSystem() {
  useFrame(() => {
    for (const wire of wires) {
      const { start, end } = wire.wire;
      const { wireSegments } = wire;

      // if the end is the player, add segments at a regular interval
      // to make the wire look like it's moving with the player

      if ((end.userData as any)?.type === "player") {
        // if the player is 2 units away from the previous
        // segment, add a new segment
        const lastSegment =
          wireSegments[wireSegments.length - 1] || vec3(start.translation());
        const playerPos = vec3(end.translation());
        const distance = lastSegment.distanceTo(playerPos);
        if (distance > 2) {
          wireSegments.push(playerPos);
        }
      }
    }
  });
}
