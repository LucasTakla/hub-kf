import type { RoadmapStage } from "@prisma/client";

import { stageIndex } from "@/lib/roadmap";
import { STAGES } from "@/lib/roadmap-constants";

type StagePipelineProps = {
  stage: RoadmapStage;
  compact?: boolean;
};

export function StagePipeline({ stage, compact = false }: StagePipelineProps) {
  const current = stageIndex(stage);

  return (
    <div className={`flex items-center gap-1 ${compact ? "" : "mt-3"}`}>
      {STAGES.map((step, index) => {
        const isComplete = index < current;
        const isCurrent = index === current;

        return (
          <div key={step.id} className="flex flex-1 items-center gap-1">
            <div className="flex flex-1 flex-col gap-1">
              <div
                className="h-1 rounded-full transition-colors"
                style={{
                  background: isComplete || isCurrent ? "var(--accent)" : "var(--border-default)",
                  opacity: isCurrent ? 1 : isComplete ? 0.7 : 0.4,
                }}
              />
              {!compact ? (
                <span
                  className="text-[10px] font-medium"
                  style={{
                    color: isCurrent ? "var(--accent)" : "var(--text-tertiary)",
                  }}
                >
                  {step.label}
                </span>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
