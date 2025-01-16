import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class QueueService {
  constructor(@InjectQueue('emailQueue') private readonly emailQueue: Queue) {}

  async addEmailToQueue(emailData: { to: string; subject: string; body: string }) {
    const job = await this.emailQueue.add('sendEmail', emailData, {
      attempts: 3, // จำนวนครั้งที่พยายามส่งใหม่เมื่อมีข้อผิดพลาด
    });

    return { jobId: job.id, message: 'Email added to queue' };
  }

  async getJobStatus(jobId: string) {
    const job = await this.emailQueue.getJob(jobId);

    if (!job) {
      return { message: 'Job not found' };
    }

    // waiting, active, completed, failed
    const state = await job.getState();
    const progress = job.progress();
    const attemptsMade = job.attemptsMade;

    return {
      id: job.id,
      state,
      progress,
      attemptsMade,
      data: job.data,
    };
  }
}
