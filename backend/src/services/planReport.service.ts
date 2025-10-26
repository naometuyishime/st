import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getPlansBySubCluster = async (subClusterId: number) => {
  return prisma.actionPlan.findMany({
    where: { stakeholderSubclusterId: subClusterId },
    include: { reports: true },
  });
};

export const getReportsBySubCluster = async (subClusterId: number) => {
  return prisma.report.findMany({
    where: { actionPlan: { stakeholderSubclusterId: subClusterId } },
    include: { actionPlan: true, comments: true },
  });
};