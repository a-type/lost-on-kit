import { useFrame } from "@react-three/fiber";
import { useCallback, useRef } from "react";
import { DirectionalLight } from "three";
import { ECS } from "../state";

export const DirectionalLightFollowSystem = () => {
  const lightRef = useRef<DirectionalLight | null>(null);

  const onUpdate = useCallback((self: DirectionalLight) => {
    self.shadow.mapSize.width = 2048;
    self.shadow.mapSize.height = 2048;
    self.shadow.camera.left = -100;
    self.shadow.camera.right = 100;
    self.shadow.camera.top = 100;
    self.shadow.camera.bottom = -100;
  }, []);

  return (
    <directionalLight
      castShadow
      intensity={1}
      position={[0, 0, 100]}
      ref={lightRef}
      onUpdate={onUpdate}
    />
  );
};
