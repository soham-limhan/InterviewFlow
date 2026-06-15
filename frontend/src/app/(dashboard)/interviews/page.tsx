"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  Video,
  Plus,
  Loader2,
  CheckCircle2,
  Briefcase,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";
import { useAuth } from "@/contexts/auth-context";
import api from "@/lib/api";
import { getStatusColor } from "@/lib/utils";
import { toast } from "sonner";

interface Interview {
  id: string;
  candidateId: string;
  jobId: string;
  recruiterId: string;
  scheduledAt: string;
  duration: number;
  status: string;
  livekitRoomId: string;
  candidateName?: string;
  jobTitle?: string;
  aiSummary?: any;
}

export default function InterviewsPage() {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  // Scheduling states
  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [selectedJob, setSelectedJob] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [duration, setDuration] = useState("45");
  const [isScheduling, setIsScheduling] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  // LiveKit Active session states
  const [activeToken, setActiveToken] = useState<string | null>(null);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  const isRecruiter = user?.role === "recruiter" || user?.role === "admin";

  const loadInterviews = async () => {
    try {
      setLoading(true);
      const res = await api.get("/interviews");
      setInterviews(res.data.data.data || []);
    } catch {
      toast.error("Failed to load interviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInterviews();
  }, []);

  // Pre-load candidates & jobs for recruiter schedule dropdowns
  useEffect(() => {
    if (isScheduleOpen && isRecruiter) {
      const loadOptions = async () => {
        try {
          const [candRes, jobsRes] = await Promise.all([
            api.get("/candidates"),
            api.get("/jobs"),
          ]);
          setCandidates(candRes.data.data.data || []);
          setJobs(jobsRes.data.data.data || []);
        } catch {
          toast.error("Failed to load options for scheduling");
        }
      };
      loadOptions();
    }
  }, [isScheduleOpen]);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate || !selectedJob || !scheduleTime) {
      toast.error("Please fill in all scheduling details");
      return;
    }
    try {
      setIsScheduling(true);
      
      // Fetch the application for this candidate and job to retrieve the applicationId required by backend
      const appsRes = await api.get("/applications", {
        params: { jobId: selectedJob, candidateId: selectedCandidate },
      });
      
      const apps = appsRes.data.data.data || [];
      if (apps.length === 0) {
        toast.error("This candidate has not applied to the selected job opening yet.");
        return;
      }
      
      const applicationId = apps[0].id;

      await api.post("/interviews/schedule", {
        candidateId: selectedCandidate,
        jobId: selectedJob,
        applicationId,
        scheduledAt: new Date(scheduleTime).toISOString(),
        duration: parseInt(duration),
      });
      toast.success("Interview scheduled successfully!");
      setIsScheduleOpen(false);
      // Reset form
      setSelectedCandidate("");
      setSelectedJob("");
      setScheduleTime("");
      loadInterviews();
    } catch {
      toast.error("Failed to schedule interview");
    } finally {
      setIsScheduling(false);
    }
  };

  const handleJoinCall = async (interviewId: string) => {
    try {
      setJoining(true);
      const res = await api.post(`/interviews/${interviewId}/token`);
      const { token, url } = res.data.data;
      setActiveToken(token);
      setActiveRoom(interviewId);
      toast.success("Entering video room...");
    } catch {
      toast.error("Failed to join video call");
    } finally {
      setJoining(false);
    }
  };

  const handleCompleteInterview = async (interviewId: string) => {
    try {
      await api.post(`/interviews/${interviewId}/complete`);
      toast.success("Interview completed! Generating AI summary...");
      loadInterviews();
    } catch {
      toast.error("Failed to mark interview as completed");
    }
  };

  // LiveKit video room session render
  if (activeToken && activeRoom) {
    return (
      <div className="fixed inset-0 z-[100] bg-background flex flex-col">
        {/* Video Header */}
        <div className="h-12 border-b border-border flex items-center justify-between px-4 bg-card shrink-0">
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5 inline-block" />
              Live
            </Badge>
            <span className="text-xs text-muted-foreground">Interview Room</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setActiveToken(null);
              setActiveRoom(null);
            }}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Video Frame */}
        <div className="flex-1 overflow-hidden relative bg-zinc-950">
          <LiveKitRoom
            video={true}
            audio={true}
            token={activeToken}
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || "wss://interviewflow-7ogc57de.livekit.cloud"}
            onDisconnected={() => {
              setActiveToken(null);
              setActiveRoom(null);
              toast.info("Disconnected from interview session.");
            }}
            className="h-full flex flex-col"
          >
            <VideoConference />
          </LiveKitRoom>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Interviews</h1>
          <p className="text-sm text-muted-foreground">Schedule or join live video assessments.</p>
        </div>

        {isRecruiter && (
          <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
            <DialogTrigger
              render={
                <Button size="sm" className="gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Schedule Interview
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule a New Interview</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSchedule} className="space-y-4 py-2">
                <div className="space-y-1">
                  <Label>Job Opening</Label>
                  <Select value={selectedJob} onValueChange={(val) => val && setSelectedJob(val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a job opening..." />
                    </SelectTrigger>
                    <SelectContent>
                      {jobs.map((job) => (
                        <SelectItem key={job.id} value={job.id}>
                          {job.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label>Candidate</Label>
                  <Select value={selectedCandidate} onValueChange={(val) => val && setSelectedCandidate(val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a candidate..." />
                    </SelectTrigger>
                    <SelectContent>
                      {candidates.map((cand) => (
                        <SelectItem key={cand.userId} value={cand.userId}>
                          {cand.user?.displayName || cand.user?.email || "Candidate"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="time">Date & Time</Label>
                    <Input
                      id="time"
                      type="datetime-local"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="duration">Duration (Minutes)</Label>
                    <Select value={duration} onValueChange={(val) => val && setDuration(val)}>
                      <SelectTrigger id="duration">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 Min</SelectItem>
                        <SelectItem value="45">45 Min</SelectItem>
                        <SelectItem value="60">60 Min</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter className="pt-4">
                  <Button type="submit" size="sm" disabled={isScheduling}>
                    {isScheduling ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                    Confirm Schedule
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Your Interviews</CardTitle>
          <CardDescription className="text-xs">
            Join active video sessions or review AI post-interview summaries.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : interviews.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground text-sm">
              No interviews scheduled.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Job</TableHead>
                    <TableHead>Scheduled</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interviews.map((interview) => (
                    <TableRow key={interview.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium text-sm">
                        {interview.candidateName || "Candidate"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {interview.jobTitle || "Job Role"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(interview.scheduledAt).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {interview.duration} min
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(interview.status)} variant="outline">
                          {interview.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {interview.status === "scheduled" && (
                            <>
                              <Button
                                onClick={() => handleJoinCall(interview.id)}
                                disabled={joining}
                                size="sm"
                                className="text-xs h-7 gap-1"
                              >
                                {joining ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Video className="w-3 h-3" />
                                )}
                                Join
                              </Button>
                              
                              {isRecruiter && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCompleteInterview(interview.id)}
                                  className="text-xs h-7 gap-1"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  Complete
                                </Button>
                              )}
                            </>
                          )}
                          {interview.status === "completed" && interview.aiSummary && (
                            <Badge variant="secondary" className="text-[10px]">
                              AI Evaluated
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
