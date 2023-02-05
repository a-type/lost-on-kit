import { Vector3 } from "three";
import { CameraRigSystem } from "./systems/CameraRigSystem";
import { FindNeighborsSystem } from "./systems/FindNeighborsSystem";
import { PhysicsSystem } from "./systems/PhysicsSystem";
import { PlayerSystem } from "./systems/PlayerSystem";
import { SpatialHashingSystem } from "./systems/SpatialHashingSystem";

export const Systems = () => (
  <>
    <SpatialHashingSystem />
    <FindNeighborsSystem />
    <PhysicsSystem />
    <PlayerSystem />
    <CameraRigSystem offset={new Vector3(0, -5, 15)} />
  </>
);
