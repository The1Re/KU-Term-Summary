import { Module } from '@nestjs/common';
import { TermSummaryService } from './term-summary.service';
import { StudentModule } from '../student/student.module';
import { StudentPlanModule } from '../student-plan/student-plan.module';
import { RegisterModule } from '../register/register.module';
import { TermSummaryUseCase } from './term-summary.usecase';
import { TermSummaryController } from './term-summary.controller';

@Module({
  imports: [StudentModule, StudentPlanModule, RegisterModule],
  providers: [TermSummaryService, TermSummaryUseCase],
  controllers: [TermSummaryController],
})
export class TermSummaryModule {}
