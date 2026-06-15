import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Query, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { FirebaseService } from '../../core/firebase/firebase.service';
import { CreateJobDto, UpdateJobDto } from './dto/jobs.dto';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(private readonly firebaseService: FirebaseService) {}

  async create(recruiterId: string, dto: CreateJobDto) {
    const jobRef = this.firebaseService.firestore.collection('jobs').doc();
    const now = new Date().toISOString();

    const jobData = {
      id: jobRef.id,
      recruiterId,
      ...JSON.parse(JSON.stringify(dto)),
      applicantCount: 0,
      interviewCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    await jobRef.set(jobData);
    this.logger.log(`Job created: ${jobData.id} by ${recruiterId}`);
    return jobData;
  }

  async findAll(
    page = 1,
    limit = 10,
    filters?: {
      status?: string;
      recruiterId?: string;
      search?: string;
      employmentType?: string;
      locationType?: string;
    },
  ) {
    const query = this.firebaseService.firestore.collection('jobs');
    const snapshot = await query.get();
    let docs = snapshot.docs;

    // Filter by status in memory
    if (filters?.status) {
      docs = docs.filter((doc) => doc.data().status === filters.status);
    }
    // Filter by recruiterId in memory
    if (filters?.recruiterId) {
      docs = docs.filter((doc) => doc.data().recruiterId === filters.recruiterId);
    }
    // Filter by employmentType in memory
    if (filters?.employmentType) {
      docs = docs.filter((doc) => doc.data().employmentType === filters.employmentType);
    }
    // Filter by locationType in memory
    if (filters?.locationType) {
      docs = docs.filter((doc) => doc.data().locationType === filters.locationType);
    }

    // Sort by createdAt descending in memory
    docs.sort((a, b) => {
      const aTime = new Date(a.data().createdAt || 0).getTime();
      const bTime = new Date(b.data().createdAt || 0).getTime();
      return bTime - aTime;
    });

    // Client-side search filter
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      docs = docs.filter((doc: QueryDocumentSnapshot) => {
        const data = doc.data();
        return (
          data.title?.toLowerCase().includes(searchLower) ||
          data.description?.toLowerCase().includes(searchLower) ||
          data.skillsRequired?.some((s: string) =>
            s.toLowerCase().includes(searchLower),
          )
        );
      });
    }

    const total = docs.length;
    const paginatedDocs = docs.slice((page - 1) * limit, page * limit);

    return {
      data: paginatedDocs.map((doc: QueryDocumentSnapshot) => doc.data()),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const doc = await this.firebaseService.firestore
      .collection('jobs')
      .doc(id)
      .get();
    if (!doc.exists) throw new NotFoundException('Job not found');
    return doc.data();
  }

  async update(id: string, recruiterId: string, dto: UpdateJobDto) {
    const jobRef = this.firebaseService.firestore.collection('jobs').doc(id);
    const doc = await jobRef.get();
    if (!doc.exists) throw new NotFoundException('Job not found');
    if (doc.data()?.recruiterId !== recruiterId) {
      throw new ForbiddenException('You can only edit your own jobs');
    }

    await jobRef.update({
      ...JSON.parse(JSON.stringify(dto)),
      updatedAt: new Date().toISOString(),
    });
    const updated = await jobRef.get();
    return updated.data();
  }

  async delete(id: string, recruiterId: string) {
    const jobRef = this.firebaseService.firestore.collection('jobs').doc(id);
    const doc = await jobRef.get();
    if (!doc.exists) throw new NotFoundException('Job not found');
    if (doc.data()?.recruiterId !== recruiterId) {
      throw new ForbiddenException('You can only delete your own jobs');
    }
    await jobRef.delete();
    return { deleted: true };
  }

  async getApplicants(jobId: string, page = 1, limit = 10) {
    const snapshot = await this.firebaseService.firestore
      .collection('applications')
      .get();

    const filteredDocs = snapshot.docs.filter((doc) => doc.data().jobId === jobId);

    // Sort by createdAt descending
    filteredDocs.sort((a, b) => {
      const aTime = new Date(a.data().createdAt || 0).getTime();
      const bTime = new Date(b.data().createdAt || 0).getTime();
      return bTime - aTime;
    });

    const total = filteredDocs.length;
    const apps = filteredDocs
      .slice((page - 1) * limit, page * limit)
      .map((d: QueryDocumentSnapshot) => d.data());

    return {
      data: apps,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
