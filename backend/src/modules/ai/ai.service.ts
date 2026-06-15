import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { FirebaseService } from '../../core/firebase/firebase.service';
import Groq from 'groq-sdk';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private groq: Groq;

  constructor(
    private readonly configService: ConfigService,
    private readonly firebaseService: FirebaseService,
  ) {
    this.groq = new Groq({
      apiKey: this.configService.get<string>('GROQ_API_KEY'),
    });
  }

  // ---- Resume Analysis ----
  async analyzeResume(resumeText: string, jobId?: string) {
    let jobContext = '';
    if (jobId) {
      const jobDoc = await this.firebaseService.firestore
        .collection('jobs')
        .doc(jobId)
        .get();
      if (jobDoc.exists) {
        const job = jobDoc.data();
        jobContext = `\nJob Title: ${job?.title}\nRequired Skills: ${job?.skillsRequired?.join(', ')}\nExperience Required: ${job?.experienceRequired}`;
      }
    }

    const completion = await this.groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an expert HR analyst. Analyze the following resume and provide a structured evaluation. Return ONLY valid JSON with no markdown formatting.${jobContext ? `\nEvaluate the candidate specifically against this job:${jobContext}` : ''}`,
        },
        {
          role: 'user',
          content: `Analyze this resume and return a JSON object with these exact fields:
{
  "resumeScore": <number 0-100>,
  "skills": [<list of identified skills>],
  "strengths": [<list of strengths>],
  "weaknesses": [<list of weaknesses or areas for improvement>],
  "recommendedRoles": [<list of suitable roles>],
  "experienceLevel": "<Junior|Mid-Level|Senior|Lead|Executive>"
}

Resume:
${resumeText}`,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 1024,
    });

    const content = completion.choices[0]?.message?.content || '{}';
    const analysis = this.parseJsonSafe(content);

    // Store AI report
    const reportRef = this.firebaseService.firestore
      .collection('aiReports')
      .doc();
    await reportRef.set({
      id: reportRef.id,
      type: 'resume_analysis',
      jobId: jobId || null,
      data: analysis,
      createdAt: new Date().toISOString(),
    });

    return analysis;
  }

  // ---- Interview Question Generator ----
  async generateQuestions(
    skill: string,
    difficulty: string,
    count = 5,
    recruiterId: string,
  ) {
    const completion = await this.groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'You are a senior technical interviewer. Generate interview questions. Return ONLY valid JSON with no markdown formatting.',
        },
        {
          role: 'user',
          content: `Generate ${count} ${difficulty} difficulty interview questions for the skill: ${skill}.

Return a JSON object with this exact structure:
{
  "questions": [
    {
      "question": "<the interview question>",
      "expectedAnswer": "<a concise expected answer or key points>",
      "hints": ["<hint 1>", "<hint 2>"]
    }
  ]
}`,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 2048,
    });

    const content =
      completion.choices[0]?.message?.content || '{"questions":[]}';
    const parsed = this.parseJsonSafe(content);

    // Store in question bank
    const qbRef = this.firebaseService.firestore
      .collection('questionBanks')
      .doc();
    await qbRef.set({
      id: qbRef.id,
      recruiterId,
      skill,
      difficulty,
      questions: parsed.questions || [],
      createdAt: new Date().toISOString(),
    });

    return { id: qbRef.id, ...parsed };
  }

  // ---- Interview Summary ----
  async generateInterviewSummary(
    interviewId: string,
    transcript: string,
    notes?: string,
  ) {
    const completion = await this.groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'You are an expert hiring manager. Evaluate the following interview. Return ONLY valid JSON with no markdown formatting.',
        },
        {
          role: 'user',
          content: `Based on the following interview transcript${notes ? ' and interviewer notes' : ''}, provide a structured evaluation.

Return a JSON object with these exact fields:
{
  "technicalScore": <number 1-10>,
  "communicationScore": <number 1-10>,
  "problemSolvingScore": <number 1-10>,
  "strengths": [<list of candidate strengths>],
  "weaknesses": [<list of candidate weaknesses>],
  "recommendation": "<Strong Hire|Hire|Hold|Reject>",
  "summary": "<detailed 2-3 sentence summary>"
}

Transcript:
${transcript}
${notes ? `\nInterviewer Notes:\n${notes}` : ''}`,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 1024,
    });

    const content = completion.choices[0]?.message?.content || '{}';
    const summary = this.parseJsonSafe(content);

    // Store on interview doc
    await this.firebaseService.firestore
      .collection('interviews')
      .doc(interviewId)
      .update({
        aiSummary: summary,
        updatedAt: new Date().toISOString(),
      });

    // Store AI report
    const reportRef = this.firebaseService.firestore
      .collection('aiReports')
      .doc();
    await reportRef.set({
      id: reportRef.id,
      type: 'interview_summary',
      interviewId,
      data: summary,
      createdAt: new Date().toISOString(),
    });

    return summary;
  }

  // ---- Candidate Ranking ----
  async rankCandidates(jobId: string) {
    const jobDoc = await this.firebaseService.firestore
      .collection('jobs')
      .doc(jobId)
      .get();
    if (!jobDoc.exists) return [];
    const job = jobDoc.data();

    // Get all applications for this job
    const appsSnapshot = await this.firebaseService.firestore
      .collection('applications')
      .where('jobId', '==', jobId)
      .get();

    if (appsSnapshot.empty) return [];

    const candidates = await Promise.all(
      appsSnapshot.docs.map(async (appDoc: QueryDocumentSnapshot) => {
        const app = appDoc.data();
        const userDoc = await this.firebaseService.firestore
          .collection('users')
          .doc(app.candidateId)
          .get();
        return {
          applicationId: app.id,
          candidateId: app.candidateId,
          candidateName: userDoc.data()?.displayName || 'Unknown',
          resumeAnalysis: app.resumeAnalysis,
        };
      }),
    );

    const candidatesSummary = candidates
      .map(
        (c: any, i: number) =>
          `Candidate ${i + 1}: ${c.candidateName} - Resume Score: ${c.resumeAnalysis?.resumeScore || 'N/A'}, Skills: ${c.resumeAnalysis?.skills?.join(', ') || 'N/A'}`,
      )
      .join('\n');

    const completion = await this.groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'You are an expert hiring decision maker. Rank candidates for a job. Return ONLY valid JSON with no markdown formatting.',
        },
        {
          role: 'user',
          content: `Rank these candidates for the position: ${job?.title}
Required Skills: ${job?.skillsRequired?.join(', ')}
Experience Required: ${job?.experienceRequired}

Candidates:
${candidatesSummary}

Return a JSON object:
{
  "rankings": [
    {
      "candidateIndex": <1-based index>,
      "rank": <rank number>,
      "matchScore": <0-100>,
      "reason": "<brief reason>"
    }
  ]
}`,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 1024,
    });

    const content =
      completion.choices[0]?.message?.content || '{"rankings":[]}';
    const parsed = this.parseJsonSafe(content);

    // Update applications with rankings
    const rankings = parsed.rankings || [];
    for (const ranking of rankings) {
      const candidateIdx = (ranking.candidateIndex || 1) - 1;
      if (candidates[candidateIdx]) {
        const appId = candidates[candidateIdx].applicationId;
        await this.firebaseService.firestore
          .collection('applications')
          .doc(appId)
          .update({
            rank: ranking.rank,
            matchScore: ranking.matchScore,
            rankReason: ranking.reason,
            updatedAt: new Date().toISOString(),
          });
      }
    }

    return rankings.map((r: any) => ({
      ...r,
      candidateId:
        candidates[((r.candidateIndex as number) || 1) - 1]?.candidateId,
      candidateName:
        candidates[((r.candidateIndex as number) || 1) - 1]?.candidateName,
    }));
  }

  // ---- AI Reports ----
  async getReports(page = 1, limit = 10) {
    const snapshot = await this.firebaseService.firestore
      .collection('aiReports')
      .orderBy('createdAt', 'desc')
      .get();

    const total = snapshot.size;
    return {
      data: snapshot.docs
        .slice((page - 1) * limit, page * limit)
        .map((d: QueryDocumentSnapshot) => d.data()),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getReport(id: string) {
    const doc = await this.firebaseService.firestore
      .collection('aiReports')
      .doc(id)
      .get();
    if (!doc.exists) return null;
    return doc.data();
  }

  // ---- Helpers ----
  private parseJsonSafe(text: string): Record<string, any> {
    try {
      // Remove markdown code fences if present
      const cleaned = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      return JSON.parse(cleaned);
    } catch (e) {
      this.logger.warn(`Failed to parse AI response: ${e}`);
      return {};
    }
  }
}
