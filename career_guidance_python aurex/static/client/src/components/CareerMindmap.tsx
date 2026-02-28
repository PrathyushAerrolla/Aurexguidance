import { useRef, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface MindmapNode {
  id: string;
  label: string;
  children?: MindmapNode[];
  type?: "root" | "career" | "skill" | "milestone";
}

interface CareerMindmapProps {
  careerRecommendations: string[];
  skillGaps: string[];
  careerProgression: string[];
  title?: string;
}

export function CareerMindmap({
  careerRecommendations,
  skillGaps,
  careerProgression,
  title = "Career Progression Mindmap",
}: CareerMindmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to container
    canvas.width = containerRef.current.offsetWidth;
    canvas.height = Math.max(600, careerRecommendations.length * 150 + 300);

    // Clear canvas
    ctx.fillStyle = "#f0f1f3";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply transformations
    ctx.save();
    ctx.translate(panX, panY);
    ctx.scale(zoom, zoom);

    const centerX = canvas.width / (2 * zoom);
    const centerY = 80;
    const nodeRadius = 35;
    const horizontalDistance = 180;
    const verticalDistance = 100;

    // Helper function to draw a node with better styling
    const drawNode = (x: number, y: number, label: string, color: string, isCenter: boolean = false) => {
      const radius = isCenter ? nodeRadius + 5 : nodeRadius;

      // Draw shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.beginPath();
      ctx.arc(x + 2, y + 2, radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw circle
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw border
      ctx.strokeStyle = "#1a1f26";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Draw text
      ctx.fillStyle = "#1a1f26";
      ctx.font = "bold 11px Inter";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Wrap text if needed
      const words = label.split(" ");
      const lines = [];
      let currentLine = "";

      words.forEach((word) => {
        const testLine = currentLine ? currentLine + " " + word : word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > radius * 1.6) {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      });
      if (currentLine) lines.push(currentLine);

      const lineHeight = 11;
      const totalHeight = (lines.length - 1) * lineHeight;
      lines.forEach((line, index) => {
        ctx.fillText(line, x, y - totalHeight / 2 + index * lineHeight);
      });
    };

    // Helper function to draw a line with arrow
    const drawLine = (fromX: number, fromY: number, toX: number, toY: number) => {
      ctx.strokeStyle = "#a8b5c8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();
    };

    // Draw center node (Goal)
    drawNode(centerX, centerY, "Your Career Goal", "#a8a8ff", true);

    // Draw career recommendations in a horizontal layout
    const careerCount = careerRecommendations.length;
    const careerStartY = centerY + verticalDistance * 2;
    const totalCareerWidth = (careerCount - 1) * horizontalDistance;
    const careerStartX = centerX - totalCareerWidth / 2;

    careerRecommendations.forEach((career, index) => {
      const x = careerStartX + index * horizontalDistance;
      const y = careerStartY;

      // Draw line from center to career
      drawLine(centerX, centerY + 40, x, y - 35);
      drawNode(x, y, career.substring(0, 18), "#a8d5ff");

      // Draw skills under each career
      const skillsPerCareer = Math.ceil(skillGaps.length / careerCount);
      const skillsForThisCareer = skillGaps.slice(
        index * skillsPerCareer,
        (index + 1) * skillsPerCareer
      );

      const skillStartY = y + verticalDistance + 20;
      const skillCount = skillsForThisCareer.length;
      const skillVerticalGap = skillCount > 1 ? (verticalDistance * 1.5) / (skillCount - 1) : 0;

      skillsForThisCareer.forEach((skill, skillIndex) => {
        const skillX = x;
        const skillY = skillStartY + skillIndex * skillVerticalGap - (skillCount - 1) * skillVerticalGap / 2;

        drawLine(x, y + 35, skillX, skillY - 35);
        drawNode(skillX, skillY, skill.substring(0, 14), "#ffc8d8");
      });
    });

    // Draw progression steps on the right side
    const progressionStartX = centerX + horizontalDistance * (careerCount / 2 + 1);
    const progressionStartY = centerY;
    const progressionVerticalGap = careerProgression.length > 1 ? 80 : 0;

    careerProgression.forEach((step, index) => {
      const y = progressionStartY + index * progressionVerticalGap - (careerProgression.length - 1) * progressionVerticalGap / 2;
      const x = progressionStartX;

      // Draw connecting line
      if (index === 0) {
        drawLine(centerX + 40, centerY, x - 35, y);
      } else {
        drawLine(progressionStartX, progressionStartY + (index - 1) * progressionVerticalGap - (careerProgression.length - 1) * progressionVerticalGap / 2 + 35, x, y - 35);
      }

      drawNode(x, y, `Step ${index + 1}`, "#d8ffc8");
    });

    ctx.restore();
  }, [careerRecommendations, skillGaps, careerProgression, zoom, panX, panY]);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.2, 2));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.2, 0.5));
  const handleReset = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  };

  return (
    <Card className="bg-card border-border p-6 w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <div className="flex gap-2">
          <Button
            onClick={handleZoomIn}
            variant="outline"
            size="sm"
            className="gap-1"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleZoomOut}
            variant="outline"
            size="sm"
            className="gap-1"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            className="gap-1"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="border border-border rounded-lg bg-background overflow-hidden"
        style={{ position: "relative" }}
      >
        <canvas
          ref={canvasRef}
          className="w-full"
          style={{ display: "block", cursor: "grab" }}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#a8a8ff" }} />
          <span className="text-muted-foreground">Your Goal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-300" />
          <span className="text-muted-foreground">Career Paths</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-pink-300" />
          <span className="text-muted-foreground">Skills</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#d8ffc8" }} />
          <span className="text-muted-foreground">Steps</span>
        </div>
      </div>
    </Card>
  );
}
