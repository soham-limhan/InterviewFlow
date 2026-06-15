import { Injectable } from '@nestjs/common';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { FirebaseService } from '../../core/firebase/firebase.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async create(
    userId: string,
    type: string,
    title: string,
    message: string,
    actionUrl?: string,
  ) {
    const ref = this.firebaseService.firestore
      .collection('notifications')
      .doc();
    const data = {
      id: ref.id,
      userId,
      type,
      title,
      message,
      read: false,
      actionUrl: actionUrl || null,
      createdAt: new Date().toISOString(),
    };
    await ref.set(data);
    return data;
  }

  async findAll(userId: string, page = 1, limit = 20) {
    const snapshot = await this.firebaseService.firestore
      .collection('notifications')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const total = snapshot.size;
    const unreadCount = snapshot.docs.filter(
      (d: QueryDocumentSnapshot) => !d.data().read,
    ).length;

    return {
      data: snapshot.docs
        .slice((page - 1) * limit, page * limit)
        .map((d: QueryDocumentSnapshot) => d.data()),
      total,
      unreadCount,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async markAsRead(id: string) {
    await this.firebaseService.firestore
      .collection('notifications')
      .doc(id)
      .update({ read: true });
    return { success: true };
  }

  async markAllAsRead(userId: string) {
    const snapshot = await this.firebaseService.firestore
      .collection('notifications')
      .where('userId', '==', userId)
      .where('read', '==', false)
      .get();

    const batch = this.firebaseService.firestore.batch();
    snapshot.docs.forEach((doc: QueryDocumentSnapshot) =>
      batch.update(doc.ref, { read: true }),
    );
    await batch.commit();
    return { success: true, updated: snapshot.size };
  }
}
