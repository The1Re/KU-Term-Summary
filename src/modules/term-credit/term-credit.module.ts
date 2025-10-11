import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/core/database/database.module';
import { TermCreditService } from './term-credit.service';

@Module({
  imports: [DatabaseModule],
  providers: [TermCreditService],
  controllers: [],
  exports: [TermCreditService],
})
export class TermCreditModule {}
