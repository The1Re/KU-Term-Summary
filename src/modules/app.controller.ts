import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller({
  version: VERSION_NEUTRAL,
})
export class AppController {
  constructor() {}

  @Get()
  @ApiExcludeEndpoint()
  root() {
    return { message: 'Welcome to KU Term Summary API Service' };
  }
}
