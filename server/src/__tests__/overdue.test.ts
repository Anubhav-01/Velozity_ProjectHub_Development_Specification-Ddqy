import { checkAndMarkOverdueTasks } from '../jobs/overdue.job';
import prisma from '../config/prisma';

jest.mock('../config/prisma', () => ({
  __esModule: true,
  default: {
    task: {
      updateMany: jest.fn(),
    },
  },
}));

describe('Overdue Task Cron Job', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be idempotent and update only un-flagged overdue tasks', async () => {
    (prisma.task.updateMany as jest.Mock).mockResolvedValue({ count: 3 });

    const updatedCount = await checkAndMarkOverdueTasks();

    expect(updatedCount).toBe(3);
    expect(prisma.task.updateMany).toHaveBeenCalledWith({
      where: {
        dueDate: { lt: expect.any(Date) },
        status: { notIn: ['DONE'] },
        isOverdue: false, // Ensures idempotence
      },
      data: {
        isOverdue: true,
      },
    });
  });
});
