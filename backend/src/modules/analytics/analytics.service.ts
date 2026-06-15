import { Injectable } from '@nestjs/common';
import { Query, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { FirebaseService } from '../../core/firebase/firebase.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async getDashboard(recruiterId?: string, candidateId?: string) {
    const db = this.firebaseService.firestore;

    // Count jobs
    let jobsQuery: Query = db.collection('jobs');
    if (recruiterId)
      jobsQuery = jobsQuery.where('recruiterId', '==', recruiterId);
    const jobsSnap = await jobsQuery.get();
    const totalJobs = jobsSnap.size;

    // Count applications
    let appsQuery: Query = db.collection('applications');
    if (recruiterId)
      appsQuery = appsQuery.where('recruiterId', '==', recruiterId);
    if (candidateId)
      appsQuery = appsQuery.where('candidateId', '==', candidateId);
    const appsSnap = await appsQuery.get();
    const totalApplicants = appsSnap.size;

    // Count interviews
    let interviewsQuery: Query = db.collection('interviews');
    if (recruiterId)
      interviewsQuery = interviewsQuery.where(
        'recruiterId',
        '==',
        recruiterId,
      );
    if (candidateId)
      interviewsQuery = interviewsQuery.where(
        'candidateId',
        '==',
        candidateId,
      );
    const interviewsSnap = await interviewsQuery.get();
    const interviewsScheduled = interviewsSnap.docs.filter(
      (d: QueryDocumentSnapshot) => d.data().status === 'scheduled',
    ).length;

    // Hiring rate
    const hired = appsSnap.docs.filter(
      (d: QueryDocumentSnapshot) => d.data().status === 'hired',
    ).length;
    const hiringRate =
      totalApplicants > 0 ? Math.round((hired / totalApplicants) * 100) : 0;

    // Recent applicants (last 5)
    const rawRecent = appsSnap.docs
      .sort((a: QueryDocumentSnapshot, b: QueryDocumentSnapshot) =>
        b.data().createdAt > a.data().createdAt ? 1 : -1,
      )
      .slice(0, 5)
      .map((d: QueryDocumentSnapshot) => d.data());

    const recentApplicants = await Promise.all(
      rawRecent.map(async (app) => {
        let candidateName = 'Unknown Candidate';
        let jobTitle = 'Unknown Role';

        if (app.candidateId) {
          const userDoc = await db.collection('users').doc(app.candidateId).get();
          if (userDoc.exists) {
            candidateName = userDoc.data()?.displayName || candidateName;
          }
        }

        if (app.jobId) {
          const jobDoc = await db.collection('jobs').doc(app.jobId).get();
          if (jobDoc.exists) {
            jobTitle = jobDoc.data()?.title || jobTitle;
          }
        }

        return {
          ...app,
          candidateName,
          jobTitle,
        };
      }),
    );

    // Upcoming interviews (next 5 scheduled)
    const rawUpcoming = interviewsSnap.docs
      .filter((d: QueryDocumentSnapshot) => d.data().status === 'scheduled')
      .sort((a: QueryDocumentSnapshot, b: QueryDocumentSnapshot) =>
        a.data().scheduledAt > b.data().scheduledAt ? 1 : -1,
      )
      .slice(0, 5)
      .map((d: QueryDocumentSnapshot) => d.data());

    const upcomingInterviews = await Promise.all(
      rawUpcoming.map(async (inter) => {
        let candidateName = 'Unknown Candidate';
        let jobTitle = 'Unknown Role';

        if (inter.candidateId) {
          const userDoc = await db.collection('users').doc(inter.candidateId).get();
          if (userDoc.exists) {
            candidateName = userDoc.data()?.displayName || candidateName;
          }
        }

        if (inter.jobId) {
          const jobDoc = await db.collection('jobs').doc(inter.jobId).get();
          if (jobDoc.exists) {
            jobTitle = jobDoc.data()?.title || jobTitle;
          }
        }

        return {
          ...inter,
          candidateName,
          jobTitle,
        };
      }),
    );

    return {
      totalJobs,
      totalApplicants,
      interviewsScheduled,
      hiringRate,
      recentApplicants,
      upcomingInterviews,
    };
  }

  async getFunnel(recruiterId?: string) {
    const db = this.firebaseService.firestore;
    let query: Query = db.collection('applications');
    if (recruiterId) query = query.where('recruiterId', '==', recruiterId);

    const snap = await query.get();
    const statuses = snap.docs.map(
      (d: QueryDocumentSnapshot) => d.data().status,
    );

    return {
      applied: statuses.length,
      shortlisted: statuses.filter((s: string) =>
        ['shortlisted', 'interviewing', 'hired'].includes(s),
      ).length,
      interviewed: statuses.filter((s: string) =>
        ['interviewing', 'hired'].includes(s),
      ).length,
      hired: statuses.filter((s: string) => s === 'hired').length,
    };
  }

  async getJobAnalytics(recruiterId?: string) {
    const db = this.firebaseService.firestore;
    let jobsQuery: Query = db.collection('jobs');
    if (recruiterId)
      jobsQuery = jobsQuery.where('recruiterId', '==', recruiterId);
    const jobsSnap = await jobsQuery.get();

    const jobAnalytics = jobsSnap.docs.map((d: QueryDocumentSnapshot) => {
      const data = d.data();
      return {
        id: data.id,
        title: data.title,
        applicantCount: data.applicantCount || 0,
        interviewCount: data.interviewCount || 0,
        status: data.status,
      };
    });

    return jobAnalytics;
  }

  async getInterviewAnalytics(recruiterId?: string) {
    const db = this.firebaseService.firestore;
    let query: Query = db.collection('interviews');
    if (recruiterId) query = query.where('recruiterId', '==', recruiterId);
    const snap = await query.get();

    const interviews = snap.docs.map((d: QueryDocumentSnapshot) => d.data());
    const completed = interviews.filter((i: any) => i.status === 'completed');
    const withSummary = completed.filter((i: any) => i.aiSummary);

    const avgTechScore =
      withSummary.length > 0
        ? withSummary.reduce(
            (sum: number, i: any) => sum + (i.aiSummary?.technicalScore || 0),
            0,
          ) / withSummary.length
        : 0;

    const hireRecommendations = withSummary.filter(
      (i: any) =>
        i.aiSummary?.recommendation === 'Hire' ||
        i.aiSummary?.recommendation === 'Strong Hire',
    ).length;

    return {
      total: interviews.length,
      completed: completed.length,
      scheduled: interviews.filter((i: any) => i.status === 'scheduled').length,
      cancelled: interviews.filter((i: any) => i.status === 'cancelled').length,
      passRate:
        completed.length > 0
          ? Math.round((hireRecommendations / completed.length) * 100)
          : 0,
      avgTechnicalScore: Math.round(avgTechScore * 10) / 10,
    };
  }
}
