import { ArchetypeBucket } from "miniplex";
import { ECS, PhysicsCollision, PhysicsGroup, PhysicsLayers } from "../state";
import { useFrame } from "@react-three/fiber";
import {
  useSphericalJoint,
  usePrismaticJoint,
  vec3,
  RigidBody,
  useRapier,
} from "@react-three/rapier";
import {
  useState,
  RefObject,
  createRef,
  MutableRefObject,
  forwardRef,
  Fragment,
  useRef,
  useEffect,
} from "react";
import { RigidBody as RapierRigidBody } from "@dimforge/rapier3d-compat";
import {
  CubicBezierLine,
  QuadraticBezierLine,
  Sphere,
} from "@react-three/drei";
import { Vector3 } from "three";
import { useMergedRef } from "../util/useMergedRef";

export interface WiresProps {}

const wires = ECS.world.with("wire");
type WireEnt = typeof wires extends ArchetypeBucket<infer T> ? T : never;

export function Wires({}: WiresProps) {
  return <ECS.Entities in={wires}>{(ent) => <Wire ent={ent} />}</ECS.Entities>;
}

function Wire({ ent }: { ent: WireEnt }) {
  const [segments, setSegments] = useState<
    MutableRefObject<RapierRigidBody | null>[]
  >(new Array(10).fill(null).map(() => createRef()));

  const startRef = useRef(ent.wire.start);
  const endRef = useRef<RapierRigidBody | null>(null);

  if (segments.length < 2) return null;

  const start = vec3(ent.wire.start.translation());
  const end = vec3(ent.wire.end.translation());

  return (
    <group>
      <ECS.Component name="wireSegments" data={segments} />
      {segments.map((ref, i) => {
        const position = start.clone().lerp(end, (i + 1) / segments.length);

        return (
          <WireSegment
            key={i}
            ref={ref}
            position={[position.x, position.y, position.z]}
          />
        );
      })}
      {segments.map((ref, i) => (
        <WireLink
          key={i}
          prev={i === 0 ? startRef : segments[i - 1]}
          next={ref}
        />
      ))}
      <WireLink prev={segments[segments.length - 1]} next={endRef} />
      <WireEnd ref={endRef} target={ent.wire.end} />
    </group>
  );
}

const wireCollisionGroup = PhysicsGroup.Wire & PhysicsCollision.Terrain;

const WireSegment = forwardRef<
  RapierRigidBody,
  {
    position: [number, number, number];
  }
>(function WireSegment({ position }, ref) {
  return (
    <RigidBody
      position={position}
      colliders="ball"
      type="dynamic"
      // sensor
      collisionGroups={wireCollisionGroup}
      ref={ref}
      includeInvisible
    >
      <Sphere args={[0.25]}>
        <meshBasicMaterial color="black" attach="material" />
      </Sphere>
    </RigidBody>
  );
});

// a link contains a spherical joint that connects
// two rigid bodies, and a prismatic joint connected to
// the next link in the chain. this allows free rotation
// and extension
const WireLink = ({
  prev,
  next,
}: {
  prev: RefObject<RapierRigidBody>;
  next: RefObject<RapierRigidBody>;
}) => {
  const startAnchorRef = useRef<RapierRigidBody>(null);
  const endAnchorRef = useRef<RapierRigidBody>(null);
  useSphericalJoint(prev, startAnchorRef, [
    [0, 0, 0],
    [0, 0, 0],
  ]);
  const prismatic = usePrismaticJoint(startAnchorRef, endAnchorRef, [
    [0, 0, 0],
    [0, 0, 0],
    [1, 0, 0],
    [0, 1],
  ]);
  useSphericalJoint(endAnchorRef, next, [
    [0, 0, 0],
    [0, 0, 0],
  ]);
  const lineRef = useRef<any>(null);

  useFrame(() => {
    if (lineRef.current && prev.current && next.current) {
      lineRef.current.setPoints(
        vec3(prev.current.translation()),
        vec3(next.current.translation())
      );
    }
  });

  const world = useRapier();

  useEffect(() => {
    if (prismatic.current) {
      // prismatic.current.configureMotorVelocity(-0.5, 0.5);
      prismatic.current.configureMotorPosition(0, 0.5, 0.5);
      prismatic.current.setContactsEnabled(true);
    }
  }, [prismatic]);

  return (
    <>
      <RigidBody
        ref={startAnchorRef}
        type="dynamic"
        includeInvisible
        collisionGroups={wireCollisionGroup}
      >
        <Sphere args={[0.25]} visible={false}>
          <meshBasicMaterial color="black" attach="material" />
        </Sphere>
      </RigidBody>
      <RigidBody
        ref={endAnchorRef}
        type="dynamic"
        includeInvisible
        collisionGroups={wireCollisionGroup}
      >
        <Sphere args={[0.25]} visible={false}>
          <meshBasicMaterial color="black" attach="material" />
        </Sphere>
      </RigidBody>
      <QuadraticBezierLine
        ref={lineRef}
        lineWidth={3}
        color="#000000"
        start={vec3(prev.current?.translation() || new Vector3())}
        end={vec3(next.current?.translation() || new Vector3())}
      />
    </>
  );

  // useSphericalJoint(
  //   prev,
  //   next,
  //   [
  //     [-1, 0, 0],
  //     [1, 0, 0],
  //   ]
  // );

  // return null;
};

// wire end copies the position of the
// end object
const WireEnd = forwardRef<RapierRigidBody, { target: RapierRigidBody }>(
  function WireEnd({ target }, ref) {
    const internalRef = useRef<RapierRigidBody>(null);
    useFrame(() => {
      if (internalRef.current && target) {
        internalRef.current.setNextKinematicTranslation(target.translation());
      }
    });

    const finalRef = useMergedRef(internalRef, ref);

    return (
      <RigidBody
        type="kinematicPosition"
        includeInvisible
        collisionGroups={wireCollisionGroup}
        ref={finalRef}
      >
        <Sphere args={[0.25]} visible={false}>
          <meshBasicMaterial color="black" attach="material" />
        </Sphere>
      </RigidBody>
    );
  }
);
