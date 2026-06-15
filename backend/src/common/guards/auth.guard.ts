import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { FirebaseService } from '../../core/firebase/firebase.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(private readonly firebaseService: FirebaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid authorization header',
      );
    }

    const token = authHeader.split('Bearer ')[1];

    try {
      const decodedToken = await this.firebaseService.auth.verifyIdToken(token);

      // Fetch user profile from Firestore
      const userDoc = await this.firebaseService.firestore
        .collection('users')
        .doc(decodedToken.uid)
        .get();

      const isAuthMeOrSetRole =
        request.url.includes('/auth/me') ||
        request.url.includes('/auth/set-role');

      if (!userDoc.exists && !isAuthMeOrSetRole) {
        throw new UnauthorizedException('User profile not found');
      }

      const userData = userDoc.exists ? userDoc.data() : {};

      if (userData?.status === 'suspended') {
        throw new UnauthorizedException('Account is suspended');
      }

      // Attach user to request
      request.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        ...userData,
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(`Token verification failed: ${error}`);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
