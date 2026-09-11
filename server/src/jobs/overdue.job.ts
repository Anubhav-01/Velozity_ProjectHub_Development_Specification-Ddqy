import cron from 'node-cron';
import prisma from '../config/prisma';
import { logger } from '../utils/logger';
import { TaskStatus } from '@prisma/client';

/**
 * Background job to check and mark overdue tasks.
 * Runs every hour at minute 0 (0 * * * *).
 * Idempotent: Only updates tasks where isOverdue is currently false,
 * dueDate < NOW, and status is not DONE.
 */
export function initOverdueJob(): cron.ScheduledTask {
  logger.info('Initializing overdue tasks cron job (schedule: 0 * * * *)');

  // Run once immediately on startup to ensure consistency
  checkAndMarkOverdueTasks();

  const task = cron.schedule('0 * * * *', async () => {
    logger.info('Running scheduled overdue task check...');
    await checkAndMarkOverdueTasks();
  });

  return task;
}

export async function checkAndMarkOverdueTasks(): Promise<number> {
  try {
    const now = new Date();
    const result = await prisma.task.updateMany({
      where: {
        dueDate: { lt: now },
        status: { notIn: [TaskStatus.DONE] },
        isOverdue: false, // Idempotent check
      },
      data: {
        isOverdue: true,
      },
    });

    if (result.count > 0) {
      logger.info(`[Overdue Job] Successfully marked ${result.count} tasks as overdue`);
    } else {
      logger.debug('[Overdue Job] No newly overdue tasks found');
    }

    return result.count;
  } catch (error) {
    logger.error('[Overdue Job] Error running overdue task check', { error });
    return 0;
  }
}
