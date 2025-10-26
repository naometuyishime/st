import { Request, Response } from "express";
import * as kpiService from "../services/kpi.service";
import logger, { saveAuditLog } from "../utils/logger";
import UserModel from "../models/user.model";

// Create SubCluster
export const createSubCluster = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;


    const subCluster = await kpiService.createSubCluster(
      name,
      description,
    );

    // Log action and save audit log
    logger.info(
      `SubCluster created: ${name}`
    );
    await saveAuditLog(
      req,
      (req as any).user?.userId ?? (req as any).user?.id ?? null,
      "CREATE_SUB_CLUSTER",
      "A new sub-cluster was created",
      `SubCluster Name: ${name}; `
    );

    res.status(201).json({ message: "SubCluster created", subCluster });
  } catch (error) {
    logger.error(
      `Error creating sub-cluster: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    res.status(400).json({ message: "Error creating sub-cluster" });
  }
};

// Create KPI
export const createKPI = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      unit,
      subClusterId,
      kpiCategoryId,
      stakeholderCategoryId,
      targetValue,
      currentValue,
    } = req.body;

    if (!name || !subClusterId) {
      return res
        .status(400)
        .json({ message: "name and subClusterId are required" });
    }

    const subClusterIdNum = Number(subClusterId);
    if (Number.isNaN(subClusterIdNum)) {
      return res.status(400).json({ message: "Invalid subClusterId" });
    }

    const created = await kpiService.createKPI(
      name,
      description ?? "",
      unit ?? "",
      subClusterIdNum,
      kpiCategoryId ? Number(kpiCategoryId) : undefined,
      stakeholderCategoryId ? Number(stakeholderCategoryId) : undefined,
      targetValue !== undefined ? Number(targetValue) : undefined,
      currentValue !== undefined ? Number(currentValue) : undefined
    );

    logger.info(
      `KPI created: ${created.name} (subClusterId=${created.subClusterId})`
    );
    await saveAuditLog(
      req,
      (req as any).user?.userId ?? (req as any).user?.id ?? 0,
      "CREATE_KPI",
      "KPI created",
      `KPI ID: ${created.id}; target=${created.targetValue ?? "n/a"}; current=${created.currentValue ?? "n/a"}`
    );

    res.status(201).json({ message: "KPI created", kpi: created });
  } catch (error) {
    logger.error(
      `Create KPI failed: ${error instanceof Error ? error.message : String(error)}`
    );
    res.status(500).json({ message: "Failed to create KPI" });
  }
};

// Create KPI Category
export const createKpiCategory = async (req: Request, res: Response) => {
  try {
    const { name, subClusterId } = req.body;
    const category = await kpiService.createKpiCategory(name, subClusterId);

    // Log action and save audit log
    logger.info(`KPI Category created: ${name}`);
    await saveAuditLog(
      req,
      1, // TODO: Replace with the actual authenticated userId
      "CREATE_KPI_CATEGORY",
      "A new KPI category was created",
      `KPI Category Name: ${name}, SubCluster ID: ${subClusterId}`
    );

    res.status(201).json({ message: "KPI category created", category });
  } catch (error) {
    res.status(400).json({ message: "Error creating KPI category" });
  }
};

// New: Get list of sub-clusters
export const getSubClusters = async (req: Request, res: Response) => {
  try {
    const subClusters = await kpiService.getSubClusters();
    logger.info("Fetched sub-clusters list");
    await saveAuditLog(
      req,
      1, // replace with real userId when available
      "GET_SUBCLUSTERS",
      "Fetched sub-clusters list",
      `Count: ${subClusters.length}`
    );
    res.json(subClusters);
  } catch (error) {
    logger.error(`Get sub-clusters failed: ${error}`);
    res.status(500).json({ message: "Failed to fetch sub-clusters" });
  }
};

// Get KPIs with optional filters
export const getKpis = async (req: Request, res: Response) => {
  try {
    const subClusterIdParam = req.query.subClusterId as string | undefined;
    const categoryIdParam = req.query.categoryId as string | undefined;

    let subClusterId: number | undefined;
    let categoryId: number | undefined;

    if (subClusterIdParam !== undefined) {
      subClusterId = Number(subClusterIdParam);
      if (Number.isNaN(subClusterId)) {
        return res.status(400).json({ message: "Invalid subClusterId" });
      }
    }

    if (categoryIdParam !== undefined) {
      categoryId = Number(categoryIdParam);
      if (Number.isNaN(categoryId)) {
        return res.status(400).json({ message: "Invalid categoryId" });
      }
    }

    const kpis = await kpiService.getKpis(subClusterId, categoryId);
    logger.info(`Fetched KPIs list (count=${kpis.length})`);
    await saveAuditLog(
      req,
      (req as any).user?.userId ?? (req as any).user?.id ?? 0,
      "GET_KPIS",
      "Fetched KPIs list",
      `filters: subClusterId=${subClusterId ?? "all"}; categoryId=${categoryId ?? "all"}`
    );

    res.json(kpis);
  } catch (error) {
    logger.error(
      `Get KPIs failed: ${error instanceof Error ? error.message : String(error)}`
    );
    res.status(500).json({ message: "Failed to fetch KPIs" });
  }
};

// New: Get KPI categories (optionally by subClusterId)
export const getKpiCategories = async (req: Request, res: Response) => {
  try {
    const subClusterIdParam = req.query.subClusterId as string | undefined;
    let subClusterId: number | undefined;

    if (subClusterIdParam !== undefined) {
      subClusterId = Number(subClusterIdParam);
      if (Number.isNaN(subClusterId)) {
        return res.status(400).json({ message: "Invalid subClusterId" });
      }
    }

    const categories = await kpiService.getKpiCategories(subClusterId);
    logger.info(
      `Fetched KPI categories${subClusterId ? ` for subCluster ${subClusterId}` : ""}`
    );
    await saveAuditLog(
      req,
      1,
      "GET_KPI_CATEGORIES",
      "Fetched KPI categories list",
      `subClusterId: ${subClusterId ?? "all"}; count: ${categories.length}`
    );
    res.json(categories);
  } catch (error) {
    logger.error(`Get KPI categories failed: ${error}`);
    res.status(500).json({ message: "Failed to fetch KPI categories" });
  }
};
