import { Module } from '@nestjs/common';
import { StatusStudentService } from './status-student.service';
import { TermSummaryModule } from '../term-summary/term-summary.module';

@Module({
  imports: [TermSummaryModule],
  providers: [StatusStudentService],
})
export class StatusStudentModule {}
