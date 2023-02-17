import { PrismaticImpulseJoint } from "@dimforge/rapier3d-compat";
import {
  PrismaticJointParams,
  UseImpulseJoint,
  useImpulseJoint,
  useRapier,
} from "@react-three/rapier";
import { Vector3 } from "three";

const vectorArrayToVector3 = (arr: [number, number, number]) => {
  const [x, y, z] = arr;
  return new Vector3(x, y, z);
};

export const usePrismaticJoint: UseImpulseJoint<
  PrismaticJointParams,
  PrismaticImpulseJoint
> = (body1, body2, [body1Anchor, body2Anchor, axis, limits]) => {
  const { rapier } = useRapier();

  const params = rapier.JointData.prismatic(
    vectorArrayToVector3(body1Anchor),
    vectorArrayToVector3(body2Anchor),
    vectorArrayToVector3(axis)
  );

  if (limits) {
    params.limitsEnabled = true;
    params.limits = limits;
  }

  return useImpulseJoint<PrismaticImpulseJoint>(body1, body2, params);
};
