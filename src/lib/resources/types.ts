export enum ResourceKind {
  Red = 1,
  Green = 2,
  Blue = 3,
  Purple = 5,
  Gold = 6,
}

export type ResourceData = {
  kind: ResourceKind;
  quantity: number;
  position: [number, number, number];
};
