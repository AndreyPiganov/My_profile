import { ConfigService } from '@nestjs/config';
import { utilities, WinstonModuleOptions } from 'nest-winston';
import { format, transports } from 'winston';

export function createWinstonConfig(configService: ConfigService): WinstonModuleOptions {
  const isProduction = configService.getOrThrow<string>('app.environment') === 'production';

  return {
    level: configService.getOrThrow<string>('app.logLevel'),
    format: format.combine(
      format.timestamp(),
      format.errors({ stack: true }),
      isProduction
        ? format.json()
        : utilities.format.nestLike('MyProfile', {
            colors: true,
            prettyPrint: true,
          }),
    ),
    transports: [new transports.Console()],
  };
}
