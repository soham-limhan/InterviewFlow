"use client";

import Link from "next/link";
import {
  Brain,
  Video,
  FileSearch,
  BarChart3,
  Users,
  Zap,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Questions",
    description:
      "Generate tailored interview questions for any skill and difficulty level using Llama 3.3 70B.",
  },
  {
    icon: FileSearch,
    title: "Resume Analysis",
    description:
      "Upload resumes and get instant AI scoring, skill extraction, and candidate recommendations.",
  },
  {
    icon: Video,
    title: "Live Video Interviews",
    description:
      "Conduct seamless video interviews with screen sharing, chat, and recording capabilities.",
  },
  {
    icon: BarChart3,
    title: "Smart Analytics",
    description:
      "Track recruitment funnels, hiring rates, and candidate performance with interactive dashboards.",
  },
  {
    icon: Sparkles,
    title: "AI Evaluations",
    description:
      "Get structured post-interview summaries with technical, communication, and problem-solving scores.",
  },
  {
    icon: Users,
    title: "Candidate Ranking",
    description:
      "AI-powered candidate comparison and ranking with match scores and explanations.",
  },
];

const stats = [
  { label: "Faster Hiring", value: "3x" },
  { label: "Resume Screening Time", value: "-80%" },
  { label: "Interview Efficiency", value: "+65%" },
  { label: "Better Hires", value: "92%" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-foreground flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-background" />
            </div>
            <span className="text-sm font-semibold tracking-tight">
              InterviewFlow
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#stats"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Results
            </a>
            <a
              href="#how-it-works"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              How it Works
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors"
            >
              Get Started
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.15] mb-5">
            Hire smarter with AI-powered interviews
          </h1>

          <p className="max-w-xl mx-auto text-base text-muted-foreground mb-8">
            Automate resume screening, generate tailored questions, conduct live
            video interviews, and get AI evaluations — all in one platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors"
            >
              Start Hiring for Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-md border border-border text-foreground hover:bg-muted transition-colors"
            >
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-12 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center p-5 rounded-lg bg-muted"
            >
              <div className="text-2xl font-bold text-foreground mb-0.5">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
              Everything you need to hire faster
            </h2>
            <p className="max-w-xl mx-auto text-sm text-muted-foreground">
              From posting jobs to making offers, InterviewFlow streamlines
              every step of your recruitment pipeline.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-5 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <feature.icon className="w-5 h-5 text-muted-foreground mb-3" />
                <h3 className="text-sm font-semibold mb-1.5">{feature.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-16 px-6 bg-muted/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
              How it works
            </h2>
            <p className="text-sm text-muted-foreground">
              Three simple steps to transform your hiring process.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Post & Attract",
                description:
                  "Create compelling job listings and let AI analyze incoming resumes to surface the best candidates.",
              },
              {
                step: "02",
                title: "Interview & Evaluate",
                description:
                  "Generate tailored questions, conduct live video interviews, and receive AI-powered candidate evaluations.",
              },
              {
                step: "03",
                title: "Rank & Hire",
                description:
                  "Compare candidates with AI rankings, review analytics, and make data-driven hiring decisions.",
              },
            ].map((item) => (
              <div key={item.step}>
                <div className="text-xs font-mono text-muted-foreground mb-2">
                  {item.step}
                </div>
                <h3 className="text-base font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center p-10 rounded-lg bg-foreground">
          <h2 className="text-2xl font-bold text-background mb-3">
            Ready to transform your hiring?
          </h2>
          <p className="text-sm text-background/70 mb-6 max-w-md mx-auto">
            Join modern recruitment teams using AI to hire better candidates,
            faster.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-md bg-background text-foreground hover:bg-background/90 transition-colors"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-foreground flex items-center justify-center">
              <Zap className="w-3 h-3 text-background" />
            </div>
            <span className="text-sm font-medium">InterviewFlow</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} InterviewFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
