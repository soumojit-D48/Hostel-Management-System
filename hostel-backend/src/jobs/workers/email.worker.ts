import { Worker } from 'bullmq';
import { bullmqConnection } from '../../config/bullmq';
import { emailService } from '../../shared/services/email.service';
import { logger } from '../../shared/services/logger.service';
import type { EmailJob } from '../../queues/email.queue';

export const startEmailWorker = () => {
  const worker = new Worker<EmailJob>(
    'email',
    async (job) => {
      const data = job.data;
      if (data.type === 'verify_email') {
        await emailService.sendVerificationEmail(data.to, data.token, data.userName);
        return;
      }
      if (data.type === 'reset_password') {
        await emailService.sendPasswordResetEmail(data.to, data.token, data.userName);
        return;
      }
    },
    { connection: bullmqConnection }
  );

  worker.on('failed', (job, err) => {
    logger.error({
      message: 'Email job failed',
      jobId: job?.id,
      name: job?.name,
      error: err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : err,
    });
  });

  return worker;
};


