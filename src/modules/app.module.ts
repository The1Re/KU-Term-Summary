import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from '@/core/config/env';
import { DatabaseModule } from '@/core/database/database.module';
import { StudentPlanModule } from './student-plan/student-plan.module';
import { SubjectCourseModule } from './subject-course/subject-course.module';
import { TermSummaryModule } from './term-summary/term-summary.module';
import { TermCreditModule } from './term-credit/term-credit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: config => {
        return validateEnv(config);
      },
    }),
    DatabaseModule,
    StudentPlanModule,
    SubjectCourseModule,
    TermSummaryModule,
    TermCreditModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
