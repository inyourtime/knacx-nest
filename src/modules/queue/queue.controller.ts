import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { QueueService } from './queue.service';

@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post('add-email')
  async addEmailToQueue(@Body() body: { to: string; subject: string; body: string }) {
    return this.queueService.addEmailToQueue(body);
  }

  @Get('status')
  async getQueueStatus(@Query('id') id: string) {
    return this.queueService.getJobStatus(id);
  }
}
