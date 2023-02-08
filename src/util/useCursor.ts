import { useConst } from "@hmans/use-const";
import { useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useState } from "react";

export const useCursor = () => {
  const position = useConst(() => ({ x: 0, y: 0 }));
  const size = useWindowSize();

  useLayoutEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // in NDC [-1, 1]
      position.x = (event.clientX / size.width - 0.5) * 2;
      position.y = (-event.clientY / size.height + 0.5) * 2;
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return position;
};

function useWindowSize() {
  const size = useConst(() => ({ width: 0, height: 0 }));
  useLayoutEffect(() => {
    function updateSize() {
      size.width = window.innerWidth;
      size.height = window.innerHeight;
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);
  return size;
}
