import type { KinematicCharacterController } from "@dimforge/rapier3d-compat";
import { useRapier } from "@react-three/rapier";
import { useEffect, useState } from "react";
import { degToRad } from "three/src/math/MathUtils";

export function useCharacterController(options: {
  offset?: number;
  autoStep?: {
    height: number;
    minDistance: number;
    dynamic: boolean;
  };
  maxSlopeAngleDeg?: number;
  minSlopeSlideAngleDeg?: number;
  slideEnabled?: boolean;
  snapToGround?: number;
  applyImpulsesToDynamicBodies?: boolean;
}) {
  const rapier = useRapier();

  const [controller, setController] =
    useState<KinematicCharacterController | null>(null);

  useEffect(() => {
    const world = rapier.world.raw();

    const characterController = world.createCharacterController(
      options.offset ?? 0.1
    );

    // TODO: do I really want Z to be up?
    characterController.setUp({
      x: 0,
      y: 0,
      z: 1,
    });

    if (options.autoStep) {
      characterController.enableAutostep(
        options.autoStep.height,
        options.autoStep.minDistance,
        options.autoStep.dynamic
      );
    }
    characterController.setMaxSlopeClimbAngle(
      degToRad(options.maxSlopeAngleDeg ?? 0)
    );
    characterController.setMinSlopeSlideAngle(
      degToRad(options.minSlopeSlideAngleDeg ?? 90)
    );
    characterController.setSlideEnabled(!!options.slideEnabled);
    if (options.snapToGround) {
      characterController.enableSnapToGround(options.snapToGround);
    }
    characterController.setApplyImpulsesToDynamicBodies(
      !!options.applyImpulsesToDynamicBodies
    );

    setController(characterController);
    return () => {
      // characterController.free();
      rapier.world.raw().removeCharacterController(characterController);
    };
  }, [rapier]);

  return controller;
}
