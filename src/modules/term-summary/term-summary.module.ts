import { Module } from '@nestjs/common';
import { TermSummaryService } from './term-summary.service';
import { StudentModule } from '../student/student.module';
import { TermSummaryController } from './term-summary.controller';
import { TermSummaryUsecase } from './term-summary.usecase';
import { StudentPlanModule } from '../student-plan/student-plan.module';
import { RegisterModule } from '../register/register.module';

@Module({
  imports: [StudentModule, StudentPlanModule, RegisterModule],
  providers: [TermSummaryService, TermSummaryUsecase],
  controllers: [TermSummaryController],
})
export class TermSummaryModule {}
