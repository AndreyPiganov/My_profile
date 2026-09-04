import { CallHandler, ExecutionContext, Inject, Injectable, LoggerService, NestInterceptor } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { GraphQLResolveInfo } from 'graphql';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const startedAt = Date.now();
    const contextType = context.getType<GqlContextType | 'http' | 'rpc'>();

    switch (contextType) {
      case 'graphql':
        return this.logGraphql(context, next, startedAt);

      case 'http':
        return this.logHttp(context, next, startedAt);

      case 'rpc':
        return this.logRpc(context, next, startedAt);

      default:
        return next.handle();
    }
  }

  private logGraphql(context: ExecutionContext, next: CallHandler, startedAt: number): Observable<unknown> {
    const gqlContext = GqlExecutionContext.create(context);
    const info = gqlContext.getInfo<GraphQLResolveInfo>();

    const operationType = info.operation.operation;
    const operationName = info.operation.name?.value ?? info.fieldName ?? 'anonymous';

    const operation = `${operationType} ${operationName}`;

    this.logger.log(`Incoming GraphQL operation: ${operation}`);

    return next.handle().pipe(
      tap({
        error: (error: unknown) => {
          const message = this.getErrorMessage(error);

          this.logger.error(`GraphQL operation failed: ${operation} — ${message}`);
        },
      }),
      finalize(() => {
        this.logger.log(`Completed GraphQL operation: ${operation} — ${Date.now() - startedAt}ms`);
      }),
    );
  }

  private logHttp(context: ExecutionContext, next: CallHandler, startedAt: number): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const { method, originalUrl } = request;

    this.logger.log(`Incoming HTTP request: ${method} ${originalUrl}`);

    return next.handle().pipe(
      finalize(() => {
        this.logger.log(
          `Completed HTTP request: ${method} ${originalUrl} ${response.statusCode} — ${Date.now() - startedAt}ms`,
        );
      }),
    );
  }

  private logRpc(context: ExecutionContext, next: CallHandler, startedAt: number): Observable<unknown> {
    const handlerName = context.getHandler().name;

    this.logger.log(`Incoming RPC request: ${handlerName}`);

    return next.handle().pipe(
      finalize(() => {
        this.logger.log(`Completed RPC request: ${handlerName} — ${Date.now() - startedAt}ms`);
      }),
    );
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'string') {
      return error;
    }

    return 'Unknown error';
  }
}
