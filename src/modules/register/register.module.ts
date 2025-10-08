import { Module } from '@nestjs/common';
import { RegisterService } from './register.service';
import { DatabaseModule } from '@/core/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [RegisterService],
  exports: [RegisterService],
})
export class RegisterModule {}
