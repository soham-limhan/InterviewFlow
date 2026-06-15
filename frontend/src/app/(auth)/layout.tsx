import { Zap } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left: Branding panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-muted items-center justify-center p-12">
        <div className="relative text-center max-w-md">
          <div className="w-12 h-12 rounded-lg bg-foreground flex items-center justify-center mx-auto mb-6">
            <Zap className="w-6 h-6 text-background" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">
            InterviewFlow
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            Streamline your hiring with AI-powered resume analysis, intelligent
            interview questions, and data-driven candidate evaluations.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-foreground">3x</div>
              <div className="text-xs text-muted-foreground">Faster Hiring</div>
            </div>
            <div>
              <div className="text-xl font-bold text-foreground">92%</div>
              <div className="text-xs text-muted-foreground">Better Matches</div>
            </div>
            <div>
              <div className="text-xl font-bold text-foreground">-80%</div>
              <div className="text-xs text-muted-foreground">Screen Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Auth form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="flex items-center gap-2 mb-8 lg:hidden"
          >
            <div className="w-7 h-7 rounded-md bg-foreground flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-background" />
            </div>
            <span className="text-sm font-semibold">
              InterviewFlow
            </span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
