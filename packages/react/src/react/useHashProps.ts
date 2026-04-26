import { useSyncExternalStore } from "react";
import { parseHashProps } from "@probability-nz/lib";
import type { HashProps } from "@probability-nz/types";

// eslint-disable-next-line promise/prefer-await-to-callbacks
const subscribe = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => {
    window.removeEventListener("hashchange", cb);
  };
};
const getSnapshot = () => location.hash;

/**
 * Parsed {@link HashProps} from `location.hash`, reactive to `hashchange`.
 * Returns `undefined` if the hash is missing or unparseable.
 * @group Core
 */
export function useHashProps(): HashProps | undefined {
  const hash = useSyncExternalStore(subscribe, getSnapshot);
  return parseHashProps(hash);
}
