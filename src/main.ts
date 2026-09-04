import { LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './modules/app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get<LoggerService>(WINSTON_MODULE_NEST_PROVIDER);
  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<number>('app.port');

  app.useLogger(logger);
  app.enableShutdownHooks();

  await app.listen(port, '0.0.0.0');
  logger.log(`Application is listening on http://localhost:${port}`);
  logger.log(`Apollo Sandbox is available at http://localhost:${port}/graphql`);
}

bootstrap().catch((error: unknown) => {
  console.error('Application bootstrap failed.', error);
  process.exitCode = 1;
});
