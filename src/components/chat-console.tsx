import { Gauge, Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { useEffect } from "react";
import { ProgressBox } from "@/components/progress-box";
import { Button } from "@/components/ui/button";
import { useEventPlayback } from "@/hooks/use-event-playback";
import { usePlanningStore, type Speed } from "@/lib/planning/store";
import { cn } from "@/lib/utils";

export function LiveProgress() {
  useEventPlayback();
  const snapshot = usePlanningStore((s) => s.snapshot);
  const play = usePlanningStore((s) => s.play);
  const speed = usePlanningStore((s) => s.speed);
  const setSpeed = usePlanningStore((s) => s.setSpeed);
  const skip = usePlanningStore((s) => s.skip);
  const pause = usePlanningStore((s) => s.pause);
  const resume = usePlanningStore((s) => s.resume);
  const startRun = usePlanningStore((s) => s.startRun);

  useEffect(() => {
    if (usePlanningStore.getState().play === "idle") startRun();
  }, [startRun]);

  const speeds: Speed[] = [1, 2, 4];

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <header className="sticky top-0 z-10 border-b border-border bg-bg/90 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs tracking-wide text-subtle">模块二 · 改单分配</p>
            <h1 className="text-lg font-medium tracking-tight text-fg">规划进度</h1>
          </div>
          <div className="flex items-center gap-1">
            {play === "completed" ? (
              <Button type="button" variant="ghost" size="icon" onClick={startRun} aria-label="再看一遍">
                <RotateCcw />
              </Button>
            ) : null}
            {(play === "running" || play === "paused") && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => (play === "paused" ? resume() : pause())}
                aria-label={play === "paused" ? "继续" : "暂停"}
              >
                {play === "paused" ? <Play /> : <Pause />}
              </Button>
            )}
            {play === "running" ? (
              <Button type="button" variant="ghost" size="icon" onClick={skip} aria-label="跳到结果">
                <SkipForward />
              </Button>
            ) : null}
            <div
              className="flex h-11 items-center rounded-sm bg-surface px-1 shadow-[var(--shadow-border)]"
              role="group"
              aria-label="播放倍速"
            >
              <Gauge className="ml-2 size-3.5 text-subtle" aria-hidden />
              {speeds.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={cn(
                    "h-9 min-w-9 rounded-xs px-2 font-mono text-xs tabular-nums",
                    speed === s ? "bg-elevated text-fg" : "text-subtle hover:text-fg",
                  )}
                  onClick={() => setSpeed(s)}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        <ProgressBox snapshot={snapshot} />
      </main>
    </div>
  );
}
