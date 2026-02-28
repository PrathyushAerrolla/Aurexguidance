import React from "react";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Circle } from "lucide-react";

interface TimelineStep {
  title: string;
  description: string;
  month: number;
  completed?: boolean;
}

interface CareerTimelineProps {
  steps: string[];
  totalMonths: number;
  title?: string;
}

export function CareerTimeline({
  steps,
  totalMonths,
  title = "Career Development Timeline",
}: CareerTimelineProps) {
  // Convert steps to timeline items with estimated months
  const timelineSteps: TimelineStep[] = steps.map((step, index) => ({
    title: `Step ${index + 1}`,
    description: step,
    month: Math.round(((index + 1) / steps.length) * totalMonths),
    completed: false,
  }));

  return (
    <Card className="bg-card border-border p-6 w-full">
      <h3 className="text-lg font-semibold mb-8 text-foreground">{title}</h3>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-accent to-secondary" />

        {/* Timeline items */}
        <div className="space-y-8">
          {timelineSteps.map((item, index) => (
            <div key={index} className="relative pl-20">
              {/* Timeline dot */}
              <div className="absolute left-0 top-1 flex items-center justify-center">
                {item.completed ? (
                  <CheckCircle2 className="w-8 h-8 text-accent fill-accent" />
                ) : (
                  <Circle className="w-8 h-8 text-muted-foreground border-2 border-current" />
                )}
              </div>

              {/* Content */}
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-foreground">{item.title}</h4>
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                    Month {item.month}
                  </span>
                </div>
                <p className="text-sm text-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Final milestone */}
        <div className="relative pl-20 mt-8">
          <div className="absolute left-0 top-1 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-secondary flex items-center justify-center text-white font-bold text-sm">
              ✓
            </div>
          </div>
          <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
            <h4 className="font-semibold text-foreground mb-1">Career Goal Achieved</h4>
            <p className="text-sm text-foreground">
              Estimated completion: Month {totalMonths}
            </p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-8 grid grid-cols-3 gap-4 pt-6 border-t border-border">
        <div className="text-center">
          <p className="text-2xl font-bold text-accent">{steps.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Development Steps</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-secondary">{totalMonths}</p>
          <p className="text-xs text-muted-foreground mt-1">Months Timeline</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">
            {Math.round(totalMonths / 12)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Years Estimated</p>
        </div>
      </div>
    </Card>
  );
}
