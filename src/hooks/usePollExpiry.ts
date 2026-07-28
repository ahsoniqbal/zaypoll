"use client";

import { useCallback, useSyncExternalStore } from "react";

const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function subscribe(notify: () => void) {
  listeners.add(notify);

  if (!timer) {
    timer = setInterval(() => {
      listeners.forEach((listener) => listener());
    }, 1_000);
  }

  return () => {
    listeners.delete(notify);

    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

export function usePollExpiry(expiresAt: string | null, initiallyExpired: boolean) {
  const expiryTime = expiresAt ? Date.parse(expiresAt) : null;
  const subscribeWhileActive = useCallback(
    (notify: () => void) => {
      if (expiryTime === null || expiryTime <= Date.now()) return () => undefined;
      return subscribe(notify);
    },
    [expiryTime],
  );
  const getSnapshot = useCallback(
    () => expiryTime !== null && expiryTime <= Date.now(),
    [expiryTime],
  );
  const getServerSnapshot = useCallback(() => initiallyExpired, [initiallyExpired]);

  return useSyncExternalStore(subscribeWhileActive, getSnapshot, getServerSnapshot);
}
