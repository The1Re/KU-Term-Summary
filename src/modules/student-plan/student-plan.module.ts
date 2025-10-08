import { Module } from '@nestjs/common';
import { StudentPlanService } from './student-plan.service';
import { StudentPlanController } from './student-plan.controller';
import { StudentModule } from '@/modules/student/student.module';
import { SubjectCourseModule } from '@/modules/subject-course/subject-course.module';
import { RegisterModule } from '@/modules/register/register.module';
import { StudentPlanUsecase } from './student-plan.usecase';

@Module({
  imports: [StudentModule, SubjectCourseModule, RegisterModule],
  providers: [StudentPlanService, StudentPlanUsecase],
  controllers: [StudentPlanController],
  exports: [StudentPlanService, StudentPlanUsecase],
})
export class StudentPlanModule {}
