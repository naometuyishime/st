import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface CreateKpiPlanDto {
  kpiId: number;
  plannedValue: number;
}

export interface CreateActionPlanDto {
  yearId: number;
  stakeholderSubclusterId: number;
  stakeholderId?: number | null;
  document?: string | null;
  comment?: string | null;
  description?: string | null;
  planLevel: "country" | "province" | "district";
  districtId?: number | null;
  provinceId?: number | null;
  countryId?: number | null;
  kpiPlans: CreateKpiPlanDto[];
}

export const createActionPlan = async (dto: CreateActionPlanDto) => {
  return await prisma.$transaction(async (tx) => {
    const actionPlan = await tx.actionPlan.create({
      data: {
        yearId: dto.yearId,
        stakeholderSubclusterId: dto.stakeholderSubclusterId,
        stakeholderId: dto.stakeholderId ?? null,
        document: dto.document ?? "",
        comment: dto.comment ?? "",
        description: dto.description ?? "",
        planLevel: dto.planLevel,
        districtId: dto.districtId ?? 0,
        provinceId: dto.provinceId ?? 0,
        countryId: dto.countryId ?? 0,
      },
    });

    const kpiPlansData = dto.kpiPlans.map((kp) => ({
      kpiId: kp.kpiId,
      actionPlanId: actionPlan.id,
      plannedValue: kp.plannedValue,
    }));

    await tx.kpiPlan.createMany({
      data: kpiPlansData,
    });

    // return action plan with its kpiPlans and include KPI details and stakeholderSubcluster (subCluster)
    return tx.actionPlan.findUnique({
      where: { id: actionPlan.id },
      include: {
        kpiPlans: { include: { kpi: true } },
        financialYear: true,
        stakeholder: true,
        stakeholderSubcluster: {
          select: { id: true, name: true},
        },
      },
    });
  });
};

export const checkForDuplicateKpiPlan = async (
  yearId: number,
  kpiId: number,
  planLevel: string,
  countryId?: number,
  provinceId?: number,
  districtId?: number
) => {
  // find kpiPlans joined to action plans of same year with matching area
  const duplicates = await prisma.kpiPlan.findFirst({
    where: {
      kpiId,
      actionPlan: {
        yearId,
        planLevel,
        OR: [
          {
            countryId: planLevel === "country" ? (countryId ?? -1) : undefined,
          },
          {
            provinceId:
              planLevel === "province" ? (provinceId ?? -1) : undefined,
          },
          {
            districtId:
              planLevel === "district" ? (districtId ?? -1) : undefined,
          },
        ],
      },
    },
  });

  return !!duplicates;
};

export const getActionPlanById = async (id: number) => {
  return prisma.actionPlan.findUnique({
    where: { id },
    include: {
      kpiPlans: { include: { kpi: true } },
      financialYear: true,
      stakeholder: true,
      stakeholderSubcluster: {
        select: { id: true, name: true},
      },
    },
  });
};

export const searchActionPlans = async (filters: {
  yearId?: number;
  subClusterId?: number;
  kpiId?: number;
  countryId?: number;
  provinceId?: number;
  districtId?: number;
  stakeholderSubclusterId?: number;
  stakeholderId?: number;
}) => {
  const where: Prisma.ActionPlanWhereInput = {};

  if (filters.yearId) where.yearId = filters.yearId;
  if (filters.stakeholderSubclusterId)
    where.stakeholderSubclusterId = filters.stakeholderSubclusterId;
  if (filters.countryId) where.countryId = filters.countryId;
  if (filters.provinceId) where.provinceId = filters.provinceId;
  if (filters.districtId) where.districtId = filters.districtId;
  if (filters.stakeholderId) where.stakeholderId = filters.stakeholderId;

  if (filters.subClusterId) {
    (where as any).kpiPlans = {
      some: {
        kpi: {
          subClusterId: filters.subClusterId,
        },
      },
    };
  }

  const actionPlans = await prisma.actionPlan.findMany({
    where,
    include: {
      kpiPlans: filters.kpiId
        ? { where: { kpiId: filters.kpiId }, include: { kpi: true } }
        : { include: { kpi: true } },
      stakeholder: true,
      stakeholderSubcluster: { select: { id: true, name: true } },
      financialYear: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return actionPlans;
};

export const updateActionPlan = async (
  id: number,
  data: Partial<CreateActionPlanDto>
) => {
  const updateData: Prisma.ActionPlanUpdateInput = {
    document: data.document ?? undefined,
    comment: data.comment ?? undefined,
    description: data.description ?? undefined,
    planLevel: data.planLevel,
    districtId: data.districtId ?? undefined,
    provinceId: data.provinceId ?? undefined,
    countryId: data.countryId ?? undefined,
  };

  return prisma.actionPlan.update({
    where: { id },
    data: updateData,
  });
};

export const deleteActionPlan = async (id: number) => {
  return prisma.$transaction(async (tx) => {
    await tx.kpiPlan.deleteMany({ where: { actionPlanId: id } });
    return tx.actionPlan.delete({ where: { id } });
  });
};
