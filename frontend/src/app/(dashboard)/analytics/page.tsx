"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  Award,
  Video,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import api from "@/lib/api";
import { toast } from "sonner";

interface FunnelData {
  applied: number;
  shortlisted: number;
  interviewed: number;
  hired: number;
}

interface InterviewAnalytics {
  total: number;
  completed: number;
  scheduled: number;
  cancelled: number;
  passRate: number;
  avgTechnicalScore: number;
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [funnel, setFunnel] = useState<FunnelData | null>(null);
  const [interviews, setInterviews] = useState<InterviewAnalytics | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const [funnelRes, interRes] = await Promise.all([
          api.get("/analytics/funnel"),
          api.get("/analytics/interviews"),
        ]);
        setFunnel(funnelRes.data.data);
        setInterviews(interRes.data.data);
      } catch {
        toast.error("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const funnelItems = [
    { label: "Applied", value: funnel?.applied || 0 },
    { label: "Shortlisted", value: funnel?.shortlisted || 0 },
    { label: "Interviewed", value: funnel?.interviewed || 0 },
    { label: "Hired", value: funnel?.hired || 0 },
  ];

  const maxFunnelVal = Math.max(...funnelItems.map((i) => i.value), 1);

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Track conversion rates, funnel performance, and interview metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Pass Rate */}
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingUp className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <span className="text-[11px] text-muted-foreground font-medium block">
                Hire Rate
              </span>
              <span className="text-xl font-semibold text-foreground">
                {interviews?.passRate || 0}%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Avg Tech Score */}
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Award className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <span className="text-[11px] text-muted-foreground font-medium block">
                Avg Tech Score
              </span>
              <span className="text-xl font-semibold text-foreground">
                {interviews?.avgTechnicalScore || 0}/10
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Total Sessions */}
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Video className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <span className="text-[11px] text-muted-foreground font-medium block">
                Interviews Conducted
              </span>
              <span className="text-xl font-semibold text-foreground">
                {interviews?.completed || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-5 gap-4 items-start">
        {/* Left Funnel */}
        <Card className="md:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Candidate Funnel</CardTitle>
            <CardDescription className="text-xs">
              Conversion across candidate stages.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {funnelItems.map((item) => {
              const percentage = Math.round((item.value / maxFunnelVal) * 100);
              return (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{item.label}</span>
                    <span className="text-muted-foreground text-xs">
                      {item.value} ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-foreground/20 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Right Interview breakdown */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Session Status</CardTitle>
            <CardDescription className="text-xs">
              Interview status breakdown.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pt-2">
            {[
              { label: "Completed", value: interviews?.completed || 0 },
              { label: "Scheduled", value: interviews?.scheduled || 0 },
              { label: "Cancelled", value: interviews?.cancelled || 0 },
            ].map((state) => (
              <div
                key={state.label}
                className="flex items-center justify-between p-3 rounded-md border border-border"
              >
                <span className="text-sm font-medium">{state.label}</span>
                <span className="text-lg font-semibold text-foreground">{state.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
