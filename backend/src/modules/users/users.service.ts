import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { FirebaseService } from '../../core/firebase/firebase.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly firebaseService: FirebaseService) {}

  async findAll(page = 1, limit = 10) {
    const usersRef = this.firebaseService.firestore.collection('users');
    const snapshot = await usersRef.orderBy('createdAt', 'desc').get();
    const total = snapshot.size;
    const users = snapshot.docs
      .slice((page - 1) * limit, page * limit)
      .map((doc: QueryDocumentSnapshot) => doc.data());

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(uid: string) {
    const doc = await this.firebaseService.firestore
      .collection('users')
      .doc(uid)
      .get();

    if (!doc.exists) {
      throw new NotFoundException('User not found');
    }
    return doc.data();
  }

  async update(uid: string, data: Partial<Record<string, unknown>>) {
    const userRef = this.firebaseService.firestore.collection('users').doc(uid);
    const doc = await userRef.get();
    if (!doc.exists) {
      throw new NotFoundException('User not found');
    }

    await userRef.update({ ...data, updatedAt: new Date().toISOString() });
    const updated = await userRef.get();
    return updated.data();
  }

  async suspend(uid: string, suspended: boolean) {
    return this.update(uid, { status: suspended ? 'suspended' : 'active' });
  }

  async delete(uid: string) {
    const userRef = this.firebaseService.firestore.collection('users').doc(uid);
    const doc = await userRef.get();
    if (!doc.exists) {
      throw new NotFoundException('User not found');
    }

    // Delete from Firebase Auth
    try {
      await this.firebaseService.auth.deleteUser(uid);
    } catch (e) {
      this.logger.warn(`Could not delete auth user ${uid}: ${e}`);
    }

    await userRef.delete();
    return { deleted: true };
  }
}
