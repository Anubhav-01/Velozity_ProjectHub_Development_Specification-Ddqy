import { initOverdueJob } from './overdue.job';

export function startBackgroundJobs(): void {
  initOverdueJob();
}

export * from './overdue.job';
