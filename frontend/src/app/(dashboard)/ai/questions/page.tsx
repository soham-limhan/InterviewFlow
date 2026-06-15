"use client";

import { useState } from "react";
import {
  Brain,
  ChevronDown,
  ChevronUp,
  Copy,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";
import { toast } from "sonner";

interface Question {
  question: string;
  expectedAnswer: string;
  topic: string;
  difficulty: string;
}

export default function AiQuestionsPage() {
  const [skill, setSkill] = useState("");
  const [difficulty, setDifficulty] = useState("mid");
  const [count, setCount] = useState("5");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skill) {
      toast.error("Please enter a skill or topic");
      return;
    }
    try {
      setLoading(true);
      setQuestions([]);
      setExpandedIndex(null);
      const res = await api.post("/ai/generate-questions", {
        skill,
        difficulty,
        count: parseInt(count),
      });
      // Response contains generated questions
      setQuestions(res.data.data?.questions || []);
      toast.success("Questions generated successfully!");
    } catch {
      toast.error("Failed to generate questions. Make sure Groq key is valid.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">AI Question Generator</h1>
        <p className="text-sm text-muted-foreground">
          Generate interview questions and ideal answers using Llama 3.3 70B.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 items-start">
        {/* Left Form */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerate} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="skill">Skill / Topic</Label>
                <Input
                  id="skill"
                  placeholder="e.g. React, Docker, SQL"
                  value={skill}
                  onChange={(e) => setSkill(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={difficulty} onValueChange={(val) => val && setDifficulty(val)} disabled={loading}>
                  <SelectTrigger id="difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="junior">Junior</SelectItem>
                    <SelectItem value="mid">Mid-level</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="count">Number of Questions</Label>
                <Select value={count} onValueChange={(val) => val && setCount(val)} disabled={loading}>
                  <SelectTrigger id="count">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Questions</SelectItem>
                    <SelectItem value="5">5 Questions</SelectItem>
                    <SelectItem value="10">10 Questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full gap-1.5 mt-1" size="sm" disabled={loading}>
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Brain className="w-3.5 h-3.5" />
                )}
                {loading ? "Generating..." : "Generate"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right Output */}
        <div className="md:col-span-2 space-y-2">
          {loading ? (
            <div className="h-[300px] flex flex-col items-center justify-center text-center p-6 border border-dashed border-border rounded-lg">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Generating questions...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="h-[300px] border border-dashed border-border rounded-lg flex flex-col items-center justify-center p-6 text-center">
              <Brain className="w-8 h-8 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">
                Configure and generate to see questions here.
              </p>
            </div>
          ) : (
            questions.map((q, idx) => {
              const isExpanded = expandedIndex === idx;
              return (
                <Card key={idx} className="overflow-hidden">
                  <div
                    className="p-3 flex items-center justify-between cursor-pointer select-none hover:bg-muted/50 transition-colors"
                    onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  >
                    <div className="flex-1 pr-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] text-muted-foreground font-mono">Q{idx + 1}</span>
                        {q.topic && (
                          <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-normal">
                            {q.topic}
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-sm font-medium text-foreground">{q.question}</h3>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0 h-7 w-7">
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {isExpanded && (
                    <div className="border-t border-border bg-muted/30 p-3 space-y-2">
                      <div>
                        <p className="text-[11px] text-muted-foreground font-medium mb-1">
                          Expected Answer:
                        </p>
                        <p className="text-sm text-foreground leading-relaxed">
                          {q.expectedAnswer}
                        </p>
                      </div>
                      <div className="flex justify-end pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(q.question + "\n\nAnswer: " + q.expectedAnswer)}
                          className="h-7 gap-1.5 text-xs"
                        >
                          <Copy className="w-3 h-3" />
                          Copy
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
