import { Box, useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { Mesh } from "three";
import { ToolData } from "../lib/tools/data";
import { ECS, PhysicsCollision, PhysicsGroup } from "../state";
import { ArchetypeBucket } from "miniplex";
import { useCharacterController } from "../lib/useCharacterController";
import { useCallback } from "react";
import { ThreeEvent } from "@react-three/fiber";

const tools = ECS.world.with("tool", "initialPosition");
type ToolEnt = typeof tools extends ArchetypeBucket<infer T> ? T : never;

export function Tools() {
  return <ECS.Entities in={tools}>{(ent) => <Tool ent={ent} />}</ECS.Entities>;
}

function Tool({ ent }: { ent: ToolEnt }) {
  const controller = useCharacterController({
    offset: 0.1,
    snapToGround: 0.5,
  });

  const onClick = useCallback((ev: ThreeEvent<MouseEvent>) => {
    // start a wire from the tool to the player
    const [player] = ECS.world.with("isPlayer", "rigidBody");
    ECS.world.add({
      wire: {
        start: ent.rigidBody!,
        startOffset: [0, 0, 0],
        end: player.rigidBody!,
        endOffset: [0, 0, 0],
      },
      wireSegments: [],
    });
  }, []);

  return (
    <>
      {controller && (
        <ECS.Component name="characterController" data={controller} />
      )}
      <ECS.Component name="rigidBody">
        <RigidBody
          type="kinematicPosition"
          colliders="cuboid"
          mass={1000}
          position={ent.initialPosition}
          // collisionGroups={
          //   PhysicsGroup.Tool |
          //   PhysicsCollision.Terrain |
          //   PhysicsCollision.Player
          // }
        >
          <Box onClick={onClick} args={[0.75, 0.75, 0.75]}>
            <meshPhongMaterial attach="material" color="white" />
          </Box>
        </RigidBody>
      </ECS.Component>
    </>
  );
}

const meshMap: Record<ToolData["type"], string> = {
  "solar-panel": "machine_generator",
  extractor: "machine_wireless",
  storage: "machine_barrel",
};

function ToolMesh({ tool }: { tool: ToolData }) {
  const name = meshMap[tool.type];

  const scene = useGLTF(`/models/${name}.glb`, true);
  const mesh = scene.scene.children[0] as Mesh;
  const copy = mesh.clone();

  return <primitive object={copy} position={[0, 0, 0]} scale={1} />;
}
