import { useSyncExternalStore } from "react";

const MIN_BIRDS = 1;
const MAX_BIRDS = 8;

let birdCount: number | undefined;

const subscribe = () => () => {};

const getSnapshot = () => {
  birdCount ??=
    MIN_BIRDS + Math.floor(Math.random() * (MAX_BIRDS - MIN_BIRDS + 1));
  return birdCount;
};

export const useBirdCount = () =>
  useSyncExternalStore(subscribe, getSnapshot, () => MIN_BIRDS);
