import { MarchingCube, MarchingCubes, MarchingPlane } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { useEffect, useMemo, useState } from "react";
import { BufferGeometry, Color } from "three";
import { generateVoxelGeometries } from "../lib/cubes/generateVoxelGeometries";
import { generateMap } from "../lib/map/generateMap";
import { ECS } from "../state";
import { spawnTerrain } from "./Terrains";

export interface TerrainProps {}

const terrains = ECS.world.with("isTerrain", "initialPosition");

const size = 32;

export function Terrain({}: TerrainProps) {
  const map = useMemo(() => generateMap(size), []);

  const [geometry, setGeometry] = useState<BufferGeometry>();

  useEffect(() => {
    generateVoxelGeometries({ resolution: size * 2 + 1, map }).then(
      ({ geometry }) => {
        console.log("Terrain worker finished");
        setGeometry(geometry);
      }
    );
  }, [map]);

  if (!geometry) return null;

  return (
    <RigidBody colliders="trimesh" type="fixed" position={[0.5, 0.5, -10.5]}>
      <mesh receiveShadow geometry={geometry} scale={size}>
        <meshPhongMaterial color={new Color("green")} />
      </mesh>
    </RigidBody>
  );
}
