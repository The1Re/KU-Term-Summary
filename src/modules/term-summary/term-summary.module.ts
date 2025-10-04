import { Module } from '@nestjs/common';
import { TermSummaryService } from './term-summary.service';

@Module({
  providers: [TermSummaryService],
})
export class TermSummaryModule {}
