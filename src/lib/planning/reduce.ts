import type {
  PlanningEvent,
  RunSnapshot,
  Thought,
  TimelineStep,
} from "./types";

export function emptySnapshot(): RunSnapshot {
  return {
    runId: "",
    phase: "",
    operatorType: "",
    headline: "",
    detail: "",
    headerStatus: "idle",
    orchestrator: null,
    steps: [],
    result: null,
    eventCount: 0,
    elapsedMs: 0,
    streamStatus: null,
  };
}

function thoughtFrom(data: {
  role: string;
  title: string;
  status: Thought["status"];
  detail: string;
}): Thought {
  return {
    role: data.role,
    title: data.title,
    status: data.status,
    detail: data.detail,
  };
}

function applyOne(state: RunSnapshot, ev: PlanningEvent, index: number): RunSnapshot {
  const next: RunSnapshot = {
    ...state,
    eventCount: index + 1,
    elapsedMs: ev.t,
    steps: state.steps.map((s) => ({ ...s, thoughts: [...s.thoughts] })),
  };

  switch (ev.event) {
    case "started":
      next.runId = ev.data.runId;
      next.phase = ev.data.phase;
      next.operatorType = ev.data.operatorType;
      next.headline = ev.data.headline;
      next.detail = ev.data.detail;
      next.headerStatus = "running";
      next.steps.push({
        id: `started-${index}`,
        kind: "started",
        tool: "started",
        title: ev.data.headline,
        headline: ev.data.headline,
        detail: ev.data.detail,
        status: "done",
        stage: ev.data.phase,
        source: "",
        preview: {
          runId: ev.data.runId,
          phase: ev.data.phase,
          operatorType: ev.data.operatorType,
        },
        thoughts: [],
        t: ev.t,
      });
      return next;
    case "thinking": {
      if (!ev.data.visible) return next;
      const thought = thoughtFrom(ev.data);
      if (ev.data.role === "orchestrator") {
        next.orchestrator = thought;
        return next;
      }
      const host =
        [...next.steps].reverse().find((s) => s.status === "running") ??
        next.steps[next.steps.length - 1];
      if (!host) return next;
      const existing = host.thoughts.findIndex((t) => t.role === thought.role);
      if (existing >= 0) host.thoughts[existing] = thought;
      else host.thoughts.push(thought);
      return next;
    }
    case "step": {
      if (!ev.data.visible) return next;
      const last = next.steps[next.steps.length - 1];
      const sameOpen =
        last &&
        last.tool === ev.data.tool &&
        (last.status === "running" || ev.data.status === "running");
      if (sameOpen && last.status === "running") {
        last.title = ev.data.title;
        last.headline = ev.data.headline;
        last.detail = ev.data.detail || last.detail;
        last.status = ev.data.status;
        last.stage = ev.data.stage;
        last.source = ev.data.source || last.source;
        last.preview = { ...last.preview, ...ev.data.preview };
        return next;
      }
      const step: TimelineStep = {
        id: `${ev.data.tool}-${index}`,
        kind: "step",
        tool: ev.data.tool,
        title: ev.data.title,
        headline: ev.data.headline,
        detail: ev.data.detail,
        status: ev.data.status,
        stage: ev.data.stage,
        source: ev.data.source,
        preview: ev.data.preview,
        thoughts: [],
        t: ev.t,
      };
      next.steps.push(step);
      return next;
    }
    case "result":
      next.result = ev.data;
      return next;
    case "end":
      next.headerStatus = "completed";
      next.streamStatus = ev.data.status;
      next.orchestrator = next.orchestrator
        ? { ...next.orchestrator, status: "done", title: "规划完成", detail: "本阶段库存分配已提交。" }
        : null;
      return next;
  }
}

export function reduceEvents(events: PlanningEvent[], upto: number): RunSnapshot {
  let state = emptySnapshot();
  const end = Math.min(upto, events.length - 1);
  for (let i = 0; i <= end; i++) state = applyOne(state, events[i], i);
  return state;
}

export function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function shortRunId(id: string): string {
  if (id.length <= 12) return id;
  return `${id.slice(0, 8)}…${id.slice(-4)}`;
}
