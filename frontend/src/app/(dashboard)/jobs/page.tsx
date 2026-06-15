"use client";

import { useEffect, useState } from "react";
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Plus,
  Loader2,
  Trash2,
  FileText,
  Upload,
  Users,
  Search,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import api from "@/lib/api";
import { getStatusColor, formatRelativeTime } from "@/lib/utils";

interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  skillsRequired: string[];
  employmentType: string;
  locationType: string;
  location: string;
  salaryRange?: string | {
    min: number;
    max: number;
    currency: string;
  };
  status: string;
  applicantCount: number;
  recruiterId: string;
  createdAt: string;
}

export default function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
  // Job Post states
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newReqs, setNewReqs] = useState("");
  const [newSkills, setNewSkills] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newMinSalary, setNewMinSalary] = useState("");
  const [newMaxSalary, setNewMaxSalary] = useState("");
  const [newExperienceRequired, setNewExperienceRequired] = useState("Mid-Level");
  const [newEmpType, setNewEmpType] = useState("full-time");
  const [newLocType, setNewLocType] = useState("hybrid");
  const [isPosting, setIsPosting] = useState(false);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);

  // Resume Apply states
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);

  // Applicants states (For Recruiter)
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  const isRecruiter = user?.role === "recruiter" || user?.role === "admin";

  const loadJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/jobs", {
        params: { search: search || undefined },
      });
      setJobs(res.data.data.data || []);
    } catch (err) {
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [search]);

  // Load applicants for selected job
  useEffect(() => {
    if (selectedJob && isRecruiter) {
      const loadApplicants = async () => {
        try {
          setLoadingApplicants(true);
          const res = await api.get(`/jobs/${selectedJob.id}/applicants`);
          // Fetch displayNames for applicants
          const resolved = await Promise.all(
            (res.data.data.data || []).map(async (app: any) => {
              try {
                const userDoc = await api.get(`/auth/me`); // note: general user info is returned, let's keep candidateId
                return { ...app, candidateName: app.candidateName || "Candidate profile" };
              } catch {
                return app;
              }
            })
          );
          setApplicants(resolved);
        } catch {
          toast.error("Failed to load applicants list");
        } finally {
          setLoadingApplicants(false);
        }
      };
      loadApplicants();
    }
  }, [selectedJob]);

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc) {
      toast.error("Please fill in job title and description");
      return;
    }
    try {
      setIsPosting(true);
      await api.post("/jobs", {
        title: newTitle,
        description: newDesc,
        requirements: newReqs.split("\n").filter((r) => r.trim() !== ""),
        skillsRequired: newSkills.split(",").map((s) => s.trim()).filter((s) => s !== ""),
        employmentType: newEmpType,
        locationType: newLocType,
        location: newLocation,
        experienceRequired: newExperienceRequired || "Mid-Level",
        salaryRange: {
          min: Number(newMinSalary) || 0,
          max: Number(newMaxSalary) || 0,
          currency: "USD"
        },
        status: "active",
      });
      toast.success("Job posted successfully!");
      setIsPostDialogOpen(false);
      // reset forms
      setNewTitle("");
      setNewDesc("");
      setNewReqs("");
      setNewSkills("");
      setNewLocation("");
      setNewMinSalary("");
      setNewMaxSalary("");
      setNewExperienceRequired("Mid-Level");
      loadJobs();
    } catch (err) {
      toast.error("Failed to post job");
    } finally {
      setIsPosting(false);
    }
  };

  const handleApplyJob = async () => {
    if (!selectedJob) return;
    try {
      setIsApplying(true);
      let resumeUrl = "";

      if (resumeFile) {
        const formData = new FormData();
        formData.append("file", resumeFile);
        const uploadRes = await api.post("/storage/upload/resume", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        resumeUrl = uploadRes.data.data.url;
      }

      await api.post("/applications", {
        jobId: selectedJob.id,
        resumeUrl,
      });

      toast.success("Applied successfully!");
      setIsApplyDialogOpen(false);
      setResumeFile(null);
      loadJobs();
    } catch (err: any) {
      toast.error(err.message || "Failed to apply");
    } finally {
      setIsApplying(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job posting?")) return;
    try {
      await api.delete(`/jobs/${jobId}`);
      toast.success("Job deleted");
      setSelectedJob(null);
      loadJobs();
    } catch {
      toast.error("Failed to delete job");
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Jobs</h1>
          <p className="text-sm text-muted-foreground">Manage job postings or apply for active openings.</p>
        </div>

        {isRecruiter && (
          <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
            <DialogTrigger
              render={
                <Button size="sm" className="gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Post a Job
                </Button>
              }
            />
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Post a New Job</DialogTitle>
              </DialogHeader>
              <form onSubmit={handlePostJob} className="space-y-4 py-2">
                <div className="space-y-1">
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Senior Frontend Engineer"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="desc">Description</Label>
                  <Textarea
                    id="desc"
                    placeholder="Enter details of the job role..."
                    rows={4}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="empType">Employment Type</Label>
                    <Select value={newEmpType} onValueChange={(val) => val && setNewEmpType(val)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="locType">Location Type</Label>
                    <Select value={newLocType} onValueChange={(val) => val && setNewLocType(val)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="onsite">On-site</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g. San Francisco, CA"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="experience">Experience Required</Label>
                    <Input
                      id="experience"
                      placeholder="e.g. 3+ years, Mid-Level"
                      value={newExperienceRequired}
                      onChange={(e) => setNewExperienceRequired(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="minSalary">Min Salary (USD/yr)</Label>
                    <Input
                      id="minSalary"
                      type="number"
                      placeholder="e.g. 80000"
                      value={newMinSalary}
                      onChange={(e) => setNewMinSalary(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="maxSalary">Max Salary (USD/yr)</Label>
                    <Input
                      id="maxSalary"
                      type="number"
                      placeholder="e.g. 120000"
                      value={newMaxSalary}
                      onChange={(e) => setNewMaxSalary(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="skills">Skills Required (Comma separated)</Label>
                  <Input
                    id="skills"
                    placeholder="React, TypeScript, Next.js"
                    value={newSkills}
                    onChange={(e) => setNewSkills(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="reqs">Requirements (One per line)</Label>
                  <Textarea
                    id="reqs"
                    placeholder={"5+ years of experience\nBS in Computer Science"}
                    rows={3}
                    value={newReqs}
                    onChange={(e) => setNewReqs(e.target.value)}
                  />
                </div>
                <DialogFooter className="pt-4">
                  <Button type="submit" size="sm" disabled={isPosting}>
                    {isPosting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                    Post Job
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Main Panel */}
      <div className="grid lg:grid-cols-5 gap-4 items-start">
        {/* Left Column: Job Search & Listings */}
        <div className="lg:col-span-3 space-y-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search jobs by title, description or skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9"
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : jobs.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground text-sm">No jobs posted yet.</p>
          ) : (
            <div className="space-y-2">
              {jobs.map((job) => (
                <button
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`w-full p-4 text-left rounded-lg border transition-colors ${
                    selectedJob?.id === job.id
                      ? "border-foreground/20 bg-muted"
                      : "border-border bg-card hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-medium text-sm">{job.title}</h2>
                      <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-muted-foreground mt-1.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {job.location} ({job.locationType})
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {job.employmentType}
                        </span>
                        {job.salaryRange && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {typeof job.salaryRange === "object"
                              ? `${job.salaryRange.min.toLocaleString()} - ${job.salaryRange.max.toLocaleString()} ${job.salaryRange.currency || "USD"}`
                              : job.salaryRange}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge className={getStatusColor(job.status)} variant="outline">
                      {job.status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {job.skillsRequired.slice(0, 4).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-[10px] font-normal">
                        {skill}
                      </Badge>
                    ))}
                    {job.skillsRequired.length > 4 && (
                      <Badge variant="outline" className="text-[10px] font-normal">
                        +{job.skillsRequired.length - 4} more
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Job Details / Action Center */}
        <div className="lg:col-span-2">
          {selectedJob ? (
            <Card className="sticky top-20">
              <CardHeader className="pb-3 border-b border-border">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-semibold">{selectedJob.title}</CardTitle>
                    <CardDescription className="flex flex-col gap-1 mt-1.5">
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {selectedJob.location} • {selectedJob.locationType}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {selectedJob.employmentType}
                      </span>
                      {selectedJob.salaryRange && (
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <DollarSign className="w-3 h-3" />
                          {typeof selectedJob.salaryRange === "object"
                            ? `${selectedJob.salaryRange.min.toLocaleString()} - ${selectedJob.salaryRange.max.toLocaleString()} ${selectedJob.salaryRange.currency || "USD"}`
                            : selectedJob.salaryRange}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  {isRecruiter && selectedJob.recruiterId === user?.uid && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10 h-7 w-7"
                      onClick={() => handleDeleteJob(selectedJob.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-5">
                <div>
                  <h3 className="font-medium text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Description</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedJob.description}
                  </p>
                </div>

                {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                  <div>
                    <h3 className="font-medium text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Requirements</h3>
                    <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-0.5">
                      {selectedJob.requirements.map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h3 className="font-medium text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Required Skills</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJob.skillsRequired.map((skill) => (
                      <Badge key={skill} variant="secondary" className="font-normal">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Candidate Action: Apply */}
                {!isRecruiter && (
                  <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
                    <DialogTrigger
                      render={
                        <Button className="w-full" size="sm">Apply for Job</Button>
                      }
                    />
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Apply for {selectedJob.title}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Upload Resume (Optional but Recommended)</Label>
                          <div className="border border-dashed border-border rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors relative">
                            <input
                              type="file"
                              accept=".pdf,.docx"
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                            />
                            <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                            <span className="text-xs text-muted-foreground">
                              {resumeFile ? resumeFile.name : "Click to select a PDF or Word document"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button size="sm" onClick={handleApplyJob} disabled={isApplying}>
                          {isApplying ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                          Submit Application
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}

                {/* Recruiter View: Applicants list */}
                {isRecruiter && (
                  <div className="border-t border-border pt-4">
                    <h3 className="font-medium text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      Applicants ({selectedJob.applicantCount})
                    </h3>
                    {loadingApplicants ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      </div>
                    ) : applicants.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">
                        No applications submitted yet.
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {applicants.map((app, idx) => (
                          <div
                            key={app.id || idx}
                            className="flex items-center justify-between p-2 rounded-md border border-border text-xs"
                          >
                            <div>
                              <p className="font-medium text-foreground">
                                {app.candidateName || `Candidate (${app.candidateId.slice(0, 6)})`}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                Applied {formatRelativeTime(app.createdAt)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {app.resumeUrl && (
                                <a
                                  href={app.resumeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                </a>
                              )}
                              <Badge className={getStatusColor(app.status)} variant="outline">
                                {app.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="h-[300px] rounded-lg border border-dashed border-border flex items-center justify-center p-6 text-center">
              <p className="text-muted-foreground text-sm">Select a job from the list to view details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
