"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Search,
  Loader2,
  FileText,
  Sparkles,
  Mail,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import api from "@/lib/api";
import { toast } from "sonner";

interface Candidate {
  userId: string;
  skills: string[];
  resumeUrl?: string;
  appliedJobs: string[];
  createdAt: string;
  user?: {
    displayName: string;
    email: string;
    photoURL?: string;
  };
  resumeAnalysis?: {
    score?: number;
    summary?: string;
    skillsMatched?: string[];
    experienceSummary?: string;
    recommendation?: string;
  };
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      const res = await api.get("/candidates");
      setCandidates(res.data.data.data || []);
    } catch {
      toast.error("Failed to load candidates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, []);

  const filteredCandidates = candidates.filter((c) => {
    const name = c.user?.displayName?.toLowerCase() || "";
    const email = c.user?.email?.toLowerCase() || "";
    const skills = c.skills?.map((s) => s.toLowerCase()) || [];
    const query = search.toLowerCase();
    return name.includes(query) || email.includes(query) || skills.some((s) => s.includes(query));
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Candidates</h1>
        <p className="text-sm text-muted-foreground">
          View talent profiles, resumes, and AI analysis.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <CardTitle className="text-sm font-semibold">Talent Pool</CardTitle>
            <div className="relative w-full md:w-72">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search by name, email, or skills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : filteredCandidates.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground text-sm">
              No candidates found matching your criteria.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Primary Skills</TableHead>
                    <TableHead className="hidden md:table-cell">AI Score</TableHead>
                    <TableHead>Resume</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCandidates.map((candidate) => (
                    <TableRow key={candidate.userId} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="w-7 h-7">
                            <AvatarImage src={candidate.user?.photoURL} />
                            <AvatarFallback className="text-[10px] bg-muted text-foreground">
                              {getInitials(candidate.user?.displayName || "U")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{candidate.user?.displayName || "Anonymous"}</p>
                            <p className="text-[11px] text-muted-foreground">{candidate.user?.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[250px]">
                          {candidate.skills && candidate.skills.length > 0 ? (
                            candidate.skills.slice(0, 3).map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-[10px] py-0 font-normal">
                                {skill}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">Not set</span>
                          )}
                          {candidate.skills && candidate.skills.length > 3 && (
                            <Badge variant="outline" className="text-[10px] py-0 font-normal">
                              +{candidate.skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {candidate.resumeAnalysis?.score ? (
                          <span className="text-sm font-medium">
                            {candidate.resumeAnalysis.score}/100
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {candidate.resumeUrl ? (
                          <a
                            href={candidate.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Download
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">None</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => setSelectedCandidate(candidate)}
                        >
                          View Profile
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Candidate Details Dialog */}
      <Dialog open={!!selectedCandidate} onOpenChange={(open) => !open && setSelectedCandidate(null)}>
        {selectedCandidate && (
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={selectedCandidate.user?.photoURL} />
                  <AvatarFallback className="text-xs bg-muted text-foreground">
                    {getInitials(selectedCandidate.user?.displayName || "U")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle className="text-base font-semibold">
                    {selectedCandidate.user?.displayName || "Candidate Details"}
                  </DialogTitle>
                  <DialogDescription className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                    <Mail className="w-3 h-3" />
                    {selectedCandidate.user?.email}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-5 py-4">
              {/* Skills */}
              <div>
                <h3 className="font-medium text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  Skills
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCandidate.skills && selectedCandidate.skills.length > 0 ? (
                    selectedCandidate.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="font-normal">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No skills defined.</span>
                  )}
                </div>
              </div>

              {/* AI Resume Analysis Summary */}
              {selectedCandidate.resumeAnalysis && (
                <div className="p-4 rounded-md border border-border bg-muted/50 space-y-3">
                  <h3 className="font-medium text-xs text-muted-foreground uppercase tracking-wider">
                    AI Resume Analysis
                  </h3>
                  
                  {selectedCandidate.resumeAnalysis.score && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Match Score:</span>
                      <span className="text-sm font-semibold">
                        {selectedCandidate.resumeAnalysis.score}/100
                      </span>
                    </div>
                  )}

                  {selectedCandidate.resumeAnalysis.summary && (
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-1">Summary:</p>
                      <p className="text-sm text-foreground leading-relaxed">
                        {selectedCandidate.resumeAnalysis.summary}
                      </p>
                    </div>
                  )}

                  {selectedCandidate.resumeAnalysis.recommendation && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Recommendation:</span>
                      <Badge variant="outline">
                        {selectedCandidate.resumeAnalysis.recommendation}
                      </Badge>
                    </div>
                  )}
                </div>
              )}

              {/* Resume Download */}
              {selectedCandidate.resumeUrl && (
                <div className="border-t border-border pt-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Attached Document</span>
                  <a
                    href={selectedCandidate.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 border border-border rounded-md text-sm font-medium hover:bg-muted transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Download Resume
                  </a>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
