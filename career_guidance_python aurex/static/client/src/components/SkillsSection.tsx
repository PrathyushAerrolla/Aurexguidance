import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Zap } from "lucide-react";

interface Skill {
  name: string;
  type: "technical" | "soft";
  importance: "critical" | "important" | "nice_to_have";
}

interface SkillsSectionProps {
  skills: string[];
  title?: string;
}

export function SkillsSection({ skills, title = "Required Skills" }: SkillsSectionProps) {
  const [selectedFilter, setSelectedFilter] = useState<"all" | "technical" | "soft">("all");

  // Categorize skills
  const technicalSkills = skills.slice(0, Math.ceil(skills.length / 2));
  const softSkills = skills.slice(Math.ceil(skills.length / 2));

  const filteredSkills =
    selectedFilter === "all"
      ? skills
      : selectedFilter === "technical"
        ? technicalSkills
        : softSkills;

  const getImportanceColor = (index: number) => {
    if (index < skills.length * 0.3) return "bg-red-100 text-red-800 border-red-300";
    if (index < skills.length * 0.7) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-green-100 text-green-800 border-green-300";
  };

  return (
    <Card className="bg-card border-border p-6 w-full">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 text-foreground">{title}</h3>

        {/* Filter buttons */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setSelectedFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedFilter === "all"
                ? "bg-accent text-white"
                : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            All Skills
          </button>
          <button
            onClick={() => setSelectedFilter("technical")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              selectedFilter === "technical"
                ? "bg-accent text-white"
                : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            <Zap className="w-4 h-4" />
            Technical
          </button>
          <button
            onClick={() => setSelectedFilter("soft")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              selectedFilter === "soft"
                ? "bg-accent text-white"
                : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Soft Skills
          </button>
        </div>
      </div>

      {/* Skills grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredSkills.map((skill, index) => {
          const isImportant = index < filteredSkills.length * 0.4;
          const skillType = index < technicalSkills.length ? "technical" : "soft";

          return (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                isImportant
                  ? "bg-accent/5 border-accent/30 hover:border-accent/50"
                  : "bg-muted/30 border-muted/50 hover:border-muted/70"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="font-semibold text-foreground flex-1">{skill}</p>
                {isImportant && (
                  <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-1 rounded whitespace-nowrap">
                    Critical
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {skillType === "technical" ? (
                    <>
                      <Zap className="w-3 h-3 inline mr-1" />
                      Technical
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-3 h-3 inline mr-1" />
                      Soft Skill
                    </>
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-border grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-accent">{technicalSkills.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Technical Skills</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-secondary">{softSkills.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Soft Skills</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">{skills.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Skills</p>
        </div>
      </div>
    </Card>
  );
}
