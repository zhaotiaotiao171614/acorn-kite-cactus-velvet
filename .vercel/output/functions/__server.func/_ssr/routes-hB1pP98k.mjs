import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as RotateCcw, c as LoaderCircle, d as Brain, i as SkipForward, l as Gauge, n as Wrench, o as Play, r as TriangleAlert, s as Pause, t as X, u as Check } from "../_libs/lucide-react.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-hB1pP98k.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var badgeVariants = cva("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium tabular-nums", {
	variants: { variant: {
		default: "bg-elevated text-muted",
		running: "bg-running/15 text-running",
		success: "bg-success/15 text-success",
		warning: "bg-warning/15 text-warning",
		danger: "bg-danger/15 text-danger"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
function emptySnapshot() {
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
		streamStatus: null
	};
}
function thoughtFrom(data) {
	return {
		role: data.role,
		title: data.title,
		status: data.status,
		detail: data.detail
	};
}
function applyOne(state, ev, index) {
	const next = {
		...state,
		eventCount: index + 1,
		elapsedMs: ev.t,
		steps: state.steps.map((s) => ({
			...s,
			thoughts: [...s.thoughts]
		}))
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
					operatorType: ev.data.operatorType
				},
				thoughts: [],
				t: ev.t
			});
			return next;
		case "thinking": {
			if (!ev.data.visible) return next;
			const thought = thoughtFrom(ev.data);
			if (ev.data.role === "orchestrator") {
				next.orchestrator = thought;
				return next;
			}
			const host = [...next.steps].reverse().find((s) => s.status === "running") ?? next.steps[next.steps.length - 1];
			if (!host) return next;
			const existing = host.thoughts.findIndex((t) => t.role === thought.role);
			if (existing >= 0) host.thoughts[existing] = thought;
			else host.thoughts.push(thought);
			return next;
		}
		case "step": {
			if (!ev.data.visible) return next;
			const last = next.steps[next.steps.length - 1];
			if (last && last.tool === ev.data.tool && (last.status === "running" || ev.data.status === "running") && last.status === "running") {
				last.title = ev.data.title;
				last.headline = ev.data.headline;
				last.detail = ev.data.detail || last.detail;
				last.status = ev.data.status;
				last.stage = ev.data.stage;
				last.source = ev.data.source || last.source;
				last.preview = {
					...last.preview,
					...ev.data.preview
				};
				return next;
			}
			const step = {
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
				t: ev.t
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
			next.orchestrator = next.orchestrator ? {
				...next.orchestrator,
				status: "done",
				title: "规划完成",
				detail: "本阶段库存分配已提交。"
			} : null;
			return next;
	}
}
function reduceEvents(events, upto) {
	let state = emptySnapshot();
	const end = Math.min(upto, events.length - 1);
	for (let i = 0; i <= end; i++) state = applyOne(state, events[i], i);
	return state;
}
function formatElapsed(ms) {
	const total = Math.max(0, Math.floor(ms / 1e3));
	const m = Math.floor(total / 60);
	const s = total % 60;
	return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
function shortRunId(id) {
	if (id.length <= 12) return id;
	return `${id.slice(0, 8)}…${id.slice(-4)}`;
}
function toolLabel(tool) {
	return tool.replaceAll("_", " ");
}
function operatorLabel(value) {
	if (value === "updateOrder") return "改单分配";
	if (typeof value === "string" && value) return value;
	return "";
}
function previewBits(step) {
	const p = step.preview;
	const bits = [];
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
function StatusIcon({ status, warning }) {
	if (status === "running") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
		className: "size-3.5 animate-spin text-running",
		"aria-hidden": true
	});
	if (status === "error") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
		className: "size-3.5 text-danger",
		"aria-hidden": true
	});
	if (warning) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
		className: "size-3.5 text-warning",
		"aria-hidden": true
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
		className: "size-3.5 text-success",
		"aria-hidden": true
	});
}
function ThinkingPanel({ thought }) {
	const running = thought.status === "running";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md bg-elevated px-3 py-2.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-1.5 text-think",
			children: [
				running ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
					className: "size-3 animate-spin",
					"aria-hidden": true
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brain, {
					className: "size-3",
					"aria-hidden": true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs font-medium tracking-wide",
					children: "推理"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-xs text-subtle",
					children: thought.role
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: cn("mt-1.5 text-sm leading-relaxed", running ? "thinking-shimmer" : "text-muted"),
			children: thought.detail || thought.title
		})]
	});
}
function StepRow({ step, last }) {
	const warning = step.status === "done" && step.source === "fallback";
	const bits = previewBits(step);
	const thought = step.thoughts[step.thoughts.length - 1];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "row-enter relative flex gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex w-4 shrink-0 flex-col items-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-1 flex size-4 items-center justify-center rounded-xs bg-surface",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusIcon, {
					status: step.status,
					warning
				})
			}), !last ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-1 w-px flex-1 bg-border",
				"aria-hidden": true
			}) : null]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 flex-1 pb-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-fg",
						children: step.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-0.5 flex items-center gap-1 font-mono text-xs text-subtle",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, {
							className: "size-3",
							"aria-hidden": true
						}), toolLabel(step.tool)]
					})]
				}),
				bits.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 flex flex-wrap gap-1.5",
					children: bits.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: b.includes("回退") ? "warning" : "default",
						children: b
					}, b))
				}) : null,
				step.detail ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1.5 text-sm text-muted",
					children: step.detail
				}) : null,
				thought ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThinkingPanel, { thought })
				}) : null
			]
		})]
	});
}
function ProgressBox({ snapshot }) {
	const scroller = (0, import_react.useRef)(null);
	const live = snapshot.headerStatus === "running";
	(0, import_react.useEffect)(() => {
		const el = scroller.current;
		if (!el) return;
		el.scrollTop = el.scrollHeight;
	}, [
		snapshot.steps.length,
		snapshot.eventCount,
		snapshot.orchestrator?.detail
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "overflow-hidden rounded-lg bg-surface shadow-[var(--shadow-border)]",
		"aria-label": "运行进度",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-3 px-4 pt-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 text-sm text-muted",
				children: [live ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "live-dot size-2 rounded-full bg-running",
					"aria-hidden": true
				}) : snapshot.headerStatus === "completed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
					className: "size-3.5 text-success",
					"aria-hidden": true
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "size-2 rounded-full bg-subtle",
					"aria-hidden": true
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: live ? "规划中" : snapshot.headerStatus === "completed" ? "已完成" : "待命" })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-xs tabular-nums text-subtle",
				children: formatElapsed(snapshot.elapsedMs)
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: scroller,
			className: "progress-feed overflow-y-auto px-4 pt-3",
			children: snapshot.steps.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "pb-4 text-sm text-subtle",
				children: "还没有步骤。开跑后会按事件顺序展开。"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", { children: [snapshot.steps.map((step, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StepRow, {
				step,
				last: i === snapshot.steps.length - 1 && !(live && snapshot.orchestrator)
			}, step.id)), live && snapshot.orchestrator ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "row-enter relative flex gap-3 pb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex w-4 shrink-0 flex-col items-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1 flex size-4 items-center justify-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
							className: "size-3.5 animate-spin text-think",
							"aria-hidden": true
						})
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-w-0 flex-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThinkingPanel, { thought: snapshot.orchestrator })
				})]
			}) : null] })
		})]
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium transition-[opacity,transform,background-color,color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-40 active:not-disabled:scale-[0.96] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:opacity-90",
			secondary: "bg-elevated text-fg shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]",
			ghost: "text-muted hover:bg-elevated hover:text-fg",
			outline: "text-fg shadow-[var(--shadow-border)] hover:bg-elevated"
		},
		size: {
			default: "h-11 px-4",
			sm: "h-9 px-3 text-xs",
			icon: "size-11"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
/** Reconstructed from InventoryPlanningClient SSE logs, 2026-09-24 15:34:28. */
var PLANNING_EVENTS = [
	{
		t: 0,
		event: "started",
		data: {
			runId: "c1e448d83afa40a1a2ebe61feb7b8923",
			phase: "MKE",
			operatorType: "updateOrder",
			headline: "开始规划模块二库存",
			detail: "本次是改单后重新分配库存。系统会依次计算需求、排列抢货顺序并分配库存。",
			summary: "本次是改单后重新分配库存。系统会依次计算需求、排列抢货顺序并分配库存。"
		}
	},
	{
		t: 17,
		event: "thinking",
		data: {
			role: "orchestrator",
			title: "规划中",
			status: "running",
			headline: "规划中",
			detail: "正在规划本阶段库存分配。",
			summary: "正在规划本阶段库存分配。",
			visible: true,
			seq: 2
		}
	},
	{
		t: 1410,
		event: "step",
		data: {
			tool: "compute_requirements",
			title: "正在计算物料需求",
			status: "running",
			stage: "PREPARED",
			source: "",
			preview: {},
			headline: "正在计算物料需求",
			detail: "",
			summary: "正在计算物料需求",
			visible: true
		}
	},
	{
		t: 1411,
		event: "step",
		data: {
			tool: "compute_requirements",
			title: "已算清物料需求",
			status: "done",
			stage: "REQUIREMENTS_COMPUTED",
			source: "",
			preview: { taskCount: 4 },
			headline: "已算清物料需求",
			detail: "本轮共 4 张生产任务参与分配。",
			summary: "本轮共 4 张生产任务参与分配。",
			visible: true
		}
	},
	{
		t: 1412,
		event: "thinking",
		data: {
			role: "orchestrator",
			title: "规划中",
			status: "running",
			headline: "规划中",
			detail: "正在规划本阶段库存分配。",
			summary: "正在规划本阶段库存分配。",
			visible: true,
			seq: 2
		}
	},
	{
		t: 3089,
		event: "step",
		data: {
			tool: "rank_tasks",
			title: "正在排列哪些订单先抢库存",
			status: "running",
			stage: "REQUIREMENTS_COMPUTED",
			source: "",
			preview: {},
			headline: "正在排列哪些订单先抢库存",
			detail: "",
			summary: "正在排列哪些订单先抢库存",
			visible: true
		}
	},
	{
		t: 3119,
		event: "step",
		data: {
			tool: "rank_tasks",
			title: "已确定抢货顺序",
			status: "done",
			stage: "TASKS_RANKED",
			source: "default_policy",
			preview: {
				source: "default_policy",
				orderedTaskIds: [
					"2102200592612061185",
					"2102200592612061192",
					"2102200488173920001",
					"2102199933442217760"
				]
			},
			headline: "已确定抢货顺序",
			detail: "按默认策略排出 4 张任务的抢货顺序。",
			summary: "按默认策略排出 4 张任务的抢货顺序。",
			visible: true
		}
	},
	{
		t: 3121,
		event: "thinking",
		data: {
			role: "orchestrator",
			title: "规划中",
			status: "running",
			headline: "规划中",
			detail: "正在规划本阶段库存分配。",
			summary: "正在规划本阶段库存分配。",
			visible: true,
			seq: 2
		}
	},
	{
		t: 4549,
		event: "step",
		data: {
			tool: "resolve_inventory_access",
			title: "正在确认专用库存给谁用",
			status: "running",
			stage: "TASKS_RANKED",
			source: "",
			preview: {},
			headline: "正在确认专用库存给谁用",
			detail: "",
			summary: "正在确认专用库存给谁用",
			visible: true
		}
	},
	{
		t: 4551,
		event: "step",
		data: {
			tool: "resolve_inventory_access",
			title: "已确认库存可用范围",
			status: "done",
			stage: "ACCESS_RESOLVED",
			source: "default_policy",
			preview: {
				source: "default_policy",
				poolCount: 0
			},
			headline: "已确认库存可用范围",
			detail: "本轮没有专用库存池，全部走共享库存。",
			summary: "本轮没有专用库存池，全部走共享库存。",
			visible: true
		}
	},
	{
		t: 4553,
		event: "thinking",
		data: {
			role: "orchestrator",
			title: "规划中",
			status: "running",
			headline: "规划中",
			detail: "正在规划本阶段库存分配。",
			summary: "正在规划本阶段库存分配。",
			visible: true,
			seq: 2
		}
	},
	{
		t: 5789,
		event: "step",
		data: {
			tool: "rank_demand_lines",
			title: "正在安排主料和辅料的抢货波次",
			status: "running",
			stage: "ACCESS_RESOLVED",
			source: "",
			preview: {},
			headline: "正在安排主料和辅料的抢货波次",
			detail: "",
			summary: "正在安排主料和辅料的抢货波次",
			visible: true
		}
	},
	{
		t: 5790,
		event: "thinking",
		data: {
			role: "demand_lines.system",
			title: "正在安排主料和辅料的抢货波次",
			status: "running",
			headline: "正在安排主料和辅料的抢货波次",
			detail: "模型会把关键件放进第一波、辅料放进第二波，可能需要几秒。",
			summary: "模型会把关键件放进第一波、辅料放进第二波，可能需要几秒。",
			visible: true
		}
	},
	{
		t: 17232,
		event: "thinking",
		data: {
			role: "demand_lines.system",
			title: "已完成主料辅料波次评估",
			status: "done",
			headline: "已完成主料辅料波次评估",
			detail: "关键件P3优先于P4；辅料同波次内，高改单次数(P4)得分高于低改单(P3)，符合紧急分逻辑。",
			summary: "关键件P3优先于P4；辅料同波次内，高改单次数(P4)得分高于低改单(P3)，符合紧急分逻辑。",
			visible: true
		}
	},
	{
		t: 17234,
		event: "step",
		data: {
			tool: "rank_demand_lines",
			title: "已安排主料和辅料波次",
			status: "done",
			stage: "LINES_RANKED",
			source: "fallback",
			preview: {
				source: "fallback",
				lineCount: 0,
				waveOne: 0,
				waveTwo: 0
			},
			headline: "已安排主料和辅料波次",
			detail: "波次评估回退到规则策略，当前没有可排列的需求行。",
			summary: "波次评估回退到规则策略，当前没有可排列的需求行。",
			visible: true
		}
	},
	{
		t: 17241,
		event: "thinking",
		data: {
			role: "orchestrator",
			title: "规划中",
			status: "running",
			headline: "规划中",
			detail: "正在规划本阶段库存分配。",
			summary: "正在规划本阶段库存分配。",
			visible: true,
			seq: 2
		}
	},
	{
		t: 20063,
		event: "step",
		data: {
			tool: "rank_demand_lines",
			title: "正在安排主料和辅料的抢货波次",
			status: "running",
			stage: "LINES_RANKED",
			source: "",
			preview: {},
			headline: "正在安排主料和辅料的抢货波次",
			detail: "",
			summary: "正在安排主料和辅料的抢货波次",
			visible: true
		}
	},
	{
		t: 20068,
		event: "step",
		data: {
			tool: "rank_demand_lines",
			title: "安排主料辅料波次未完成",
			status: "error",
			stage: "LINES_RANKED",
			source: "",
			preview: {},
			headline: "安排主料辅料波次未完成",
			detail: "这一步没有做完，系统会按规则继续，或在最后给出失败原因。",
			summary: "这一步没有做完，系统会按规则继续，或在最后给出失败原因。",
			visible: true
		}
	},
	{
		t: 20069,
		event: "thinking",
		data: {
			role: "orchestrator",
			title: "规划中",
			status: "running",
			headline: "规划中",
			detail: "正在规划本阶段库存分配。",
			summary: "正在规划本阶段库存分配。",
			visible: true,
			seq: 2
		}
	},
	{
		t: 21304,
		event: "step",
		data: {
			tool: "resolve_inventory_access",
			title: "正在确认专用库存给谁用",
			status: "running",
			stage: "LINES_RANKED",
			source: "",
			preview: {},
			headline: "正在确认专用库存给谁用",
			detail: "",
			summary: "正在确认专用库存给谁用",
			visible: true
		}
	},
	{
		t: 21309,
		event: "step",
		data: {
			tool: "resolve_inventory_access",
			title: "确认库存可用范围未完成",
			status: "error",
			stage: "LINES_RANKED",
			source: "",
			preview: {},
			headline: "确认库存可用范围未完成",
			detail: "这一步没有做完，系统会按规则继续，或在最后给出失败原因。",
			summary: "这一步没有做完，系统会按规则继续，或在最后给出失败原因。",
			visible: true
		}
	},
	{
		t: 21312,
		event: "thinking",
		data: {
			role: "orchestrator",
			title: "规划中",
			status: "running",
			headline: "规划中",
			detail: "正在规划本阶段库存分配。",
			summary: "正在规划本阶段库存分配。",
			visible: true,
			seq: 2
		}
	},
	{
		t: 22807,
		event: "step",
		data: {
			tool: "plan_upstream",
			title: "正在按顺序分配库存",
			status: "running",
			stage: "LINES_RANKED",
			source: "",
			preview: {},
			headline: "正在按顺序分配库存",
			detail: "",
			summary: "正在按顺序分配库存",
			visible: true
		}
	},
	{
		t: 22810,
		event: "thinking",
		data: {
			role: "demand_lines.system",
			title: "正在安排主料和辅料的抢货波次",
			status: "running",
			headline: "正在安排主料和辅料的抢货波次",
			detail: "模型会把关键件放进第一波、辅料放进第二波，可能需要几秒。",
			summary: "模型会把关键件放进第一波、辅料放进第二波，可能需要几秒。",
			visible: true
		}
	},
	{
		t: 34335,
		event: "thinking",
		data: {
			role: "demand_lines.system",
			title: "已完成主料辅料波次评估",
			status: "done",
			headline: "已完成主料辅料波次评估",
			detail: "关键件Wave1，辅料Wave2。同物料内按紧急度排序：P3优于P4，P4中改单多者更急。",
			summary: "关键件Wave1，辅料Wave2。同物料内按紧急度排序：P3优于P4，P4中改单多者更急。",
			visible: true
		}
	},
	{
		t: 34336,
		event: "step",
		data: {
			tool: "plan_upstream",
			title: "已完成本阶段库存分配",
			status: "done",
			stage: "PURCHASE_COMPUTED",
			source: "",
			preview: {
				module1Count: 0,
				purchaseCount: 0,
				unmetCount: 0,
				module1Materials: []
			},
			headline: "已完成本阶段库存分配",
			detail: "模块一转交 0、采购建议 0、未满足 0。",
			summary: "模块一转交 0、采购建议 0、未满足 0。",
			visible: true
		}
	},
	{
		t: 34338,
		event: "thinking",
		data: {
			role: "orchestrator",
			title: "规划中",
			status: "running",
			headline: "规划中",
			detail: "正在规划本阶段库存分配。",
			summary: "正在规划本阶段库存分配。",
			visible: true,
			seq: 2
		}
	},
	{
		t: 36533,
		event: "step",
		data: {
			tool: "propose_top_up",
			title: "正在评估剩余库存能否多锁一些",
			status: "running",
			stage: "PURCHASE_COMPUTED",
			source: "",
			preview: {},
			headline: "正在评估剩余库存能否多锁一些",
			detail: "",
			summary: "正在评估剩余库存能否多锁一些",
			visible: true
		}
	},
	{
		t: 36534,
		event: "step",
		data: {
			tool: "propose_top_up",
			title: "已评估剩余库存",
			status: "done",
			stage: "TOP_UP_DONE",
			source: "none",
			preview: {
				source: "none",
				itemCount: 0
			},
			headline: "已评估剩余库存",
			detail: "没有需要额外多锁的剩余库存。",
			summary: "没有需要额外多锁的剩余库存。",
			visible: true
		}
	},
	{
		t: 36540,
		event: "thinking",
		data: {
			role: "orchestrator",
			title: "规划中",
			status: "running",
			headline: "规划中",
			detail: "正在规划本阶段库存分配。",
			summary: "正在规划本阶段库存分配。",
			visible: true,
			seq: 2
		}
	},
	{
		t: 37847,
		event: "step",
		data: {
			tool: "get_unmet_demands",
			title: "正在查看未满足的需求",
			status: "running",
			stage: "TOP_UP_DONE",
			source: "",
			preview: {},
			headline: "正在查看未满足的需求",
			detail: "",
			summary: "正在查看未满足的需求",
			visible: true
		}
	},
	{
		t: 37856,
		event: "step",
		data: {
			tool: "get_unmet_demands",
			title: "已查看缺口",
			status: "done",
			stage: "TOP_UP_DONE",
			source: "",
			preview: {
				unmetCount: 0,
				stage: "TOP_UP_DONE"
			},
			headline: "已查看缺口",
			detail: "当前还有 0 条未满足需求。",
			summary: "当前还有 0 条未满足需求。",
			visible: true
		}
	},
	{
		t: 37858,
		event: "thinking",
		data: {
			role: "orchestrator",
			title: "规划中",
			status: "running",
			headline: "规划中",
			detail: "正在规划本阶段库存分配。",
			summary: "正在规划本阶段库存分配。",
			visible: true,
			seq: 2
		}
	},
	{
		t: 39589,
		event: "step",
		data: {
			tool: "validate_plan",
			title: "正在校验规划结果",
			status: "running",
			stage: "TOP_UP_DONE",
			source: "",
			preview: {},
			headline: "正在校验规划结果",
			detail: "",
			summary: "正在校验规划结果",
			visible: true
		}
	},
	{
		t: 39595,
		event: "step",
		data: {
			tool: "validate_plan",
			title: "规划结果已通过校验",
			status: "done",
			stage: "TOP_UP_DONE",
			source: "",
			preview: {
				passed: true,
				errorCount: 0
			},
			headline: "规划结果已通过校验",
			detail: "数量、库存占用和冻结约束都检查通过。",
			summary: "数量、库存占用和冻结约束都检查通过。",
			visible: true
		}
	},
	{
		t: 39606,
		event: "thinking",
		data: {
			role: "orchestrator",
			title: "规划中",
			status: "running",
			headline: "规划中",
			detail: "正在规划本阶段库存分配。",
			summary: "正在规划本阶段库存分配。",
			visible: true,
			seq: 2
		}
	},
	{
		t: 47453,
		event: "step",
		data: {
			tool: "submit_target_plan",
			title: "正在提交本阶段规划",
			status: "running",
			stage: "TOP_UP_DONE",
			source: "",
			preview: {},
			headline: "正在提交本阶段规划",
			detail: "",
			summary: "正在提交本阶段规划",
			visible: true
		}
	},
	{
		t: 47455,
		event: "step",
		data: {
			tool: "submit_target_plan",
			title: "本阶段规划已完成",
			status: "done",
			stage: "TOP_UP_DONE",
			source: "",
			preview: {
				submitted: true,
				runId: "c1e448d83afa40a1a2ebe61feb7b8923"
			},
			headline: "本阶段规划已完成",
			detail: "规划已提交，runId 已写入结果。",
			summary: "规划已提交，runId 已写入结果。",
			visible: true
		}
	},
	{
		t: 47726,
		event: "result",
		data: {
			code: 200,
			message: "success",
			data: {
				runId: "c1e448d83afa40a1a2ebe61feb7b8923",
				actions: [],
				unmetDemands: [],
				warnings: [{
					code: "LINE_RANKING_FALLBACK",
					severity: "warning",
					message: "主料辅料波次评估回退到规则策略，未使用模型排序结果。"
				}]
			}
		}
	},
	{
		t: 47729,
		event: "end",
		data: {
			eventCount: 39,
			status: "COMPLETED"
		}
	}
];
PLANNING_EVENTS[PLANNING_EVENTS.length - 1].t;
var usePlanningStore = create((set, get) => ({
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
			play: snapshot.headerStatus === "completed" ? "completed" : get().play
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
			play: "completed"
		});
	},
	startRun: () => {
		set({
			snapshot: emptySnapshot(),
			cursor: -1,
			play: "running"
		});
	}
}));
function useEventPlayback() {
	const play = usePlanningStore((s) => s.play);
	const cursor = usePlanningStore((s) => s.cursor);
	const speed = usePlanningStore((s) => s.speed);
	const tickTo = usePlanningStore((s) => s.tickTo);
	const timer = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
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
	}, [
		play,
		cursor,
		speed,
		tickTo
	]);
}
function LiveProgress() {
	useEventPlayback();
	const snapshot = usePlanningStore((s) => s.snapshot);
	const play = usePlanningStore((s) => s.play);
	const speed = usePlanningStore((s) => s.speed);
	const setSpeed = usePlanningStore((s) => s.setSpeed);
	const skip = usePlanningStore((s) => s.skip);
	const pause = usePlanningStore((s) => s.pause);
	const resume = usePlanningStore((s) => s.resume);
	const startRun = usePlanningStore((s) => s.startRun);
	(0, import_react.useEffect)(() => {
		if (usePlanningStore.getState().play === "idle") startRun();
	}, [startRun]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col bg-bg text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "sticky top-0 z-10 border-b border-border bg-bg/90 px-4 py-3 backdrop-blur-sm",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex max-w-2xl items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs tracking-wide text-subtle",
						children: "模块二 · 改单分配"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-lg font-medium tracking-tight text-fg",
						children: "规划进度"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1",
					children: [
						play === "completed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "ghost",
							size: "icon",
							onClick: startRun,
							"aria-label": "再看一遍",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {})
						}) : null,
						(play === "running" || play === "paused") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "ghost",
							size: "icon",
							onClick: () => play === "paused" ? resume() : pause(),
							"aria-label": play === "paused" ? "继续" : "暂停",
							children: play === "paused" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, {})
						}),
						play === "running" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "ghost",
							size: "icon",
							onClick: skip,
							"aria-label": "跳到结果",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipForward, {})
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex h-11 items-center rounded-sm bg-surface px-1 shadow-[var(--shadow-border)]",
							role: "group",
							"aria-label": "播放倍速",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gauge, {
								className: "ml-2 size-3.5 text-subtle",
								"aria-hidden": true
							}), [
								1,
								2,
								4
							].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: cn("h-9 min-w-9 rounded-xs px-2 font-mono text-xs tabular-nums", speed === s ? "bg-elevated text-fg" : "text-subtle hover:text-fg"),
								onClick: () => setSpeed(s),
								children: [s, "x"]
							}, s))]
						})
					]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "mx-auto w-full max-w-2xl flex-1 px-4 py-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressBox, { snapshot })
		})]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveProgress, {});
}
//#endregion
export { Home as component };
