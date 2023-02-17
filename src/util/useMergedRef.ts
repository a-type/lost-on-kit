import { MutableRefObject, Ref, useCallback } from "react";

export function useMergedRef<T>(...refs: Ref<T>[]) {
  return useCallback((node: T) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as MutableRefObject<T>).current = node;
      }
    });
  }, refs);
}
