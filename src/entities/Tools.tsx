import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { Mesh } from "three";
import { ToolData } from "../lib/tools/data";
import { ECS } from "../state";

const tools = ECS.world.with("tool", "initialPosition");

export function Tools() {
  return (
    <ECS.Entities in={tools}>
      {(ent) => (
        <>
          <ECS.Component name="rigidBody">
            <RigidBody
              type="dynamic"
              colliders="cuboid"
              mass={100}
              position={ent.initialPosition}
            >
              <ToolMesh tool={ent.tool} />
            </RigidBody>
          </ECS.Component>
        </>
      )}
    </ECS.Entities>
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
