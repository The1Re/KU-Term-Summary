import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  @Get()
  root() {
    return { message: 'Welcome to KU Term Summary API Service' };
  }
}
