import { Module } from '@nestjs/common';
import { NeonService } from './neon.service';
import { NeonController } from './neon.controller';

@Module({
  controllers: [NeonController],
  providers: [NeonService],
  exports: [NeonService],
})
export class NeonModule {}

