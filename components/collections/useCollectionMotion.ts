"use client";

import { useCallback, useEffect, useRef } from "react";

/** Local, cancellable motion. Data and focus changes never depend on animation. */
export function useCollectionMotion() {
  const running = useRef(new Set<Animation>());
  const reduced = useRef(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      reduced.current = preference.matches;
      if (preference.matches) running.current.forEach((animation) => animation.cancel());
    };
    const animations = running.current;
    sync();
    preference.addEventListener("change", sync);
    return () => {
      preference.removeEventListener("change", sync);
      animations.forEach((animation) => animation.cancel());
    };
  }, []);

  return useCallback((element: Element | null, frames: Keyframe[], duration = 280, delay = 0) => {
    if (!element || reduced.current || typeof element.animate !== "function") return Promise.resolve();
    const animation = element.animate(frames, {
      duration, delay, easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards",
    });
    running.current.add(animation);
    return animation.finished.catch(() => {}).finally(() => running.current.delete(animation));
  }, []);
}
