import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Video, Award, ExternalLink } from "lucide-react";

interface Resource {
  title: string;
  type: "course" | "book" | "certification" | "article" | "video";
  provider?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  duration?: string;
  url?: string;
}

interface ResourcesSectionProps {
  careerGoals: string;
  skillGaps: string[];
  title?: string;
}

export function ResourcesSection({
  careerGoals,
  skillGaps,
  title = "Recommended Learning Resources",
}: ResourcesSectionProps) {
  // Generate sample resources based on skills with actual URLs
  const resources: Resource[] = [
    {
      title: "Professional Development Roadmap",
      type: "article",
      provider: "LinkedIn Learning",
      difficulty: "beginner",
      duration: "2 weeks",
      url: "https://www.linkedin.com/learning/",
    },
    {
      title: "Advanced Career Planning",
      type: "course",
      provider: "Coursera",
      difficulty: "intermediate",
      duration: "4 weeks",
      url: "https://www.coursera.org/courses?query=career%20planning",
    },
    {
      title: "Industry Certification Program",
      type: "certification",
      provider: "Professional Institute",
      difficulty: "advanced",
      duration: "3 months",
      url: "https://www.coursera.org/certificates",
    },
    {
      title: "Skill Development Masterclass",
      type: "video",
      provider: "Udemy",
      difficulty: "intermediate",
      duration: "10 hours",
      url: "https://www.udemy.com/",
    },
    {
      title: "Career Success Strategies",
      type: "book",
      provider: "Amazon",
      difficulty: "beginner",
      duration: "Self-paced",
      url: "https://www.amazon.com/s?k=career+success",
    },
    {
      title: "Industry Insights & Trends",
      type: "article",
      provider: "Medium",
      difficulty: "intermediate",
      duration: "30 minutes",
      url: "https://medium.com/tag/career-development",
    },
  ];

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "course":
        return <BookOpen className="w-5 h-5" />;
      case "video":
        return <Video className="w-5 h-5" />;
      case "certification":
        return <Award className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800 border-green-300";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "advanced":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const handleResourceClick = (url?: string) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Card className="bg-card border-border p-6 w-full">
      <h3 className="text-lg font-semibold mb-6 text-foreground">{title}</h3>

      <div className="space-y-4 mb-8">
        {resources.map((resource, index) => (
          <div
            key={index}
            className="flex items-start justify-between p-4 bg-muted/30 rounded-lg border border-muted/50 hover:border-accent/50 hover:bg-muted/50 transition-all cursor-pointer group"
            onClick={() => handleResourceClick(resource.url)}
          >
            <div className="flex items-start gap-4 flex-1">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 text-accent group-hover:bg-accent/20 transition-colors">
                {getResourceIcon(resource.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground mb-1 group-hover:text-accent transition-colors">
                  {resource.title}
                </h4>
                <p className="text-sm text-muted-foreground mb-2">{resource.provider}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {resource.difficulty && (
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded border ${getDifficultyColor(
                        resource.difficulty
                      )}`}
                    >
                      {resource.difficulty.charAt(0).toUpperCase() + resource.difficulty.slice(1)}
                    </span>
                  )}
                  {resource.duration && (
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      {resource.duration}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 flex-shrink-0 gap-2 hover:bg-accent/10"
              onClick={(e) => {
                e.stopPropagation();
                handleResourceClick(resource.url);
              }}
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Visit</span>
            </Button>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
        <h4 className="font-semibold text-foreground mb-2">Personalized Recommendations</h4>
        <p className="text-sm text-foreground mb-3">
          Based on your goal to <span className="font-semibold">{careerGoals.substring(0, 50)}...</span>, we recommend focusing on:
        </p>
        <ul className="space-y-2">
          {skillGaps.slice(0, 5).map((skill, index) => (
            <li key={index} className="text-sm text-foreground flex items-start gap-2">
              <span className="text-accent font-bold">•</span>
              <span>{skill}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Additional Resources Links */}
      <div className="mt-6 pt-6 border-t border-border">
        <h4 className="font-semibold text-foreground mb-4">Quick Links to Popular Platforms</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Button
            variant="outline"
            className="justify-start gap-2 h-auto py-2"
            onClick={() => window.open("https://www.coursera.org", "_blank", "noopener,noreferrer")}
          >
            <ExternalLink className="w-4 h-4" />
            <span>Coursera</span>
          </Button>
          <Button
            variant="outline"
            className="justify-start gap-2 h-auto py-2"
            onClick={() => window.open("https://www.udemy.com", "_blank", "noopener,noreferrer")}
          >
            <ExternalLink className="w-4 h-4" />
            <span>Udemy</span>
          </Button>
          <Button
            variant="outline"
            className="justify-start gap-2 h-auto py-2"
            onClick={() => window.open("https://www.linkedin.com/learning", "_blank", "noopener,noreferrer")}
          >
            <ExternalLink className="w-4 h-4" />
            <span>LinkedIn</span>
          </Button>
          <Button
            variant="outline"
            className="justify-start gap-2 h-auto py-2"
            onClick={() => window.open("https://www.edx.org", "_blank", "noopener,noreferrer")}
          >
            <ExternalLink className="w-4 h-4" />
            <span>edX</span>
          </Button>
          <Button
            variant="outline"
            className="justify-start gap-2 h-auto py-2"
            onClick={() => window.open("https://www.skillshare.com", "_blank", "noopener,noreferrer")}
          >
            <ExternalLink className="w-4 h-4" />
            <span>Skillshare</span>
          </Button>
          <Button
            variant="outline"
            className="justify-start gap-2 h-auto py-2"
            onClick={() => window.open("https://www.pluralsight.com", "_blank", "noopener,noreferrer")}
          >
            <ExternalLink className="w-4 h-4" />
            <span>Pluralsight</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
