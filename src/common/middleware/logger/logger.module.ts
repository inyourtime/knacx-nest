import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createPinoLogger } from './logger.factory';

@Global()
@Module({
  providers: [
    {
      provide: 'PinoLogger',
      useFactory: (configService: ConfigService) => createPinoLogger(configService),
      inject: [ConfigService],
    },
  ],
  exports: ['PinoLogger'],
})
export class LoggerModule {}
