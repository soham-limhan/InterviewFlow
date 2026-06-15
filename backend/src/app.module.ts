import { Module } from '@nestjs/common';
import { ConfigModule } from './core/config/config.module';
import { FirebaseModule } from './core/firebase/firebase.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { CandidatesModule } from './modules/candidates/candidates.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { InterviewsModule } from './modules/interviews/interviews.module';
import { AiModule } from './modules/ai/ai.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { StorageModule } from './modules/storage/storage.module';

@Module({
  imports: [
    ConfigModule,
    FirebaseModule,
    AuthModule,
    UsersModule,
    JobsModule,
    CandidatesModule,
    ApplicationsModule,
    InterviewsModule,
    AiModule,
    AnalyticsModule,
    NotificationsModule,
    StorageModule,
  ],
})
export class AppModule {}
