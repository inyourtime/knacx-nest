import { Injectable, Inject, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Logger } from 'pino';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(@Inject('PinoLogger') private readonly logger: Logger) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const startTime = Date.now();

    res.on('finish', () => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      this.logger.info({
        method,
        url: originalUrl,
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`,
      });
    });

    next();
  }
}
