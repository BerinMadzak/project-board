import { Router, Request, Response } from 'express';
import prisma from '../db/prisma-client';
import { authMiddleware } from '../middleware/auth-middleware';

const analyticsRouter = Router();

analyticsRouter.use(authMiddleware);

analyticsRouter.get('/project/:projectId', async (req: Request, res: Response) => {
  const { projectId } = req.params;

  const statusCounts = await prisma.task.groupBy({
    by: ['status'],
    where: { projectId: projectId as string },
    _count: { status: true }
  });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const completedTasks = await prisma.task.findMany({
    where: {
      projectId: projectId as string,
      status: 'DONE',
      updatedAt: { gte: thirtyDaysAgo }
    },
    select: { updatedAt: true },
    orderBy: { updatedAt: 'asc' }
  });

  const overdueCount = await prisma.task.count({
    where: {
      projectId: projectId as string,
      status: { not: 'DONE' },
      dueDate: { lt: new Date() }
    }
  });

  const recentTasks = await prisma.task.findMany({
    where: { projectId: projectId as string },
    orderBy: { updatedAt: 'desc' },
    take: 10,
    select: { title: true, status: true }
  });

  const countMap = { DONE: 0, IN_PROGRESS: 0, TODO: 0 } as Record<string, number>;
  statusCounts.forEach(({ status, _count }) => {
    countMap[status] = _count.status;
  });
  const total = Object.values(countMap).reduce((a, b) => a + b, 0);

  const grouped: Record<string, number> = {};
  completedTasks.forEach(({ updatedAt }) => {
    const label = updatedAt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    grouped[label] = (grouped[label] ?? 0) + 1;
  });
  const completionData = Object.entries(grouped).map(([date, completed]) => ({
    date,
    completed
  }));

  res.json({
    stats: {
      total,
      completed: countMap.DONE,
      inProgress: countMap.IN_PROGRESS,
      overdue: overdueCount,
    },
    completionData,
    tasks: recentTasks
  });
});

export default analyticsRouter;