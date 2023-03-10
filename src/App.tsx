import { Environment, Loader, PerspectiveCamera } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import { Suspense } from "react";
import * as RC from "render-composer";
import { Systems } from "./Systems";
import { Player } from "./entities/Player";
import { Terrain } from "./entities/Terrain";
import { Tools } from "./entities/Tools";
import { Wires } from "./entities/Wires";
import { PixelationEffect } from "./lib/PixelationEffect";
import { ECS } from "./state";

function App() {
  return (
    <>
      <Loader />
      <RC.Canvas shadows="soft" strict>
        <RC.RenderPipeline>
          <RC.EffectPass>
            {/* <RC.SelectiveBloomEffect intensity={3} /> */}
            {/* <RC.TiltShiftEffect focusArea={2.5} kernelSize={2} feather={10} /> */}
            <PixelationEffect granularity={4} />
          </RC.EffectPass>

          <color args={["#223"]} attach="background" />

          <Suspense>
            <Physics gravity={[0, 0, -5]}>
              <Environment preset="sunset" />

              <ambientLight intensity={0.05} />

              {/* Main camera */}
              <ECS.Entity>
                <ECS.Component name="isCamera" data={true} />
                <ECS.Component name="transform">
                  <PerspectiveCamera makeDefault position={[0, -5, 10]} />
                </ECS.Component>
              </ECS.Entity>

              {/* Game entities */}
              <Player />
              <Terrain />
              <Tools />
              <Wires />
              {/* <Resources /> */}

              <Systems />
              {/* <Debug /> */}
              {/* <OrbitControls /> */}
            </Physics>
          </Suspense>
        </RC.RenderPipeline>
      </RC.Canvas>
    </>
  );
}

export default App;
