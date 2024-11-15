import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const isDev = configService.get<string>('NODE_ENV') === 'development';

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        if (isDev) {
          return new BadRequestException(
            errors.map((error) => ({
              property: error.property,
              constraints: Object.entries(error.constraints),
            })),
          );
        } else {
          return new BadRequestException('Invalid request data');
        }
      },
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(3000);
}

bootstrap();
