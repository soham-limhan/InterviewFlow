import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import {
  getFirestore,
  Firestore,
  FieldValue,
  Timestamp,
} from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private firebaseApp!: App;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    if (getApps().length === 0) {
      const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
      const clientEmail = this.configService.get<string>(
        'FIREBASE_CLIENT_EMAIL',
      );
      const privateKey = this.configService
        .get<string>('FIREBASE_PRIVATE_KEY')
        ?.replace(/\\n/g, '\n');
      const storageBucket = this.configService.get<string>(
        'FIREBASE_STORAGE_BUCKET',
      );

      this.firebaseApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket,
      });

      this.logger.log('Firebase Admin SDK initialized');
    } else {
      this.firebaseApp = getApps()[0];
    }
  }

  get auth(): Auth {
    return getAuth(this.firebaseApp);
  }

  get firestore(): Firestore {
    return getFirestore(this.firebaseApp);
  }

  get storage(): Storage {
    return getStorage(this.firebaseApp);
  }

  get bucket() {
    return getStorage(this.firebaseApp).bucket();
  }

  get fieldValue() {
    return FieldValue;
  }

  get timestamp() {
    return Timestamp;
  }
}
