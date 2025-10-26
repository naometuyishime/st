import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const addComment = async (reportId: number, focalPersonId: number, commentText: string) => {
  return prisma.comment.create({
    data: {
      reportId,
      focalPersonId,
      commentText,
    },
    include: {
      report: {
        include: {
          actionPlan: true,
        },
      },
    },
  });
};

export const getCommentsByReport = async (reportId: number) => {
  return prisma.comment.findMany({
    where: { reportId },
    include: { focalPerson: true },
    orderBy: { createdAt: 'desc' },
  });
};