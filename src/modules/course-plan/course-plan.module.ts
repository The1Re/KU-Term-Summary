import { Module } from '@nestjs/common';
import { CoursePlanService } from './course-plan.service';

@Module({
  providers: [CoursePlanService],
  exports: [CoursePlanService],
})
export class CoursePlanModule {}
