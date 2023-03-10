import { Vector3 } from "three";
import { CameraRigSystem } from "./systems/CameraRigSystem";
import { DirectionalLightFollowSystem } from "./systems/DirectionalLightFollowSystem";
import { FindNeighborsSystem } from "./systems/FindNeighborsSystem";
import { PickingSystem } from "./systems/PickingSystem";
import { PlayerSystem } from "./systems/PlayerSystem";
import { SpatialHashingSystem } from "./systems/SpatialHashingSystem";
import { ChunkRevealSystem } from "./systems/ChunkRevealSystem";

export const Systems = ({ camera = true }: { camera?: boolean }) => (
  <>
    <SpatialHashingSystem />
    <FindNeighborsSystem />
    <PlayerSystem />
    {camera && <CameraRigSystem offset={new Vector3(0, -5, 15)} />}
    <PickingSystem />
    <DirectionalLightFollowSystem />
    <ChunkRevealSystem />
  </>
);
