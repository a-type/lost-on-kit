import { useFrame } from "@react-three/fiber";
import { CHUNK_SIZE, ECS } from "../state";
import { vec3 } from "@react-three/rapier";

const revealers = ECS.world.with("chunkRevealer");
const chunks = ECS.world.with("terrainChunk");

const REVEAL_RADIUS = 8;

export function ChunkRevealSystem() {
  useFrame(() => {
    const revealed = new Set<string>();
    const keepRevealed = new Set<string>();

    for (const revealer of revealers) {
      // mark all chunks in a 4 chunk radius as revealed
      const rigidBody = revealer.rigidBody;
      const transform = revealer.transform;

      const position = rigidBody
        ? vec3(rigidBody.translation())
        : transform
        ? transform.position
        : null;

      if (!position) continue;

      const x = Math.floor(position.x / CHUNK_SIZE);
      const y = Math.floor(position.y / CHUNK_SIZE);
      const z = Math.floor(position.z / CHUNK_SIZE);

      for (let dx = -REVEAL_RADIUS; dx <= REVEAL_RADIUS; dx++) {
        for (let dy = -REVEAL_RADIUS; dy <= REVEAL_RADIUS; dy++) {
          revealed.add(`${x + dx},${y + dy}`);
        }
      }
    }

    for (const chunk of chunks) {
      const { x, y } = chunk.terrainChunk;
      const key = `${x},${y}`;
      if (revealed.has(key)) {
        ECS.world.addComponent(chunk, "chunkRevealed", true);
      } else {
        ECS.world.removeComponent(chunk, "chunkRevealed");
      }
    }
  });

  return null;
}
