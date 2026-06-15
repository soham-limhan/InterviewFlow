import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Query, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { FirebaseService } from '../../core/firebase/firebase.service';

@Injectable()
export class ApplicationsService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async create(candidateId: string, jobId: string, resumeUrl?: string) {
    // Check for duplicate
    const existing = await this.firebaseService.firestore
      .collection('applications')
      .where('candidateId', '==', candidateId)
      .where('jobId', '==', jobId)
      .get();

    if (!existing.empty) {
      throw new ConflictException('You have already applied to this job');
    }

    const jobDoc = await this.firebaseService.firestore
      .collection('jobs')
      .doc(jobId)
      .get();
    if (!jobDoc.exists) throw new NotFoundException('Job not found');

    const ref = this.firebaseService.firestore.collection('applications').doc();
    const now = new Date().toISOString();

    const appData = {
      id: ref.id,
      jobId,
      candidateId,
      recruiterId: jobDoc.data()?.recruiterId,
      status: 'applied',
      resumeUrl: resumeUrl || null,
      resumeAnalysis: null,
      recruiterNotes: null,
      matchScore: null,
      rank: null,
      rankReason: null,
      createdAt: now,
      updatedAt: now,
    };

    await ref.set(appData);

    // Increment job applicant count
    await this.firebaseService.firestore
      .collection('jobs')
      .doc(jobId)
      .update({ applicantCount: this.firebaseService.fieldValue.increment(1) });

    // Add to candidate's appliedJobs
    await this.firebaseService.firestore
      .collection('candidates')
      .doc(candidateId)
      .update({
        appliedJobs: this.firebaseService.fieldValue.arrayUnion(jobId),
      });

    return appData;
  }

  async findAll(
    filters?: { jobId?: string; candidateId?: string; status?: string },
    page = 1,
    limit = 10,
  ) {
    const query = this.firebaseService.firestore.collection('applications');
    const snapshot = await query.get();
    let docs = snapshot.docs;

    if (filters?.jobId) {
      docs = docs.filter((doc) => doc.data().jobId === filters.jobId);
    }
    if (filters?.candidateId) {
      docs = docs.filter((doc) => doc.data().candidateId === filters.candidateId);
    }
    if (filters?.status) {
      docs = docs.filter((doc) => doc.data().status === filters.status);
    }

    // Sort by createdAt descending
    docs.sort((a, b) => {
      const aTime = new Date(a.data().createdAt || 0).getTime();
      const bTime = new Date(b.data().createdAt || 0).getTime();
      return bTime - aTime;
    });

    const total = docs.length;
    const paginatedDocs = docs.slice((page - 1) * limit, page * limit);

    return {
      data: paginatedDocs.map((d: QueryDocumentSnapshot) => d.data()),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const doc = await this.firebaseService.firestore
      .collection('applications')
      .doc(id)
      .get();
    if (!doc.exists) throw new NotFoundException('Application not found');
    return doc.data();
  }

  async updateStatus(id: string, status: string) {
    const ref = this.firebaseService.firestore
      .collection('applications')
      .doc(id);
    const doc = await ref.get();
    if (!doc.exists) throw new NotFoundException('Application not found');

    await ref.update({ status, updatedAt: new Date().toISOString() });
    return (await ref.get()).data();
  }

  async addNotes(id: string, notes: string) {
    const ref = this.firebaseService.firestore
      .collection('applications')
      .doc(id);
    const doc = await ref.get();
    if (!doc.exists) throw new NotFoundException('Application not found');

    await ref.update({
      recruiterNotes: notes,
      updatedAt: new Date().toISOString(),
    });
    return (await ref.get()).data();
  }
}
