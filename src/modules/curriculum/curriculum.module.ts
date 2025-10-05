import { Module } from '@nestjs/common';
import { StudentModule } from '../student/student.module';
import { CurriculumService } from './curriculum.service';
import { StudentPlanModule } from '../student-plan/student-plan.module';

@Module({
  imports: [StudentModule, StudentPlanModule],
  providers: [CurriculumService],
})
export class CurriculumModule {}
