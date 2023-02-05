import { useLayoutEffect } from "react";
import { useSegmentedBucket } from "../lib/SegmentedBucket";
import { archetypes, ECS, PhysicsLayers, Terrain } from "../state";
import { Composable, Modules } from "material-composer-r3f";
import { $, Input, InstanceID, Lerp, Round } from "shader-composer";
import { Random } from "shader-composer-toybox";
import { InstancedParticles, Particle, ParticleProps } from "vfx-composer-r3f";
import { Color, Vector3 } from "three";
import { RenderableEntity } from "./RenderableEntity";
import { physics } from "../systems/PhysicsSystem";
import { bitmask } from "../util/bitmask";

export const InstanceRNG =
  ({ seed }: { seed?: Input<"float"> } = {}) =>
  (offset: Input<"float"> = Math.random() * 10) =>
    Random($`${offset} + float(${InstanceID}) * 1.1005`);

export const Terrains = () => {
  const terrains = archetypes.terrains;
  // const segmentedTerrains = useSegmentedBucket(archetypes.terrains);

  useLayoutEffect(() => {
    const size = 50;
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        spawnTerrain({
          position: [Math.floor(x - size / 2), Math.floor(y - size / 2), -1],
        });
      }
    }

    return () => {
      for (const terrain of archetypes.terrains) {
        ECS.world.remove(terrain);
      }
    };
  }, []);

  const rand = InstanceRNG();

  return (
    <InstancedParticles capacity={20000}>
      <boxGeometry />
      <Composable.MeshStandardMaterial metalness={0.1} roughness={0.8}>
        <Modules.Color
          color={Lerp(new Color("#444"), new Color("#888"), Round(rand(12)))}
        />
      </Composable.MeshStandardMaterial>

      {/* {segmentedTerrains.entities.map((bucket, i) => (
        <ECS.Entities key={i} in={bucket} children={RenderableEntity} />
      ))} */}
      <ECS.Entities in={terrains} children={RenderableEntity} />
    </InstancedParticles>
  );
};

const tmpVec3 = new Vector3();

export function spawnTerrain(props: ParticleProps, scale = 1) {
  const entity = ECS.world.add({
    isTerrain: true,

    health: 1000,

    physics: physics({
      radius: scale,
      restitution: 0.1,
      mass: 40 * scale,
      linearDamping: 0.01,
      angularDamping: 0.01,

      groupMask: bitmask(PhysicsLayers.Terrain),
      collisionMask: bitmask([PhysicsLayers.Player]),
    }),

    spatialHashing: true,
    neighbors: [],

    render: (
      <ECS.Component name="transform">
        <Particle {...props} scale={scale} />
      </ECS.Component>
    ),
  });

  return entity as Terrain;
}
