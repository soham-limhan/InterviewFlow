"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Loader2,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import api from "@/lib/api";
import { toast } from "sonner";

interface AIReport {
  id: string;
  type: "resume_analysis" | "interview_summary";
  jobId?: string;
  interviewId?: string;
  data: {
    resumeScore?: number;
    technicalScore?: number;
    communicationScore?: number;
    problemSolvingScore?: number;
    skills?: string[];
    strengths?: string[];
    weaknesses?: string[];
    recommendation?: string;
    summary?: string;
    experienceLevel?: string;
  };
  createdAt: string;
}

export default function AiReportsPage() {
  const [reports, setReports] = useState<AIReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<AIReport | null>(null);

  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await api.get("/ai/reports");
      setReports(res.data.data.data || []);
    } catch {
      toast.error("Failed to load AI reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">AI Evaluation Reports</h1>
        <p className="text-sm text-muted-foreground">
          Review automated candidate screenings and post-interview scorecards.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : reports.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-12 text-center">
          <FileText className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="font-medium text-sm">No reports generated yet</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            AI reports are created automatically when resumes are analyzed or video interviews are completed.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {reports.map((report) => (
            <Card key={report.id} className="flex flex-col justify-between">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge variant="secondary" className="mb-1.5 text-[10px] font-normal">
                      {report.type === "resume_analysis" ? "Resume Screening" : "Interview Summary"}
                    </Badge>
                    <CardTitle className="text-sm font-semibold">
                      {report.type === "resume_analysis"
                        ? `Resume Score: ${report.data.resumeScore || 0}/100`
                        : `Evaluation: ${report.data.recommendation || "Completed"}`}
                    </CardTitle>
                  </div>
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-1" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-[11px] text-muted-foreground">
                  Generated {new Date(report.createdAt).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>

                {report.data.summary && (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {report.data.summary}
                  </p>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {report.id.slice(0, 8)}
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedReport(report)} className="text-xs gap-1 h-7">
                    View Analysis
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Report Details Modal */}
      <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        {selectedReport && (
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="border-b border-border pb-4">
              <Badge variant="secondary" className="w-max mb-1 text-[10px] font-normal">
                {selectedReport.type === "resume_analysis" ? "Resume Screening" : "Interview Evaluation"}
              </Badge>
              <DialogTitle className="text-base font-semibold">
                {selectedReport.type === "resume_analysis"
                  ? `AI Scorecard: ${selectedReport.data.resumeScore || 0}/100`
                  : `Recommendation: ${selectedReport.data.recommendation}`}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5 py-4">
              {/* Scores breakdown for Interview */}
              {selectedReport.type === "interview_summary" && (
                <div className="grid grid-cols-3 gap-3 p-4 bg-muted rounded-md text-center">
                  <div>
                    <span className="text-[10px] text-muted-foreground block font-medium uppercase tracking-wider">Technical</span>
                    <span className="text-lg font-semibold text-foreground">{selectedReport.data.technicalScore || 0}/10</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block font-medium uppercase tracking-wider">Communication</span>
                    <span className="text-lg font-semibold text-foreground">{selectedReport.data.communicationScore || 0}/10</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block font-medium uppercase tracking-wider">Problem Solving</span>
                    <span className="text-lg font-semibold text-foreground">{selectedReport.data.problemSolvingScore || 0}/10</span>
                  </div>
                </div>
              )}

              {/* Experience level for resume */}
              {selectedReport.type === "resume_analysis" && selectedReport.data.experienceLevel && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Estimated Level:</span>
                  <Badge variant="outline">{selectedReport.data.experienceLevel}</Badge>
                </div>
              )}

              {/* Summary */}
              {selectedReport.data.summary && (
                <div>
                  <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wider mb-1">Summary</h4>
                  <p className="text-sm text-foreground leading-relaxed">
                    {selectedReport.data.summary}
                  </p>
                </div>
              )}

              {/* Skills identified */}
              {selectedReport.data.skills && selectedReport.data.skills.length > 0 && (
                <div>
                  <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Identified Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedReport.data.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="font-normal">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths / Weaknesses */}
              <div className="grid md:grid-cols-2 gap-3">
                {selectedReport.data.strengths && selectedReport.data.strengths.length > 0 && (
                  <div className="p-3 bg-muted rounded-md">
                    <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wider mb-2">Strengths</h4>
                    <ul className="list-disc pl-4 text-xs text-muted-foreground space-y-1">
                      {selectedReport.data.strengths.map((str, idx) => (
                        <li key={idx}>{str}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {selectedReport.data.weaknesses && selectedReport.data.weaknesses.length > 0 && (
                  <div className="p-3 bg-muted rounded-md">
                    <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wider mb-2">Weaknesses</h4>
                    <ul className="list-disc pl-4 text-xs text-muted-foreground space-y-1">
                      {selectedReport.data.weaknesses.map((weak, idx) => (
                        <li key={idx}>{weak}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
