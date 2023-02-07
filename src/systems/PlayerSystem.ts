import { useFrame } from "@react-three/fiber";
import { vec3 } from "@react-three/rapier";
import { hasComponents } from "miniplex";
import { Vector3 } from "three";
import { ECS, Entity, Player } from "../state";
import { useKeyboard } from "../util/useKeyboard";

function isPlayer(entity: Entity): entity is Player {
  return hasComponents(entity, "isPlayer");
}

const players = ECS.world.with("isPlayer", "rigidBody", "characterController");

const tmpInputVec = new Vector3();
const tmpVelocity = new Vector3();
const tmpTranslation = new Vector3();
const tmpMovement = new Vector3();

const moveSpeed = 3;
const gravity = 1;

export const PlayerSystem = () => {
  const keyboard = useKeyboard();

  useFrame((_, dt) => {
    const [player] = players;
    if (!player) return;

    if (!player.rigidBody.numColliders()) {
      console.warn("No player colliders");
      return;
    }
    const collider = player.rigidBody.collider(0);
    const controller = player.characterController;
    const rigidBody = player.rigidBody;

    if (!controller) {
      console.warn("No player controller");
      return;
    }

    const input = {
      x:
        keyboard.getAxis("KeyA", "KeyD") +
        keyboard.getAxis("ArrowLeft", "ArrowRight"),
      y:
        keyboard.getAxis("KeyW", "KeyS") +
        keyboard.getAxis("ArrowUp", "ArrowDown"),
    };

    if (input.x !== 0 || input.y !== 0) {
      tmpInputVec.set(input.x, -input.y, 0);
    } else {
      tmpInputVec.set(0, 0, 0);
    }

    tmpVelocity.copy(vec3(rigidBody.linvel()));
    const grounded = controller.computedGrounded();
    if (!grounded) {
      // TODO: real gravity
      tmpInputVec.z = -gravity;
    }

    controller.computeColliderMovement(collider, tmpInputVec);

    tmpTranslation.copy(vec3(rigidBody.translation()));
    tmpMovement.copy(vec3(controller.computedMovement()));
    tmpTranslation.addScaledVector(tmpMovement, dt * moveSpeed);
    rigidBody.setNextKinematicTranslation(tmpTranslation);
  });

  return null;
};
