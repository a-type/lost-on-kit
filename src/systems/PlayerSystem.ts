import { useFrame } from "@react-three/fiber";
import { hasComponents } from "miniplex";
import { Vector3 } from "three";
import { ECS, Entity, Player } from "../state";
import { useKeyboard } from "../util/useKeyboard";

function isPlayer(entity: Entity): entity is Player {
  return hasComponents(entity, "isPlayer");
}

const players = ECS.world.with("isPlayer");

const tmpVec3 = new Vector3();

export const PlayerSystem = () => {
  const keyboard = useKeyboard();

  useFrame((_, dt) => {
    const [player] = players;
    if (!player) return;

    const input = {
      x:
        keyboard.getAxis("KeyA", "KeyD") +
        keyboard.getAxis("ArrowLeft", "ArrowRight"),
      y:
        keyboard.getAxis("KeyW", "KeyS") +
        keyboard.getAxis("ArrowUp", "ArrowDown"),
    };

    if (input.x !== 0 || input.y !== 0) {
      tmpVec3.set(input.x * 10, -input.y * 10, 0);
      player.physics.velocity.addScaledVector(tmpVec3, dt);
      player.physics.sleeping = false;
    }
  });

  return null;
};
