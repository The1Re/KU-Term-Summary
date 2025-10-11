import { Module } from '@nestjs/common';
import { TermSummaryService } from './term-summary.service';
import { StudentModule } from '../student/student.module';
import { StudentPlanModule } from '../student-plan/student-plan.module';
import { RegisterModule } from '../register/register.module';
import { TermSummaryUseCase } from './term-summary.usecase';

@Module({
  imports: [StudentModule, StudentPlanModule, RegisterModule],
  providers: [TermSummaryService, TermSummaryUseCase],
})
export class TermSummaryModule {}
