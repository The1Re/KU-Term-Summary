import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from '@/core/config/env';
import { DatabaseModule } from '@/core/database/database.module';
import { StudentPlanModule } from '@/modules/student-plan/student-plan.module';
import { StudentModule } from '@/modules/student/student.module';
import { SubjectCourseModule } from './subject-course/subject-course.module';
import { TermSummaryModule } from './term-summary/term-summary.module';
import { RegisterModule } from './register/register.module';

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
    StudentModule,
    SubjectCourseModule,
    TermSummaryModule,
    RegisterModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
