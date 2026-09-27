import { useEffect, useRef } from "react";
import { PLANNING_EVENTS } from "@/lib/planning/events";
import { usePlanningStore } from "@/lib/planning/store";

export function useEventPlayback() {
  const play = usePlanningStore((s) => s.play);
  const cursor = usePlanningStore((s) => s.cursor);
  const speed = usePlanningStore((s) => s.speed);
  const tickTo = usePlanningStore((s) => s.tickTo);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (timer.current) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
    if (play !== "running") return;
    const next = cursor + 1;
    if (next >= PLANNING_EVENTS.length) return;

    const prevT = cursor < 0 ? 0 : PLANNING_EVENTS[cursor].t;
    const wait = Math.max(16, (PLANNING_EVENTS[next].t - prevT) / speed);
    timer.current = window.setTimeout(() => tickTo(next), wait);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [play, cursor, speed, tickTo]);
}
