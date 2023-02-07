import { Sphere } from "@react-three/drei";
import { RigidBody, useRapier } from "@react-three/rapier";
import { useEffect, useState } from "react";
import { ECS } from "../state";

export function Player() {
  const rapier = useRapier();

  const [controller, setController] = useState<any>(null);

  useEffect(() => {
    const world = rapier.world.raw();

    const characterController = world.createCharacterController(0.1);

    // TODO: do I really want Z to be up?
    characterController.setUp({
      x: 0,
      y: 0,
      z: 1,
    });

    characterController.enableAutostep(
      (Math.PI / 2) * 1.01, // max slope angle
      // min width
      0.3,
      true // enable dynamic bodies
    );
    characterController.enableSnapToGround(0.1);
    characterController.setApplyImpulsesToDynamicBodies(true);

    setController(characterController);
    return () => {
      // characterController.free();
      rapier.world.raw().removeCharacterController(characterController);
    };
  }, [rapier]);

  if (!controller) return null;

  return (
    <ECS.Entity>
      <ECS.Component name="isPlayer" data={true} />
      <ECS.Component name="characterController" data={controller} />
      <ECS.Component name="rigidBody">
        <RigidBody type="kinematicPosition" colliders="ball">
          <Sphere args={[0.333]}>
            <meshStandardMaterial color="hotpink" attach="material" />
          </Sphere>
        </RigidBody>
      </ECS.Component>
      <ECS.Component name="spatialHashing" data={true} />
      <ECS.Component name="neighbors" data={[]} />
    </ECS.Entity>
  );
}
