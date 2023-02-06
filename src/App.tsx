import {
  Environment,
  Loader,
  OrthographicCamera,
  PerspectiveCamera,
} from "@react-three/drei";
import { StrictMode, Suspense } from "react";
import * as RC from "render-composer";
import { Player } from "./entities/Player";
import { Terrains } from "./entities/Terrains";
import { PixelationEffect } from "./lib/PixelationEffect";
import { ECS } from "./state";
import { Systems } from "./Systems";

function App() {
  return (
    <>
      <Loader />
      <RC.Canvas shadows dpr={1}>
        <StrictMode>
          <RC.RenderPipeline>
            <RC.EffectPass>
              {/* <RC.SMAAEffect /> */}
              <RC.SelectiveBloomEffect intensity={3} />
              <RC.TiltShiftEffect focusArea={2.5} kernelSize={2} feather={10} />
              {/* <RC.VignetteEffect /> */}
              <PixelationEffect granularity={2} />
            </RC.EffectPass>

            <color args={["#223"]} attach="background" />

            <Suspense>
              <Environment preset="sunset" />

              <ambientLight intensity={0.5} />
              <directionalLight position={[0, 0, 1]} intensity={1.5} />

              {/* Main camera */}
              <ECS.Entity>
                <ECS.Component name="isCamera" data={true} />
                <ECS.Component name="transform">
                  <PerspectiveCamera position={[0, 0, 10]} makeDefault />
                </ECS.Component>
              </ECS.Entity>

              {/* Game entities */}
              <Player />
              <Terrains />

              <Systems />
            </Suspense>
          </RC.RenderPipeline>
        </StrictMode>
      </RC.Canvas>
    </>
  );
}

export default App;
