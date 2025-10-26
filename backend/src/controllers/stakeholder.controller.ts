import { Request, Response } from "express";
import logger, { saveAuditLog } from "../utils/logger";
import * as stakeholderService from "../services/stakeholder.service";
import { getStakeholderById as getStakeholderByIdService } from "../services/stakeholder.service";

export const createStakeholder = async (req: Request, res: Response) => {
  try {
    const {
      organizationName,
      districts,
      stakeholderCategoryId,
      implementationLevel,
      subClusterIds,
    } = req.body;

    // basic validations
    if (
      !organizationName ||
      !districts ||
      !stakeholderCategoryId ||
      !implementationLevel
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate districtIds is an array
    if (!Array.isArray(districts) || districts.length === 0) {
      return res.status(400).json({ message: "districtIds must be a non-empty array" });
    }

    const districtIdsNum = districts.map(id => Number(id));
    if (districtIdsNum.some(isNaN)) {
      return res.status(400).json({ message: "Invalid districtIds" });
    }

    const subClusterIdsNum = subClusterIds && Array.isArray(subClusterIds) 
      ? subClusterIds.map(id => Number(id)).filter(id => !isNaN(id))
      : undefined;

    const stakeholder = await stakeholderService.createStakeholder(
      organizationName,
      districtIdsNum,
      Number(stakeholderCategoryId),
      implementationLevel,
      subClusterIdsNum
    );

    logger.info(`Stakeholder created: ${organizationName}`);
    await saveAuditLog(
      req,
      (req as any).user?.userId ?? (req as any).user?.id ?? 0,
      "CREATE_STAKEHOLDER",
      "Stakeholder created successfully",
      `Stakeholder: ${organizationName}; Implementation: ${implementationLevel}; Districts: ${districtIdsNum.length}; SubClusters: ${subClusterIdsNum?.length || 0}`
    );

    res
      .status(201)
      .json({ message: "Stakeholder created successfully", stakeholder });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Error creating stakeholder: ${errorMessage}`);
    res.status(400).json({ message: errorMessage });
  }
};

/**
 * Controller to create a new Stakeholder Category
 */
export const createStakeholderCategory = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "name is required" });

    const category = await stakeholderService.createStakeholderCategory(
      name,
      description ?? ""
    );

    logger.info(`Stakeholder Category created: ${name}`);
    await saveAuditLog(
      req,
      (req as any).user?.userId ?? (req as any).user?.id ?? 0,
      "CREATE_STAKEHOLDER_CATEGORY",
      "Stakeholder Category created successfully",
      `Category: ${name}`
    );

    res
      .status(201)
      .json({ message: "Stakeholder Category created successfully", category });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Error creating stakeholder category: ${errorMessage}`);
    res.status(400).json({ message: errorMessage });
  }
};

/**
 * Controller to get list of all Stakeholders
 */
export const getStakeholders = async (req: Request, res: Response) => {
  try {
    const stakeholders = await stakeholderService.getAllStakeholders();

    res.status(200).json(stakeholders);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Error fetching stakeholders: ${errorMessage}`);
    res.status(400).json({ message: errorMessage });
  }
};

/**
 * Controller to get stakeholder details by id
 */
export const getStakeholderById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id))
      return res.status(400).json({ message: "Invalid stakeholder id" });

    const stakeholder = await getStakeholderByIdService(id);
    if (!stakeholder)
      return res.status(404).json({ message: "Stakeholder not found" });

    logger.info(`Fetched stakeholder ${id}`);
    await saveAuditLog(
      req,
      (req as any).user?.userId ?? (req as any).user?.id ?? 0,
      "GET_STAKEHOLDER",
      "Fetched stakeholder details",
      `StakeholderId: ${id}`
    );

    res.status(200).json(stakeholder);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Error fetching stakeholder: ${errorMessage}`);
    res.status(500).json({ message: errorMessage });
  }
};

/**
 * Controller to get all stakeholder categories
 */
export const getStakeholderCategories = async (req: Request, res: Response) => {
  try {
    const categories = await stakeholderService.getAllStakeholderCategories();

    logger.info("Fetched stakeholder categories");
    await saveAuditLog(
      req,
      (req as any).user?.userId ?? (req as any).user?.id ?? 0,
      "GET_STAKEHOLDER_CATEGORIES",
      "Fetched stakeholder categories list",
      `Count: ${categories.length}`
    );

    res.status(200).json(categories);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Error fetching stakeholder categories: ${errorMessage}`);
    res.status(500).json({ message: errorMessage });
  }
};

/**
 * Controller to get a stakeholder category by id
 */
export const getStakeholderCategoryById = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id))
      return res.status(400).json({ message: "Invalid category id" });

    const category = await stakeholderService.getStakeholderCategoryById(id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    logger.info(`Fetched stakeholder category ${id}`);
    await saveAuditLog(
      req,
      (req as any).user?.userId ?? (req as any).user?.id ?? 0,
      "GET_STAKEHOLDER_CATEGORY",
      "Fetched stakeholder category",
      `CategoryId: ${id}`
    );

    res.status(200).json(category);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Error fetching stakeholder category: ${errorMessage}`);
    res.status(500).json({ message: errorMessage });
  }
};