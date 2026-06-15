import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Query, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { FirebaseService } from '../../core/firebase/firebase.service';
import { ScheduleInterviewDto } from './dto/interviews.dto';
import { AccessToken } from 'livekit-server-sdk';

@Injectable()
export class InterviewsService {
  private readonly logger = new Logger(InterviewsService.name);

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly configService: ConfigService,
  ) {}

  async schedule(recruiterId: string, dto: ScheduleInterviewDto) {
    const ref = this.firebaseService.firestore.collection('interviews').doc();
    const roomName = `interview-${ref.id}`;
    const now = new Date().toISOString();

    const interviewData = {
      id: ref.id,
      jobId: dto.jobId,
      applicationId: dto.applicationId,
      candidateId: dto.candidateId,
      recruiterId,
      scheduledAt: dto.scheduledAt,
      duration: dto.duration,
      meetingLink: `/interviews/${ref.id}/live`,
      roomName,
      status: 'scheduled',
      notes: null,
      transcript: null,
      aiSummary: null,
      createdAt: now,
      updatedAt: now,
    };

    await ref.set(interviewData);

    // Update application status
    await this.firebaseService.firestore
      .collection('applications')
      .doc(dto.applicationId)
      .update({ status: 'interviewing', updatedAt: now });

    // Increment job interview count
    await this.firebaseService.firestore
      .collection('jobs')
      .doc(dto.jobId)
      .update({ interviewCount: this.firebaseService.fieldValue.increment(1) });

    this.logger.log(`Interview scheduled: ${ref.id}`);
    return interviewData;
  }

  async findAll(
    filters?: { recruiterId?: string; candidateId?: string; status?: string },
    page = 1,
    limit = 10,
  ) {
    const query = this.firebaseService.firestore.collection('interviews');
    const snapshot = await query.get();
    let docs = snapshot.docs;

    if (filters?.recruiterId) {
      docs = docs.filter((doc) => doc.data().recruiterId === filters.recruiterId);
    }
    if (filters?.candidateId) {
      docs = docs.filter((doc) => doc.data().candidateId === filters.candidateId);
    }
    if (filters?.status) {
      docs = docs.filter((doc) => doc.data().status === filters.status);
    }

    // Sort by scheduledAt descending
    docs.sort((a, b) => {
      const aTime = new Date(a.data().scheduledAt || 0).getTime();
      const bTime = new Date(b.data().scheduledAt || 0).getTime();
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
      .collection('interviews')
      .doc(id)
      .get();
    if (!doc.exists) throw new NotFoundException('Interview not found');
    return doc.data();
  }

  async updateStatus(id: string, status: string) {
    const ref = this.firebaseService.firestore.collection('interviews').doc(id);
    const doc = await ref.get();
    if (!doc.exists) throw new NotFoundException('Interview not found');

    await ref.update({ status, updatedAt: new Date().toISOString() });
    return (await ref.get()).data();
  }

  async updateNotes(id: string, notes: string) {
    const ref = this.firebaseService.firestore.collection('interviews').doc(id);
    await ref.update({ notes, updatedAt: new Date().toISOString() });
    return (await ref.get()).data();
  }

  async generateToken(interviewId: string, userId: string, userName: string) {
    const interview = await this.findOne(interviewId);
    if (!interview) throw new NotFoundException('Interview not found');

    const apiKey = this.configService.get<string>('LIVEKIT_API_KEY');
    const apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET');

    const at = new AccessToken(apiKey, apiSecret, {
      identity: userId,
      name: userName,
    });

    at.addGrant({
      roomJoin: true,
      room: interview.roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();
    return { token, roomName: interview.roomName };
  }

  async complete(id: string) {
    const ref = this.firebaseService.firestore.collection('interviews').doc(id);
    const doc = await ref.get();
    if (!doc.exists) throw new NotFoundException('Interview not found');

    await ref.update({
      status: 'completed',
      updatedAt: new Date().toISOString(),
    });

    return (await ref.get()).data();
  }
}
