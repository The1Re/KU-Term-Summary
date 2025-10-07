import { Module } from '@nestjs/common';
import { StudentPlanService } from './student-plan.service';
import { StudentModule } from '@/modules/student/student.module';
import { SubjectCourseModule } from '@/modules/subject-course/subject-course.module';
import { StudentPlanUsecase } from './student-plan.usecase';

@Module({
  imports: [StudentModule, SubjectCourseModule],
  providers: [StudentPlanService, StudentPlanUsecase],
})
export class StudentPlanModule {}
