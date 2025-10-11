import { DatabaseModule } from '@/core/database/database.module';
import { Module } from '@nestjs/common';
import { RegisterService } from './register.service';

@Module({
  imports: [DatabaseModule],
  providers: [RegisterService],
  exports: [RegisterService],
})
export class RegisterModule {}
