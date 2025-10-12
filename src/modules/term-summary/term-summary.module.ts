import { Module } from '@nestjs/common';
import { TermSummaryService } from './term-summary.service';
import { StudentModule } from '../student/student.module';
import { StudentPlanModule } from '../student-plan/student-plan.module';
import { RegisterModule } from '../register/register.module';
import { TermSummaryUseCase } from './term-summary.usecase';
import { TermSummaryController } from './term-summary.controller';
import { TermCreditModule } from '../term-credit/term-credit.module';

@Module({
  imports: [StudentModule, StudentPlanModule, RegisterModule, TermCreditModule],
  providers: [TermSummaryService, TermSummaryUseCase],
  controllers: [TermSummaryController],
})
export class TermSummaryModule {}
