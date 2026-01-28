import { Queue } from 'bullmq';
import { bullmqConnection } from '../config/bullmq';

export type EmailJob =
  | { type: 'verify_email'; to: string; token: string; userName: string }
  | { type: 'reset_password'; to: string; token: string; userName: string };

export const emailQueue = new Queue<EmailJob>('email', {
  connection: bullmqConnection,
});

export const enqueueEmail = async (job: EmailJob) => {
  return emailQueue.add(job.type, job, {
    removeOnComplete: 1000,
    removeOnFail: 5000,
  });
};


