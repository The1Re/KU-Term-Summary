import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';

@Controller({
  version: VERSION_NEUTRAL,
})
export class AppController {
  constructor() {}

  @Get()
  root() {
    return { message: 'Welcome to KU Term Summary API Service' };
  }
}
