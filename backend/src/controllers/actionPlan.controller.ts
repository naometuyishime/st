import { Request, Response } from "express";
import * as service from "../services/actionPlan.service";
import logger, { saveAuditLog } from "../utils/logger";
import { getStakeholderById as getStakeholderByIdService } from "../services/stakeholder.service";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createActionPlan = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    if (
      !payload.yearId ||
      !payload.stakeholderSubclusterId ||
      !payload.kpiPlans?.length
    ) {
      return res.status(400).json({
        message:
          "Missing required fields: yearId, stakeholderSubclusterId or kpiPlans",
      });
    }

    // validate stakeholderSubclusterId (must reference existing SubCluster)
    const scId = Number(payload.stakeholderSubclusterId);
    if (Number.isNaN(scId)) {
      return res
        .status(400)
        .json({ message: "Invalid stakeholderSubclusterId" });
    }
    const subCluster = await prisma.subCluster.findUnique({
      where: { id: scId },
    });
    if (!subCluster)
      return res
        .status(400)
        .json({
          message:
            "Provided stakeholderSubclusterId (sub-cluster) does not exist",
        });

    if (payload.stakeholderId) {
      const stakeholder = await getStakeholderByIdService(
        Number(payload.stakeholderId)
      );
      if (!stakeholder) {
        return res
          .status(400)
          .json({ message: "Provided stakeholderId does not exist" });
      }
    }

    for (const kp of payload.kpiPlans) {
      const duplicate = await service.checkForDuplicateKpiPlan(
        payload.yearId,
        kp.kpiId,
        payload.planLevel,
        payload.countryId,
        payload.provinceId,
        payload.districtId
      );
      if (duplicate) {
        return res.status(409).json({
          message: `Duplicate planning detected for KPI ${kp.kpiId} in the selected area/year. Please review existing plans.`,
        });
      }
    }

    const plan = await service.createActionPlan(payload);
    logger.info(
      `Action plan created (id=${plan?.id}) by user=${
        (req as any).user?.userId ?? "anonymous"
      }`
    );
    await saveAuditLog(
      req,
      (req as any).user?.userId ?? (req as any).user?.id ?? 0,
      "CREATE_ACTION_PLAN",
      "A new action plan was created",
      `ActionPlan ID: ${plan?.id}; stakeholderId: ${payload.stakeholderId ?? "none"}; stakeholderSubclusterId: ${payload.stakeholderSubclusterId}`
    );

    res.status(201).json({ message: "Action plan created successfully", plan });
  } catch (err) {
    logger.error("Failed to create action plan: %o", err);
    res.status(500).json({
      message: "Failed to create action plan",
      error: (err as Error).message,
    });
  }
};

export const getActionPlan = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const plan = await service.getActionPlanById(id);
    if (!plan)
      return res.status(404).json({ message: "Action plan not found" });

    await saveAuditLog(
      req,
      (req as any).user?.userId ?? (req as any).user?.id ?? 0,
      "GET_ACTION_PLAN",
      "Fetched action plan",
      `ActionPlan ID: ${id}`
    );

    res.json(plan);
  } catch (err) {
    logger.error("Failed to fetch action plan: %o", err);
    res.status(500).json({ message: "Failed to fetch action plan" });
  }
};

export const searchActionPlans = async (req: Request, res: Response) => {
  try {
    const filters = req.query as unknown as {
      yearId?: number;
      subClusterId?: number;
      kpiId?: number;
      countryId?: number;
      provinceId?: number;
      districtId?: number;
      stakeholderId?: number;
    };
    const results = await service.searchActionPlans(filters);
    await saveAuditLog(
      req,
      (req as any).user?.userId ?? (req as any).user?.id ?? 0,
      "SEARCH_ACTION_PLANS",
      "Searched action plans",
      `filters: ${JSON.stringify(filters)}`
    );
    res.json(results);
  } catch (err) {
    logger.error("Failed to search action plans: %o", err);
    res.status(500).json({ message: "Failed to search action plans" });
  }
};

export const updateActionPlan = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const updated = await service.updateActionPlan(id, req.body);
    logger.info(
      `ActionPlan updated id=${id} by user=${req.user?.userId ?? "unknown"}`
    );
    await saveAuditLog(
      req,
      req.user?.userId ?? 0,
      "UPDATE_ACTION_PLAN",
      "Action plan updated",
      `ActionPlan ID: ${id}`
    );
    res.json({ message: "Action plan updated successfully", updated });
  } catch (err) {
    logger.error("Failed to update action plan: %o", err);
    res.status(500).json({ message: "Failed to update action plan" });
  }
};

export const deleteActionPlan = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await service.deleteActionPlan(id);
    logger.info(
      `ActionPlan deleted id=${id} by user=${req.user?.userId ?? "unknown"}`
    );
    await saveAuditLog(
      req,
      req.user?.userId ?? 0,
      "DELETE_ACTION_PLAN",
      "Action plan deleted",
      `ActionPlan ID: ${id}`
    );
    res.json({ message: "Action plan deleted successfully" });
  } catch (err) {
    logger.error("Failed to delete action plan: %o", err);
    res.status(500).json({ message: "Failed to delete action plan" });
  }
};
