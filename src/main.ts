import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'api/v',
    defaultVersion: '1',
  });

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const config = new DocumentBuilder().setTitle('API').build();
  const document = SwaggerModule.createDocument(app, config);
  app.use(
    '/reference',
    apiReference({
      spec: {
        content: document,
      },
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
