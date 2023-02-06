import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { ECS } from "../state";
import { vec3 } from "@react-three/rapier";

const bodyTarget = new Vector3();
const lookTarget = new Vector3();

const players = ECS.world.with("isPlayer", "rigidBody");
const cameras = ECS.world.with("isCamera", "transform");

export const CameraRigSystem = ({
  offset = new Vector3(),
}: {
  offset?: Vector3;
}) => {
  useFrame((_, dt) => {
    const [player] = players;
    const [camera] = cameras;

    if (!player || !camera) {
      console.warn("No player or camera");
      return;
    }

    const playerPos = vec3(player.rigidBody.translation());
    bodyTarget.copy(playerPos).add(offset);
    lookTarget.copy(camera.transform.position).sub(offset);

    camera.transform.position.lerp(bodyTarget, dt * 3);
    camera.transform.lookAt(lookTarget);
  });

  return null;
};
