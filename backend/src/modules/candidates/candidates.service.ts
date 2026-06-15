import { Injectable, NotFoundException } from '@nestjs/common';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { FirebaseService } from '../../core/firebase/firebase.service';

@Injectable()
export class CandidatesService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async findAll(page = 1, limit = 10) {
    const snapshot = await this.firebaseService.firestore
      .collection('candidates')
      .orderBy('createdAt', 'desc')
      .get();

    const total = snapshot.size;
    const candidates = snapshot.docs
      .slice((page - 1) * limit, page * limit)
      .map((doc: QueryDocumentSnapshot) => doc.data());

    // Enrich with user data
    const enriched = await Promise.all(
      candidates.map(async (c: any) => {
        const userDoc = await this.firebaseService.firestore
          .collection('users')
          .doc(c.userId)
          .get();
        return { ...c, user: userDoc.exists ? userDoc.data() : null };
      }),
    );

    return {
      data: enriched,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(userId: string) {
    const candidateDoc = await this.firebaseService.firestore
      .collection('candidates')
      .doc(userId)
      .get();

    if (!candidateDoc.exists)
      throw new NotFoundException('Candidate not found');

    const userDoc = await this.firebaseService.firestore
      .collection('users')
      .doc(userId)
      .get();

    return {
      ...candidateDoc.data(),
      user: userDoc.exists ? userDoc.data() : null,
    };
  }

  async update(userId: string, data: Partial<Record<string, unknown>>) {
    const ref = this.firebaseService.firestore
      .collection('candidates')
      .doc(userId);
    const doc = await ref.get();
    if (!doc.exists) throw new NotFoundException('Candidate not found');

    await ref.update({ ...data, updatedAt: new Date().toISOString() });
    const updated = await ref.get();
    return updated.data();
  }
}
