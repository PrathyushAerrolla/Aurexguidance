import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Bell, Clock, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface NotificationPreferencesProps {
  title?: string;
}

export function NotificationPreferences({ title = "Notification Settings" }: NotificationPreferencesProps) {
  const preferencesQuery = trpc.notifications.getPreferences.useQuery();
  const updateMutation = trpc.notifications.updatePreferences.useMutation({
    onSuccess: () => {
      toast.success("Preferences updated!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update preferences");
    },
  });

  const [preferences, setPreferences] = useState({
    milestoneReminders: true,
    resourceSuggestions: true,
    progressCheckIns: true,
    reminderFrequency: "weekly" as "weekly" | "biweekly" | "monthly",
    preferredTime: "09:00",
  });

  React.useEffect(() => {
    if (preferencesQuery.data) {
      setPreferences({
        milestoneReminders: preferencesQuery.data.milestoneReminders,
        resourceSuggestions: preferencesQuery.data.resourceSuggestions,
        progressCheckIns: preferencesQuery.data.progressCheckIns,
        reminderFrequency: preferencesQuery.data.reminderFrequency as "weekly" | "biweekly" | "monthly",
        preferredTime: preferencesQuery.data.preferredTime,
      });
    }
  }, [preferencesQuery.data]);

  const handleSave = () => {
    updateMutation.mutate(preferences);
  };

  return (
    <Card className="bg-card border-border p-6 w-full">
      <div className="flex items-center gap-2 mb-6">
        <Bell className="w-5 h-5 text-accent" />
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </div>

      <div className="space-y-6">
        {/* Milestone Reminders */}
        <div className="flex items-start justify-between p-4 bg-muted/30 rounded-lg border border-muted/50">
          <div className="flex-1">
            <h4 className="font-semibold text-foreground mb-1">Milestone Reminders</h4>
            <p className="text-sm text-muted-foreground">
              Get notified when you're approaching important career milestones
            </p>
          </div>
          <Switch
            checked={preferences.milestoneReminders}
            onCheckedChange={(checked) =>
              setPreferences({ ...preferences, milestoneReminders: checked })
            }
            className="ml-4"
          />
        </div>

        {/* Resource Suggestions */}
        <div className="flex items-start justify-between p-4 bg-muted/30 rounded-lg border border-muted/50">
          <div className="flex-1">
            <h4 className="font-semibold text-foreground mb-1">Learning Resource Suggestions</h4>
            <p className="text-sm text-muted-foreground">
              Receive personalized course and resource recommendations based on your goals
            </p>
          </div>
          <Switch
            checked={preferences.resourceSuggestions}
            onCheckedChange={(checked) =>
              setPreferences({ ...preferences, resourceSuggestions: checked })
            }
            className="ml-4"
          />
        </div>

        {/* Progress Check-ins */}
        <div className="flex items-start justify-between p-4 bg-muted/30 rounded-lg border border-muted/50">
          <div className="flex-1">
            <h4 className="font-semibold text-foreground mb-1">Progress Check-ins</h4>
            <p className="text-sm text-muted-foreground">
              Regular updates on your career development progress and next steps
            </p>
          </div>
          <Switch
            checked={preferences.progressCheckIns}
            onCheckedChange={(checked) =>
              setPreferences({ ...preferences, progressCheckIns: checked })
            }
            className="ml-4"
          />
        </div>

        {/* Reminder Frequency */}
        <div className="p-4 bg-muted/30 rounded-lg border border-muted/50">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-accent" />
            <h4 className="font-semibold text-foreground">Reminder Frequency</h4>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {["weekly", "biweekly", "monthly"].map((freq) => (
              <button
                key={freq}
                onClick={() =>
                  setPreferences({
                    ...preferences,
                    reminderFrequency: freq as "weekly" | "biweekly" | "monthly",
                  } as typeof preferences)
                }
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  preferences.reminderFrequency === freq
                    ? "bg-accent text-white"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                {freq.charAt(0).toUpperCase() + freq.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Preferred Time */}
        <div className="p-4 bg-muted/30 rounded-lg border border-muted/50">
          <label className="block mb-2">
            <span className="font-semibold text-foreground">Preferred Notification Time</span>
            <p className="text-sm text-muted-foreground mt-1">Choose when you'd like to receive notifications</p>
          </label>
          <input
            type="time"
            value={preferences.preferredTime}
            onChange={(e) =>
              setPreferences({ ...preferences, preferredTime: e.target.value })
            }
            className="w-full px-3 py-2 rounded-lg border border-border bg-input text-foreground"
          />
        </div>

        {/* Info Alert */}
        <div className="flex gap-3 p-4 bg-accent/5 border border-accent/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
          <p className="text-sm text-foreground">
            Notifications will be sent to your registered email address. Make sure your email is up to date in your profile.
          </p>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="w-full btn-primary"
        >
          {updateMutation.isPending ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </Card>
  );
}
