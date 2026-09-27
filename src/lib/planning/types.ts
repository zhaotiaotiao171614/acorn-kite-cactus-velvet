export type EventName = "started" | "thinking" | "step" | "result" | "end";

export type StepStatus = "running" | "done" | "error";

export type StartedPayload = {
  runId: string;
  phase: string;
  operatorType: string;
  headline: string;
  detail: string;
  summary: string;
};

export type ThinkingPayload = {
  role: string;
  title: string;
  status: StepStatus;
  headline: string;
  detail: string;
  summary: string;
  visible: boolean;
  seq?: number;
};

export type StepPayload = {
  tool: string;
  title: string;
  status: StepStatus;
  stage: string;
  source: string;
  preview: Record<string, unknown>;
  headline: string;
  detail: string;
  summary: string;
  visible: boolean;
};

export type WarningItem = {
  code: string;
  severity: "warning" | "error" | "info";
  message: string;
};

export type ResultPayload = {
  code: number;
  message: string;
  data: {
    runId: string;
    actions: unknown[];
    unmetDemands: unknown[];
    warnings: WarningItem[];
  };
};

export type PlanningEvent =
  | { t: number; event: "started"; data: StartedPayload }
  | { t: number; event: "thinking"; data: ThinkingPayload }
  | { t: number; event: "step"; data: StepPayload }
  | { t: number; event: "result"; data: ResultPayload }
  | { t: number; event: "end"; data: { eventCount: number; status: string } };

export type Thought = {
  role: string;
  title: string;
  status: StepStatus;
  detail: string;
};

export type TimelineStep = {
  id: string;
  kind: "started" | "step";
  tool: string;
  title: string;
  headline: string;
  detail: string;
  status: StepStatus;
  stage: string;
  source: string;
  preview: Record<string, unknown>;
  thoughts: Thought[];
  t: number;
};

export type RunSnapshot = {
  runId: string;
  phase: string;
  operatorType: string;
  headline: string;
  detail: string;
  headerStatus: "idle" | "running" | "completed";
  orchestrator: Thought | null;
  steps: TimelineStep[];
  result: ResultPayload | null;
  eventCount: number;
  elapsedMs: number;
  streamStatus: string | null;
};
