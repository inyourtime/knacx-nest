import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { QueueService } from './queue.service';
import { QueueProcessor } from './queue.processor';
import { QueueController } from './queue.controller';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.getOrThrow('REDIS_HOST'),
          port: configService.getOrThrow('REDIS_PORT'),
        },
      }),
    }),
    BullModule.registerQueue({
      name: 'emailQueue',
    }),
  ],
  providers: [QueueService, QueueProcessor],
  exports: [QueueService],
  controllers: [QueueController],
})
export class QueueModule {}
