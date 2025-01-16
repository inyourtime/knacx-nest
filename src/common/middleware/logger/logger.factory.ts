import { ConfigService } from '@nestjs/config';
import pino from 'pino';

export const createPinoLogger = (configService: ConfigService) => {
  const isProduction = configService.get('NODE_ENV') === 'production';

  return pino(
    {
      level: isProduction ? 'info' : 'debug',
      transport: !isProduction
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: true,
            },
          }
        : undefined,
    },
    pino.destination(configService.get('LOGGER_FILE_PATH')),
  );
};
