import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from '@/core/config/env';
import { DatabaseModule } from '@/core/database/database.module';
import { StudentPlanModule } from './student-plan/student-plan.module';
import { SubjectCourseModule } from './subject-course/subject-course.module';

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
  ],
  controllers: [AppController],
})
export class AppModule {}
