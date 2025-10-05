import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvType } from '../config/env';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly configService: ConfigService<EnvType>) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;

    const message =
      status !== 500 && exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    if (this.configService.get('NODE_ENV') !== 'production') {
      this.logger.error(
        'Exception caught',
        exception instanceof Error ? exception.stack : ''
      );
    }

    response.status(status).json({
      message:
        typeof message === 'object'
          ? (message as { message: string }).message
          : message,
    });
  }
}
