import { Box } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Event, Intersection, Mesh, Object3D, Vector3 } from "three";
import { ECS } from "../state";
import { useCursor } from "../util/useCursor";

const tmpIntersects: Intersection<Object3D<Event>>[] = [];
const tmpPoint = new Vector3();

export const PickingSystem = () => {
  const mouse = useCursor();

  const cursorRef = useRef<Object3D | null>(null);

  useFrame((state, dt) => {
    state.raycaster.setFromCamera(mouse, state.camera);
    tmpIntersects.length = 0;
    state.raycaster.intersectObjects(state.scene.children, true, tmpIntersects);
    if (tmpIntersects.length > 0) {
      let index = 0;
      let intersection = tmpIntersects[0];
      while (
        intersection &&
        (!intersection.object.userData?.isTerrain ||
          intersection.object === cursorRef.current)
      ) {
        intersection = tmpIntersects[++index];
      }
      if (intersection) {
        // move cursor to the position, snapped to grid, Z + 1
        tmpPoint.copy(intersection.point);
        tmpPoint.x = Math.round(tmpPoint.x);
        tmpPoint.y = Math.round(tmpPoint.y);
        tmpPoint.z = Math.round(tmpPoint.z) + 0.5;
        cursorRef.current?.position.copy(tmpPoint);
      }
    }
  });

  const onClick = () => {
    if (!cursorRef.current) return;
    const initialPosition = [
      cursorRef.current.position.x,
      cursorRef.current.position.y,
      cursorRef.current.position.z,
    ] as [number, number, number];
    ECS.world.add({
      initialPosition,
      tool: {
        type: "solar-panel",
      },
      toolState: {
        falling: false,
        fallTime: 0,
      },
    });
  };

  return (
    <Box ref={cursorRef} onClick={onClick}>
      {/* Transparent blue */}
      <meshBasicMaterial
        attach="material"
        color="blue"
        transparent
        opacity={0.5}
      />
    </Box>
  );
};
