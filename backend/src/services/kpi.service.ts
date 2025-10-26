import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createSubCluster = async (
  name: string,
  description: string,
) => {
  return await prisma.subCluster.create({
    data: { name, description },
  });
};

// Create KPI
export const createKPI = async (
  name: string,
  description: string,
  unit: string,
  subClusterId: number,
  kpiCategoryId?: number,
  stakeholderCategoryId?: number,
  targetValue?: number | null,
  currentValue?: number | null
) => {
  const data: any = {
    name,
    description,
    unit,
    subClusterId,
    targetValue: targetValue ?? null,
    currentValue: currentValue ?? null,
  };

  if (kpiCategoryId !== undefined) data.kpiCategoryId = kpiCategoryId;
  if (stakeholderCategoryId !== undefined) data.stakeholderCategoryId = stakeholderCategoryId;

  return await prisma.kPI.create({ data });
};

// Create KpiCategory
export const createKpiCategory = async (name: string, subClusterId: number) => {
  return await prisma.kpiCategory.create({
    data: {
      name,
      subClusterId,
    },
  });
};


export const getSubClusters = async () => {
  return await prisma.subCluster.findMany({
    orderBy: { name: "asc" },
  });
};

// New: Get KPIs with optional filters subClusterId and kpiCategoryId
export const getKpis = async (
  subClusterId?: number,
  kpiCategoryId?: number
) => {
  const where: any = {};
  if (subClusterId !== undefined) where.subClusterId = subClusterId;
  if (kpiCategoryId !== undefined) where.kpiCategoryId = kpiCategoryId;

  return await prisma.kPI.findMany({
    where: Object.keys(where).length ? where : undefined,
    orderBy: { name: "asc" },
    include: {
      subCluster: { select: { id: true, name: true } },
      kpiCategory: true,
      stakeholderCategory: true,
    },
  });
};

// New: Get KPI categories optionally filtered by subClusterId
export const getKpiCategories = async (subClusterId?: number) => {
  const where = subClusterId ? { subClusterId } : undefined;
  return await prisma.kpiCategory.findMany({
    where,
    orderBy: { name: "asc" },
  });
};
