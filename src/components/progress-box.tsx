import { AlertTriangle, Brain, Check, Loader2, Wrench, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { formatElapsed, shortRunId } from "@/lib/planning/reduce";
import type { RunSnapshot, Thought, TimelineStep } from "@/lib/planning/types";
import { cn } from "@/lib/utils";

function toolLabel(tool: string) {
  return tool.replaceAll("_", " ");
}

function operatorLabel(value: unknown) {
  if (value === "updateOrder") return "改单分配";
  if (typeof value === "string" && value) return value;
  return "";
}

function previewBits(step: TimelineStep): string[] {
  const p = step.preview;
  const bits: string[] = [];
  if (typeof p.phase === "string" && p.phase) bits.push(`阶段 ${p.phase}`);
  const op = operatorLabel(p.operatorType);
  if (op) bits.push(op);
  if (typeof p.runId === "string" && p.runId) bits.push(shortRunId(p.runId));
  if (typeof p.taskCount === "number") bits.push(`${p.taskCount} 张任务`);
  if (typeof p.poolCount === "number") bits.push(`专用池 ${p.poolCount}`);
  if (typeof p.unmetCount === "number") bits.push(`缺口 ${p.unmetCount}`);
  if (typeof p.itemCount === "number") bits.push(`加锁 ${p.itemCount}`);
  if (p.passed === true) bits.push("校验通过");
  if (p.submitted === true) bits.push("已提交");
  if (p.source === "fallback") bits.push("规则回退");
  if (p.source === "default_policy") bits.push("默认策略");
  if (p.source === "none") bits.push("无需加锁");
  return bits;
}

function StatusIcon({ status, warning }: { status: TimelineStep["status"]; warning?: boolean }) {
  if (status === "running") {
    return <Loader2 className="size-3.5 animate-spin text-running" aria-hidden />;
  }
  if (status === "error") {
    return <X className="size-3.5 text-danger" aria-hidden />;
  }
  if (warning) {
    return <AlertTriangle className="size-3.5 text-warning" aria-hidden />;
  }
  return <Check className="size-3.5 text-success" aria-hidden />;
}

function ThinkingPanel({ thought }: { thought: Thought }) {
  const running = thought.status === "running";
  return (
    <div className="rounded-md bg-elevated px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-think">
        {running ? (
          <Loader2 className="size-3 animate-spin" aria-hidden />
        ) : (
          <Brain className="size-3" aria-hidden />
        )}
        <span className="text-xs font-medium tracking-wide">推理</span>
        <span className="font-mono text-xs text-subtle">{thought.role}</span>
      </div>
      <p className={cn("mt-1.5 text-sm leading-relaxed", running ? "thinking-shimmer" : "text-muted")}>
        {thought.detail || thought.title}
      </p>
    </div>
  );
}

function StepRow({ step, last }: { step: TimelineStep; last: boolean }) {
  const warning = step.status === "done" && step.source === "fallback";
  const bits = previewBits(step);
  const thought = step.thoughts[step.thoughts.length - 1];

  return (
    <li className="row-enter relative flex gap-3">
      <div className="flex w-4 shrink-0 flex-col items-center">
        <span className="mt-1 flex size-4 items-center justify-center rounded-xs bg-surface">
          <StatusIcon status={step.status} warning={warning} />
        </span>
        {!last ? <span className="mt-1 w-px flex-1 bg-border" aria-hidden /> : null}
      </div>
      <div className="min-w-0 flex-1 pb-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-fg">{step.title}</p>
          <p className="mt-0.5 flex items-center gap-1 font-mono text-xs text-subtle">
            <Wrench className="size-3" aria-hidden />
            {toolLabel(step.tool)}
          </p>
        </div>
        {bits.length ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {bits.map((b) => (
              <Badge key={b} variant={b.includes("回退") ? "warning" : "default"}>
                {b}
              </Badge>
            ))}
          </div>
        ) : null}
        {step.detail ? <p className="mt-1.5 text-sm text-muted">{step.detail}</p> : null}
        {thought ? (
          <div className="mt-2">
            <ThinkingPanel thought={thought} />
          </div>
        ) : null}
      </div>
    </li>
  );
}

export function ProgressBox({ snapshot }: { snapshot: RunSnapshot }) {
  const scroller = useRef<HTMLDivElement>(null);
  const live = snapshot.headerStatus === "running";

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [snapshot.steps.length, snapshot.eventCount, snapshot.orchestrator?.detail]);

  return (
    <section className="overflow-hidden rounded-lg bg-surface shadow-[var(--shadow-border)]" aria-label="运行进度">
      <div className="flex items-center justify-between gap-3 px-4 pt-3">
        <div className="flex items-center gap-2 text-sm text-muted">
          {live ? (
            <span className="live-dot size-2 rounded-full bg-running" aria-hidden />
          ) : snapshot.headerStatus === "completed" ? (
            <Check className="size-3.5 text-success" aria-hidden />
          ) : (
            <span className="size-2 rounded-full bg-subtle" aria-hidden />
          )}
          <span>{live ? "规划中" : snapshot.headerStatus === "completed" ? "已完成" : "待命"}</span>
        </div>
        <span className="font-mono text-xs tabular-nums text-subtle">
          {formatElapsed(snapshot.elapsedMs)}
        </span>
      </div>
      <div ref={scroller} className="progress-feed overflow-y-auto px-4 pt-3">
        {snapshot.steps.length === 0 ? (
          <p className="pb-4 text-sm text-subtle">还没有步骤。开跑后会按事件顺序展开。</p>
        ) : (
          <ol>
            {snapshot.steps.map((step, i) => (
              <StepRow
                key={step.id}
                step={step}
                last={i === snapshot.steps.length - 1 && !(live && snapshot.orchestrator)}
              />
            ))}
            {live && snapshot.orchestrator ? (
              <li className="row-enter relative flex gap-3 pb-4">
                <div className="flex w-4 shrink-0 flex-col items-center">
                  <span className="mt-1 flex size-4 items-center justify-center">
                    <Loader2 className="size-3.5 animate-spin text-think" aria-hidden />
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <ThinkingPanel thought={snapshot.orchestrator} />
                </div>
              </li>
            ) : null}
          </ol>
        )}
      </div>
    </section>
  );
}
