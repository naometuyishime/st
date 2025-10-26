import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getAuditLogs = async (
  filters: {
    userId?: number;
    action?: string;
    from?: Date;
    to?: Date;
  },
  page = 1,
  limit = 50
) => {
  const where: any = {};

  if (filters.userId) where.userId = filters.userId;
  if (filters.action)
    where.action = { contains: filters.action, mode: "insensitive" };
  if (filters.from || filters.to) {
    where.timestamps = {};
    if (filters.from) where.timestamps.gte = filters.from;
    if (filters.to) where.timestamps.lte = filters.to;
  }

  const [data, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { timestamps: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { user: { select: { id: true, username: true, email: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { data, total, page, limit };
};

export const getAuditLogById = async (id: number) => {
  return prisma.auditLog.findUnique({
    where: { id },
    include: { user: { select: { id: true, username: true, email: true } } },
  });
};
