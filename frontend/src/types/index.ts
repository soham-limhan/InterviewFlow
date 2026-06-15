// ============================================================
// InterviewFlow AI — Shared TypeScript Types
// ============================================================

// ---- User & Auth ----
export type UserRole = 'recruiter' | 'candidate' | 'admin';
export type UserStatus = 'active' | 'suspended';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  phone?: string;
  company?: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

// ---- Jobs ----
export type JobStatus = 'draft' | 'active' | 'paused' | 'closed';
export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'internship';
export type LocationType = 'remote' | 'onsite' | 'hybrid';

export interface SalaryRange {
  min: number;
  max: number;
  currency: string;
}

export interface Job {
  id: string;
  recruiterId: string;
  title: string;
  description: string;
  skillsRequired: string[];
  experienceRequired: string;
  salaryRange: SalaryRange;
  location: string;
  locationType: LocationType;
  employmentType: EmploymentType;
  status: JobStatus;
  applicantCount: number;
  interviewCount: number;
  createdAt: string;
  updatedAt: string;
}

// ---- Applications ----
export type ApplicationStatus =
  | 'applied'
  | 'shortlisted'
  | 'interviewing'
  | 'hired'
  | 'rejected';

export interface ResumeAnalysis {
  resumeScore: number;
  skills: string[];
  strengths: string[];
  weaknesses: string[];
  recommendedRoles: string[];
  experienceLevel: string;
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  recruiterId: string;
  status: ApplicationStatus;
  resumeUrl?: string;
  resumeAnalysis?: ResumeAnalysis;
  recruiterNotes?: string;
  matchScore?: number;
  rank?: number;
  rankReason?: string;
  createdAt: string;
  updatedAt: string;
}

// ---- Candidates ----
export interface WorkExperience {
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  description: string;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
}

export interface Candidate {
  userId: string;
  skills: string[];
  experience: WorkExperience[];
  education: Education[];
  resumeUrl?: string;
  resumeAnalysis?: ResumeAnalysis;
  appliedJobs: string[];
  createdAt: string;
  updatedAt: string;
}

// ---- Interviews ----
export type InterviewStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';

export interface AIInterviewSummary {
  technicalScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: 'Hire' | 'Reject' | 'Hold' | 'Strong Hire';
  summary: string;
}

export interface Interview {
  id: string;
  jobId: string;
  applicationId: string;
  candidateId: string;
  recruiterId: string;
  scheduledAt: string;
  duration: number;
  meetingLink: string;
  roomName: string;
  status: InterviewStatus;
  notes?: string;
  transcript?: string;
  aiSummary?: AIInterviewSummary;
  createdAt: string;
  updatedAt: string;
}

// ---- Question Bank ----
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export interface GeneratedQuestion {
  question: string;
  expectedAnswer: string;
  hints?: string[];
}

export interface QuestionBank {
  id: string;
  recruiterId: string;
  skill: string;
  difficulty: QuestionDifficulty;
  questions: GeneratedQuestion[];
  createdAt: string;
}

// ---- AI Reports ----
export type AIReportType = 'resume_analysis' | 'interview_summary' | 'candidate_ranking';

export interface AIReport {
  id: string;
  type: AIReportType;
  jobId?: string;
  candidateId?: string;
  interviewId?: string;
  data: ResumeAnalysis | AIInterviewSummary | CandidateRanking;
  createdAt: string;
}

export interface CandidateRanking {
  rank: number;
  matchScore: number;
  reason: string;
  candidateId: string;
  candidateName: string;
}

// ---- Analytics ----
export interface FunnelData {
  applied: number;
  shortlisted: number;
  interviewed: number;
  hired: number;
}

export interface AnalyticsData {
  date: string;
  totalJobs: number;
  totalApplications: number;
  totalInterviews: number;
  totalHired: number;
  hiringRate: number;
  avgResumeScore: number;
  interviewPassRate: number;
  funnelData: FunnelData;
}

// ---- Notifications ----
export type NotificationType =
  | 'interview_scheduled'
  | 'application_update'
  | 'new_applicant'
  | 'interview_reminder'
  | 'ai_report_ready'
  | 'status_change';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

// ---- API Response ----
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ---- Dashboard Stats ----
export interface DashboardStats {
  totalJobs: number;
  totalApplicants: number;
  interviewsScheduled: number;
  hiringRate: number;
  recentApplicants: Application[];
  upcomingInterviews: Interview[];
}
