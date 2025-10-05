import { Module } from '@nestjs/common';
import { TermSummaryService } from './term-summary.service';
import { StudentModule } from '../student/student.module';

@Module({
  imports: [StudentModule],
  providers: [TermSummaryService],
})
export class TermSummaryModule {}
