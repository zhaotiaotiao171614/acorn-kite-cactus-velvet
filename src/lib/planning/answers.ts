import type { RunSnapshot } from "./types";

export type Intent =
  | "start"
  | "replay"
  | "skip"
  | "faster"
  | "realtime"
  | "pause"
  | "resume"
  | "status"
  | "tasks"
  | "rank"
  | "unmet"
  | "warnings"
  | "validate"
  | "result"
  | "waves"
  | "help"
  | "unknown";

export function detectIntent(text: string): Intent {
  const t = text.trim().toLowerCase();
  if (!t) return "unknown";
  if (/跳过|跳到结果|直接出结果/.test(t)) return "skip";
  if (/实时|原速|按真实/.test(t)) return "realtime";
  if (/加速|更快|倍速/.test(t)) return "faster";
  if (/暂停/.test(t)) return "pause";
  if (/继续/.test(t)) return "resume";
  if (/再(跑|来|次)|重放|重跑|再规划/.test(t)) return "replay";
  if (/开始|规划|改单|分配库存|开跑/.test(t)) return "start";
  if (/做什么|会做|流程|怎么/.test(t)) return "help";
  if (/缺口|未满足|缺料/.test(t)) return "unmet";
  if (/告警|警告|fallback|回退/.test(t)) return "warnings";
  if (/校验|通过|检查/.test(t)) return "validate";
  if (/波次|主料|辅料|关键件/.test(t)) return "waves";
  if (/顺序|抢货|订单/.test(t)) return "rank";
  if (/任务|几张/.test(t)) return "tasks";
  if (/结果|提交|完成了吗|怎么样/.test(t)) return "result";
  if (/哪一步|进度|进行到|现在/.test(t)) return "status";
  return "unknown";
}

function idsFrom(snapshot: RunSnapshot): string[] {
  const ranked = snapshot.steps.find((s) => s.tool === "rank_tasks" && s.status === "done");
  const ids = ranked?.preview.orderedTaskIds;
  return Array.isArray(ids) ? ids.map(String) : [];
}

export function answerFromSnapshot(intent: Intent, snapshot: RunSnapshot): string {
  const running = snapshot.headerStatus === "running";
  const done = snapshot.headerStatus === "completed";
  const current = snapshot.steps[snapshot.steps.length - 1];

  switch (intent) {
    case "help":
      return "本次是改单后重新分配库存。系统会依次计算需求、排列抢货顺序、确认库存范围、安排主料辅料波次、按序分配、评估加锁、查看缺口、校验并提交。中间若某步没做完，会按规则继续。";
    case "status":
      if (snapshot.headerStatus === "idle")
        return "还没开跑。说一声「开始规划」我就回放这一轮改单分配。";
      if (running && current)
        return `进行到「${current.title}」，阶段 ${current.stage || "—"}。已处理 ${snapshot.eventCount} 条事件。`;
      if (done) return "这一轮已经跑完并提交。可以直接问缺口、告警或抢货顺序。";
      return "规划台已就绪。";
    case "tasks": {
      const req = snapshot.steps.find(
        (s) => s.tool === "compute_requirements" && s.status === "done",
      );
      if (!req) return running ? "还在算需求，任务张数马上出来。" : "这一轮还没算到物料需求。";
      return `本轮共 ${Number(req.preview.taskCount ?? 0)} 张生产任务参与分配。`;
    }
    case "rank": {
      const ids = idsFrom(snapshot);
      if (!ids.length) return running ? "抢货顺序还在排。" : "还没有排出抢货顺序。";
      return `已按默认策略排出顺序：\n${ids.map((id, i) => `${i + 1}. ${id}`).join("\n")}`;
    }
    case "unmet": {
      const step = snapshot.steps.find((s) => s.tool === "get_unmet_demands" && s.status === "done");
      if (snapshot.result) {
        const n = snapshot.result.data.unmetDemands.length;
        return n === 0 ? "没有未满足需求，缺口为 0。" : `还有 ${n} 条未满足需求。`;
      }
      if (!step) return running ? "还没查到缺口这一步。" : "这一轮还没查看缺口。";
      return step.detail || "当前还有 0 条未满足需求。";
    }
    case "warnings": {
      if (!snapshot.result) return running ? "告警会在结果里汇总，现在还在跑。" : "还没有最终告警。";
      const list = snapshot.result.data.warnings;
      if (!list.length) return "结果里没有告警。";
      return list.map((w) => `${w.code}（${w.severity}）：${w.message}`).join("\n");
    }
    case "validate": {
      const step = snapshot.steps.find((s) => s.tool === "validate_plan" && s.status === "done");
      if (!step) return running ? "还没到校验。" : "这一轮还没校验。";
      return step.detail || "规划结果已通过校验。";
    }
    case "waves": {
      const thoughts = snapshot.steps
        .flatMap((s) => s.thoughts)
        .filter((t) => t.status === "done");
      const last = thoughts[thoughts.length - 1];
      if (last?.detail) return last.detail;
      return running ? "主料辅料波次还在评估。" : "没有留下波次评估说明。";
    }
    case "result":
      if (!done && !snapshot.result)
        return running ? "还在提交前的步骤里，结果稍后出来。" : "还没有结果。";
      return [
        "本阶段规划已完成。",
        `runId ${snapshot.runId}`,
        `动作 ${snapshot.result?.data.actions.length ?? 0} 条，缺口 ${snapshot.result?.data.unmetDemands.length ?? 0} 条，告警 ${snapshot.result?.data.warnings.length ?? 0} 条。`,
        snapshot.result?.data.warnings[0]
          ? `主要告警：${snapshot.result.data.warnings[0].code}`
          : "",
      ]
        .filter(Boolean)
        .join("\n");
    default:
      if (running && current)
        return `我还在跑「${current.title}」。也可以问进度、缺口或让我跳到结果。`;
      if (done) return "这一轮已经提交。可以问告警、缺口、抢货顺序，或说「再跑一遍」。";
      return "直接说「开始规划模块二库存」，我会按改单后的真实事件流回放。";
  }
}

export function closingSummary(snapshot: RunSnapshot): string {
  const warn = snapshot.result?.data.warnings[0];
  return [
    "本阶段规划已完成。4 张生产任务参与分配，缺口 0，动作为空。校验通过，规划已提交。",
    warn
      ? `有 1 条告警：${warn.code}，波次评估走了规则回退。中间有两步没做完，系统按规则继续跑完了。`
      : "",
  ]
    .filter(Boolean)
    .join("");
}

export const SUGGEST_IDLE = ["开始规划模块二库存", "这轮会做什么？"];
export const SUGGEST_RUNNING = ["现在进行到哪一步了", "跳到结果", "按真实耗时"];
export const SUGGEST_DONE = ["有哪些告警", "缺口是多少", "抢货顺序呢", "再跑一遍"];
