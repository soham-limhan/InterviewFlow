import { z } from "zod";

// ---- Auth ----
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    displayName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    role: z.enum(["recruiter", "candidate"], {
      message: "Please select a role",
    }),
    company: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// ---- Jobs ----
export const createJobSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  skillsRequired: z
    .array(z.string())
    .min(1, "At least one skill is required"),
  experienceRequired: z.string().min(1, "Experience is required"),
  salaryRange: z.object({
    min: z.number().min(0, "Minimum salary must be positive"),
    max: z.number().min(0, "Maximum salary must be positive"),
    currency: z.string().default("USD"),
  }),
  location: z.string().min(1, "Location is required"),
  locationType: z.enum(["remote", "onsite", "hybrid"]),
  employmentType: z.enum(["full-time", "part-time", "contract", "internship"]),
  status: z.enum(["draft", "active"]).default("draft"),
});

export const updateJobSchema = createJobSchema.partial();

// ---- Applications ----
export const createApplicationSchema = z.object({
  jobId: z.string().min(1, "Job ID is required"),
  resumeUrl: z.string().url("Invalid resume URL").optional(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum([
    "applied",
    "shortlisted",
    "interviewing",
    "hired",
    "rejected",
  ]),
});

// ---- Interviews ----
export const scheduleInterviewSchema = z.object({
  jobId: z.string().min(1, "Job ID is required"),
  applicationId: z.string().min(1, "Application ID is required"),
  candidateId: z.string().min(1, "Candidate ID is required"),
  scheduledAt: z.string().min(1, "Date and time are required"),
  duration: z.number().min(15, "Minimum duration is 15 minutes").max(180),
});

// ---- AI Question Generator ----
export const generateQuestionsSchema = z.object({
  skill: z.string().min(1, "Skill is required"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  count: z.number().min(1).max(20).default(5),
});

// ---- AI Resume Analysis ----
export const analyzeResumeSchema = z.object({
  resumeText: z.string().min(50, "Resume text must be at least 50 characters"),
  jobId: z.string().optional(),
});

// ---- AI Interview Summary ----
export const generateSummarySchema = z.object({
  interviewId: z.string().min(1, "Interview ID is required"),
  transcript: z.string().min(10, "Transcript is required"),
  notes: z.string().optional(),
});

// ---- User Profile ----
export const updateProfileSchema = z.object({
  displayName: z.string().min(2).optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
});

// Export types inferred from schemas
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type ScheduleInterviewInput = z.infer<typeof scheduleInterviewSchema>;
export type GenerateQuestionsInput = z.infer<typeof generateQuestionsSchema>;
export type AnalyzeResumeInput = z.infer<typeof analyzeResumeSchema>;
export type GenerateSummaryInput = z.infer<typeof generateSummarySchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
