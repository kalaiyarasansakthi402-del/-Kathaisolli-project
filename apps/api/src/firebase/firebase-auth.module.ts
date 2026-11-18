import { Module } from '@nestjs/common';
import { FirebaseAdminModule } from './firebase-admin.module';
import { FirebaseAuthController } from './firebase-auth.controller';
import { FirebaseAuthGuard } from './firebase-auth.guard';

@Module({
  imports: [FirebaseAdminModule],
  controllers: [FirebaseAuthController],
  providers: [FirebaseAuthGuard],
})
export class FirebaseAuthModule {}
