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
const timeToJumpApex = 1;
const maxJumpHeight = 4;
const minJumpHeight = 1;
const jumpGravity = -(2 * maxJumpHeight) / (timeToJumpApex * timeToJumpApex);
const maxJumpVelocity = Math.abs(jumpGravity) * timeToJumpApex;
const minJumpVelocity = Math.sqrt(2 * Math.abs(jumpGravity) * minJumpHeight);

let jumpVelocity = 0;
let holdingJump = false;
let jumpTime = 0;
let jumping = false;

export const PlayerSystem = () => {
  const keyboard = useKeyboard();

  useFrame((state, dt) => {
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
      jump: keyboard.getKey("Space"),
    };

    if (input.x !== 0 || input.y !== 0) {
      tmpInputVec.set(input.x * moveSpeed * dt, -input.y * moveSpeed * dt, 0);
    } else {
      tmpInputVec.set(0, 0, 0);
    }

    tmpVelocity.copy(vec3(rigidBody.linvel()));
    const grounded = controller.computedGrounded();

    if (input.jump && grounded) {
      console.log("jump");
      jumping = true;
      holdingJump = true;
      jumpTime = state.clock.elapsedTime;
      jumpVelocity = maxJumpVelocity;
    }

    if (!input.jump && grounded) {
      jumping = false;
    }

    if (jumping && holdingJump && !input.jump) {
      if (jumpVelocity > minJumpVelocity) {
        jumpVelocity = minJumpVelocity;
      }
    }

    if (!input.jump && grounded) {
      jumpVelocity = 0;
    } else {
      jumpVelocity += jumpGravity * dt;
    }

    holdingJump = !!input.jump;

    tmpInputVec.setZ(jumpVelocity * dt);

    console.log(jumpVelocity, tmpInputVec);
    controller.computeColliderMovement(collider, tmpInputVec);

    tmpTranslation.copy(vec3(rigidBody.translation()));
    tmpMovement.copy(vec3(controller.computedMovement()));
    tmpTranslation.addScaledVector(tmpMovement, 1);
    rigidBody.setNextKinematicTranslation(tmpTranslation);
  });

  return null;
};
