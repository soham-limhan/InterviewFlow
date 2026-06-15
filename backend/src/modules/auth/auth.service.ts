import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { FirebaseService } from '../../core/firebase/firebase.service';
import { RegisterDto, GoogleAuthDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly firebaseService: FirebaseService) {}

  async register(dto: RegisterDto) {
    const userRef = this.firebaseService.firestore
      .collection('users')
      .doc(dto.uid);
    const existing = await userRef.get();

    if (existing.exists) {
      throw new ConflictException('User profile already exists');
    }

    const now = new Date().toISOString();
    const userData = {
      uid: dto.uid,
      email: dto.email,
      displayName: dto.displayName,
      role: dto.role,
      company: dto.company || null,
      photoURL: dto.photoURL || null,
      phone: null,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    await userRef.set(userData);

    // If candidate, create candidates profile doc
    if (dto.role === 'candidate') {
      await this.firebaseService.firestore
        .collection('candidates')
        .doc(dto.uid)
        .set({
          userId: dto.uid,
          skills: [],
          experience: [],
          education: [],
          resumeUrl: null,
          resumeAnalysis: null,
          appliedJobs: [],
          createdAt: now,
          updatedAt: now,
        });
    }

    this.logger.log(`User registered: ${dto.email} as ${dto.role}`);
    return userData;
  }

  async googleAuth(dto: GoogleAuthDto) {
    const userRef = this.firebaseService.firestore
      .collection('users')
      .doc(dto.uid);
    const existing = await userRef.get();

    if (existing.exists) {
      // Update last login
      await userRef.update({ updatedAt: new Date().toISOString() });
      return existing.data();
    }

    // New user via Google — return without role so frontend can prompt
    return {
      uid: dto.uid,
      email: dto.email,
      displayName: dto.displayName,
      photoURL: dto.photoURL,
      needsRole: true,
    };
  }

  async getProfile(uid: string) {
    const userDoc = await this.firebaseService.firestore
      .collection('users')
      .doc(uid)
      .get();

    if (!userDoc.exists) {
      return null;
    }

    return userDoc.data();
  }

  async setRole(
    uid: string,
    role: string,
    email?: string,
    displayName?: string,
    photoURL?: string,
  ) {
    const userRef = this.firebaseService.firestore.collection('users').doc(uid);
    const userDoc = await userRef.get();
    const now = new Date().toISOString();

    if (userDoc.exists) {
      await userRef.update({ role, updatedAt: now });
    } else {
      await userRef.set({
        uid,
        email: email || null,
        displayName: displayName || null,
        photoURL: photoURL || null,
        role,
        company: null,
        phone: null,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      });
    }

    // If candidate, create candidates profile doc
    if (role === 'candidate') {
      const candidateRef = this.firebaseService.firestore
        .collection('candidates')
        .doc(uid);
      const candidateDoc = await candidateRef.get();

      if (!candidateDoc.exists) {
        await candidateRef.set({
          userId: uid,
          skills: [],
          experience: [],
          education: [],
          resumeUrl: null,
          resumeAnalysis: null,
          appliedJobs: [],
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    return { uid, role };
  }
}
