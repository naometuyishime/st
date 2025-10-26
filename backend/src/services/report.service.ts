import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface ReportOptionDto {
  optionId: number;
  optionValue: number;
}

export interface CreateReportDto {
  actionPlanId: number;
  yearId: number;
  kpiPlanId: number;
  quarterId: number;
  actualValue: number;
  progressSummary?: string;
  reportDocument?: string | null;
  options?: ReportOptionDto[]; // disaggregated values
}

export const createReport = async (dto: CreateReportDto) => {
  return prisma.$transaction(async (tx) => {
    const report = await tx.report.create({
      data: {
        actionPlanId: dto.actionPlanId,
        yearId: dto.yearId,
        kpiPlanId: dto.kpiPlanId,
        quarterId: dto.quarterId,
        actualValue: dto.actualValue,
        progressSummary: dto.progressSummary ?? "",
        reportDocument: dto.reportDocument ?? "",
      },
    });

    if (dto.options?.length) {
      for (const opt of dto.options) {
        await tx.reportOption.create({
          data: {
            reportId: report.id,
            optionId: opt.optionId,
            optionValue: opt.optionValue.toString(),
          },
        });
      }
    }

    return tx.report.findUnique({
      where: { id: report.id },
      include: { actionPlan: true },
    });
  });
};

export const getReportsForActionPlan = async (actionPlanId: number) => {
  return prisma.report.findMany({
    where: { actionPlanId },
    orderBy: { id: "desc" },
    include: { /* include options if model exists */ },
  });
};

export const getReportById = async (id: number) => {
  return prisma.report.findUnique({ where: { id } });
};
