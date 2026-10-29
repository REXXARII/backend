import { Controller, Get } from '@nestjs/common';
import { NeonService } from './neon.service';
import { Public } from '../../auth/auth.decorators';

@Controller('neon')
export class NeonController {
  constructor(private readonly neonService: NeonService) {}

  @Public()
  @Get('health')
  async getHealth() {
    return this.neonService.testAllServices();
  }

  @Public()
  @Get('postgres')
  async testPostgres() {
    return this.neonService.testPostgres();
  }

  @Public()
  @Get('auth')
  async testAuth() {
    return this.neonService.testAuth();
  }

  @Public()
  @Get('storage')
  async testStorage() {
    return this.neonService.testObjectStorage();
  }

  @Public()
  @Get('functions')
  async testFunctions() {
    return this.neonService.testFunctions();
  }

  @Public()
  @Get('realtime')
  async testRealtime() {
    return this.neonService.testRealtime();
  }
}

