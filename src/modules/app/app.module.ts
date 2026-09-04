import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { WinstonModule } from 'nest-winston';
import { LoggingInterceptor } from '../../common/interceptors/LoggingInterceptor';
import configuration from '../../config/configuration';
import { validateEnvironment } from '../../config/environment.validation';
import { createWinstonConfig } from '../../config/winston.config';
import { DatabaseModule } from '../database/database.module';
import { ProfileModule } from '../profile/profile.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

function createSandboxPlugin(): NonNullable<ApolloDriverConfig['plugins']>[number] {
  // Apollo 5 publishes separate CJS and ESM declarations with a private HeaderMap field.
  // The runtime objects are compatible, but ts-jest cannot structurally compare the types.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  return ApolloServerPluginLandingPageLocalDefault({
    embed: true,
    footer: false,
    includeCookies: true,
  }) as unknown as NonNullable<ApolloDriverConfig['plugins']>[number];
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
      validate: validateEnvironment,
    }),
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: createWinstonConfig,
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): ApolloDriverConfig => ({
        path: '/graphql',
        autoSchemaFile: true,
        sortSchema: true,
        playground: false,
        graphiql: false,
        introspection: true,
        debug: configService.getOrThrow<string>('app.environment') !== 'production',
        plugins: [createSandboxPlugin()],
      }),
    }),
    DatabaseModule,
    ProfileModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
