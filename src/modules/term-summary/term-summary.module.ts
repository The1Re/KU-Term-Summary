import { Module } from '@nestjs/common';
import { TermSummaryService } from './term-summary.service';
import { StudentModule } from '../student/student.module';
import { TermSummaryController } from './term-summary.controller';

@Module({
  imports: [StudentModule],
  providers: [TermSummaryService],
  controllers: [TermSummaryController],
})
export class TermSummaryModule {}
