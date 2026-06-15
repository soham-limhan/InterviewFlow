"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Loader2, Mail, Lock, Eye, EyeOff, Building2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth-context";
import { loginSchema, type LoginInput } from "@/lib/validations";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle, setRole, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"recruiter" | "candidate" | null>(null);
  const [isRoleSubmitting, setIsRoleSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setIsLoading(true);
      clearError();
      await login(data.email, data.password);
      router.push("/dashboard");
    } catch {
      // Error handled in context
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      clearError();
      const res = await loginWithGoogle();
      if (res?.needsRole) {
        setShowRoleSelection(true);
      } else {
        router.push("/dashboard");
      }
    } catch {
      // Error handled in context
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleRoleConfirm = async () => {
    if (!selectedRole) return;
    try {
      setIsRoleSubmitting(true);
      clearError();
      await setRole(selectedRole);
      router.push("/dashboard");
    } catch {
      // Error handled in context
    } finally {
      setIsRoleSubmitting(false);
    }
  };

  if (showRoleSelection) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Select your role</h1>
          <p className="text-muted-foreground mt-1.5">
            To complete your account, please tell us how you will use InterviewFlow AI
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 mb-6">
          <button
            type="button"
            onClick={() => setSelectedRole("recruiter")}
            className={`flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all hover:bg-accent ${
              selectedRole === "recruiter"
                ? "border-primary bg-primary/5 shadow-md shadow-primary/5"
                : "border-border"
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              selectedRole === "recruiter" ? "bg-primary text-white" : "bg-muted text-muted-foreground"
            }`}>
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">I am a Recruiter</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                I want to post jobs, screen resumes, and conduct AI video interviews.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole("candidate")}
            className={`flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all hover:bg-accent ${
              selectedRole === "candidate"
                ? "border-primary bg-primary/5 shadow-md shadow-primary/5"
                : "border-border"
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              selectedRole === "candidate" ? "bg-primary text-white" : "bg-muted text-muted-foreground"
            }`}>
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">I am a Candidate</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                I want to prepare for interviews, take evaluations, and apply for jobs.
              </p>
            </div>
          </button>
        </div>

        <Button
          type="button"
          onClick={handleRoleConfirm}
          className="w-full h-11 gradient-primary text-white"
          disabled={!selectedRole || isRoleSubmitting}
        >
          {isRoleSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : null}
          Confirm & Continue
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground mt-1.5">
          Sign in to your InterviewFlow AI account
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Google Login */}
      <Button
        variant="outline"
        className="w-full h-11 gap-3 mb-6"
        onClick={handleGoogleLogin}
        disabled={isGoogleLoading}
      >
        {isGoogleLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        )}
        Continue with Google
      </Button>

      <div className="relative mb-6">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground">
          or
        </span>
      </div>

      {/* Email Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              className="pl-10 h-11"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pl-10 pr-10 h-11"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-11 gradient-primary text-white"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : null}
          Sign In
        </Button>
      </form>

      <p className="text-sm text-center text-muted-foreground mt-6">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-primary hover:underline"
        >
          Create one
        </Link>
      </p>
    </motion.div>
  );
}
