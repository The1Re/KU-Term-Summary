import { Module } from '@nestjs/common';
import { TermCreditService } from './term-credit.service';

@Module({
  providers: [TermCreditService],
  exports: [TermCreditService],
})
export class TermCreditModule {}
