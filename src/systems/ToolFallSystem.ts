import { useFrame } from "@react-three/fiber";
import { ECS } from "../state";
import { vec3 } from "@react-three/rapier";

const tools = ECS.world.with("toolState", "characterController", "rigidBody");

/**
 * Moves tools downward when they are not held up by the ground
 */
export const ToolFallSystem = () => {
  useFrame((state, dt) => {
    for (const tool of tools) {
      const controller = tool.characterController;
      const rigidBody = tool.rigidBody;
      const toolState = tool.toolState;

      const collider = rigidBody.collider(0);
      if (!collider) {
        continue;
      }

      if (controller.computedGrounded()) {
        toolState.falling = false;
        continue;
      }

      if (!toolState.falling) {
        toolState.falling = true;
        toolState.fallTime = state.clock.elapsedTime;
      }

      const fallTime = state.clock.elapsedTime - toolState.fallTime;
      const fallDistance = fallTime * 9.8;

      const translation = vec3(rigidBody.translation());
      translation.z -= fallDistance;

      controller.computeColliderMovement(collider, translation);

      rigidBody.setNextKinematicTranslation(controller.computedMovement());
    }
  });
};
