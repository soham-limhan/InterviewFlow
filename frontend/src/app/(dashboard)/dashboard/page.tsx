"use client";

import { useEffect, useState } from "react";
import {
  Briefcase,
  Users,
  Calendar,
  TrendingUp,
  ArrowUpRight,
  Clock,
  FileText,
  Brain,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { getInitials, getStatusColor, formatRelativeTime, cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import api from "@/lib/api";

interface DashboardMetrics {
  totalJobs: number;
  totalApplicants: number;
  interviewsScheduled: number;
  hiringRate: number;
  recentApplicants: any[];
  upcomingInterviews: any[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const res = await api.get("/analytics/dashboard");
        setData(res.data.data);
      } catch (err) {
        setError("Failed to load dashboard metrics");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 text-center text-destructive text-sm">
        {error || "Something went wrong loading dashboard."}
      </div>
    );
  }

  const isRecruiter = user?.role === "recruiter" || user?.role === "admin";

  const stats = [
    {
      label: isRecruiter ? "Total Jobs" : "Active Openings",
      value: data.totalJobs.toString(),
      change: "Realtime",
      icon: Briefcase,
    },
    {
      label: isRecruiter ? "Total Applicants" : "Your Applications",
      value: data.totalApplicants.toString(),
      change: "Updated",
      icon: Users,
    },
    {
      label: "Interviews Scheduled",
      value: data.interviewsScheduled.toString(),
      change: "Upcoming",
      icon: Calendar,
    },
    {
      label: "Hiring Rate",
      value: `${data.hiringRate}%`,
      change: "Success metric",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back, {user?.displayName || "User"}.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                  <p className="text-2xl font-semibold mt-1">{stat.value}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {stat.change}
                  </p>
                </div>
                <stat.icon className="w-4 h-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Recent Applicants */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold">
              {isRecruiter ? "Recent Applicants" : "Recent Applications"}
            </CardTitle>
            {isRecruiter && (
              <Link
                href="/candidates"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-xs h-7")}
              >
                View All
                <ArrowUpRight className="w-3 h-3 ml-1" />
              </Link>
            )}
          </CardHeader>
          <CardContent className="space-y-1 pt-0">
            {data.recentApplicants.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No applicants found yet.
              </p>
            ) : (
              data.recentApplicants.map((applicant, idx) => (
                <div
                  key={applicant.id || idx}
                  className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar className="w-7 h-7">
                      <AvatarFallback className="text-[10px] bg-muted text-foreground">
                        {getInitials(applicant.candidateName || "U")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{applicant.candidateName || "User"}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {applicant.jobTitle || "Job Application"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right hidden sm:block">
                      {applicant.matchScore && (
                        <span className="text-xs font-medium">{applicant.matchScore}</span>
                      )}
                      <p className="text-[10px] text-muted-foreground">
                        {formatRelativeTime(applicant.createdAt)}
                      </p>
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${getStatusColor(applicant.status)}`}>
                      {applicant.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Upcoming Interviews */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold">Upcoming Interviews</CardTitle>
            <Link
              href="/interviews"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-xs h-7")}
            >
              View All
              <ArrowUpRight className="w-3 h-3 ml-1" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {data.upcomingInterviews.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-3">No upcoming interviews.</p>
                {isRecruiter && (
                  <Link
                    href="/interviews"
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full text-xs")}
                  >
                    Schedule One
                  </Link>
                )}
              </div>
            ) : (
              data.upcomingInterviews.map((interview, idx) => (
                <div
                  key={interview.id || idx}
                  className="p-3 rounded-md border border-border"
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <p className="text-sm font-medium">{interview.candidateName || "Candidate"}</p>
                    <span className="text-[10px] text-muted-foreground">
                      {interview.duration || "45"} min
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mb-1.5">
                    {interview.jobTitle || "Interview"}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                    <Calendar className="w-3 h-3" />
                    {new Date(interview.scheduledAt).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {isRecruiter && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { label: "Jobs Panel", icon: Briefcase, href: "/jobs" },
                { label: "Generate Questions", icon: Brain, href: "/ai/questions" },
                { label: "View Reports", icon: FileText, href: "/ai/reports" },
                { label: "Analytics", icon: TrendingUp, href: "/analytics" },
              ].map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-2.5 p-3 rounded-md border border-border hover:bg-muted transition-colors"
                >
                  <action.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
