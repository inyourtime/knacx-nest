import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('emailQueue')
export class QueueProcessor {
  @Process('sendEmail')
  async handleSendEmail(job: Job) {
    const { to, subject, body } = job.data;

    console.log(`Sending email to: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);

    // Simulate sending email
    await new Promise((resolve) => setTimeout(resolve, 10000));

    console.log('Email sent successfully');
  }
}
