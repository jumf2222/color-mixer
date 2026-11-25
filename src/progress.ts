import { LEVELS } from "./levels";

/** Best star count per level index. */
export type Progress = Record<number, number>;

const SAVE_KEY = "color-mixer-progress";

export function loadProgress(): Progress {
  try {
    return JSON.parse(localStorage.getItem(SAVE_KEY) ?? "{}") ?? {};
  } catch {
    return {};
  }
}

export function saveProgress(p: Progress) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(p));
  } catch {
    // Storage blocked (private mode etc.) — progress just won't persist.
  }
}

/** Index of the first level not yet beaten (the furthest unlocked level). */
export function firstUnbeaten(p: Progress) {
  let i = 0;
  while (i < LEVELS.length - 1 && p[i]) i++;
  return i;
}
