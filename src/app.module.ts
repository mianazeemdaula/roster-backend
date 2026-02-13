import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CompaniesModule } from './companies/companies.module';
import { CompanyUsersModule } from './company-users/company-users.module';
import { LocationsModule } from './locations/locations.module';
import { ShiftTemplatesModule } from './shift-templates/shift-templates.module';
import { RostersModule } from './rosters/rosters.module';
import { AttendanceModule } from './attendance/attendance.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ShiftAdvertsModule } from './shift-adverts/shift-adverts.module';
import { CompanyDocumentsModule } from './company-documents/company-documents.module';
import { ShiftAttachmentsModule } from './shift-attachments/shift-attachments.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    CompaniesModule,
    CompanyUsersModule,
    LocationsModule,
    ShiftTemplatesModule,
    RostersModule,
    AttendanceModule,
    NotificationsModule,
    ShiftAdvertsModule,
    CompanyDocumentsModule,
    ShiftAttachmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
