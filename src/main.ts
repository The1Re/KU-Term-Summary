import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { AllExceptionsFilter } from '@/core/filters/all-exception.filter';
import { ConfigService } from '@nestjs/config';
import { EnvType } from './core/config/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService<EnvType>);

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter(configService));
  app.enableCors();
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const config = new DocumentBuilder()
    .setTitle('KU Term Summary API')
    .setDescription('KU Term Summary API description')
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(configService.getOrThrow('PORT'));

  const appUrl = await app.getUrl();
  console.log(`
    🚀 Application is running on: ${appUrl}
    📚 Swagger documentation available at: ${appUrl}/docs
  `);
}
void bootstrap();
