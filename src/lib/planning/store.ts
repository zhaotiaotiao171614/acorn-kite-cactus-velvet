import { create } from "zustand";
import { PLANNING_EVENTS } from "./events";
import { emptySnapshot, reduceEvents } from "./reduce";
import type { RunSnapshot } from "./types";

export type Speed = 1 | 2 | 4;

type PlanningState = {
  snapshot: RunSnapshot;
  cursor: number;
  play: "idle" | "running" | "paused" | "completed";
  speed: Speed;
  startRun: () => void;
  setSpeed: (speed: Speed) => void;
  skip: () => void;
  pause: () => void;
  resume: () => void;
  tickTo: (index: number) => void;
};

export const usePlanningStore = create<PlanningState>((set, get) => ({
  snapshot: emptySnapshot(),
  cursor: -1,
  play: "idle",
  speed: 2,

  setSpeed: (speed) => set({ speed }),

  tickTo: (index) => {
    const snapshot = reduceEvents(PLANNING_EVENTS, index);
    set({
      cursor: index,
      snapshot,
      play: snapshot.headerStatus === "completed" ? "completed" : get().play,
    });
  },

  pause: () => {
    if (get().play === "running") set({ play: "paused" });
  },

  resume: () => {
    if (get().play === "paused") set({ play: "running" });
  },

  skip: () => {
    const last = PLANNING_EVENTS.length - 1;
    set({
      cursor: last,
      snapshot: reduceEvents(PLANNING_EVENTS, last),
      play: "completed",
    });
  },

  startRun: () => {
    set({
      snapshot: emptySnapshot(),
      cursor: -1,
      play: "running",
    });
  },
}));
