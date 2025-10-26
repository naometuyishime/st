import * as financialYearService from "../services/financialYear.service";
import logger, { saveAuditLog } from "../utils/logger";
import { Request, Response } from "express";

export const createFinancialYear = async (req: Request, res: Response) => {
  try {
    const financialYear = await financialYearService.createFinancialYear(
      req.body
    );
    logger.info(
      `Financial year created successfully with id ${financialYear.id}`
    );
    await saveAuditLog(
      req,
      1, // TODO: Replace with actual userId once authenticated
      "CREATE_FINANCIAL_YEAR",
      "Financial year created successfully",
      `Financial Year: ${financialYear.name}`
    );
    res.status(201).json({ success: true, data: financialYear });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    logger.error(`Error creating financial year: ${message}`);
    await saveAuditLog(
      req,
      1, // TODO: Replace with actual userId once authenticated
      "CREATE_FINANCIAL_YEAR",
      "Error creating financial year",
      `Message: ${message}`
    );
    res.status(500).json({ success: false, message });
  }
};

export const getFinancialYears = async (_req: Request, res: Response) => {
  try {
    const financialYears = await financialYearService.getFinancialYears();
    logger.info(`Retrieved ${financialYears.length} financial years`);
    await saveAuditLog(
      _req,
      1, // TODO: Replace with actual userId once authenticated
      "GET_FINANCIAL_YEARS",
      "Financial years retrieved successfully",
      `Count: ${financialYears.length}`
    );
    res.status(200).json({ success: true, data: financialYears });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    logger.error(`Error fetching financial years: ${message}`);
    await saveAuditLog(
      _req,
      1, // TODO: Replace with actual userId once authenticated
      "GET_FINANCIAL_YEAR",
      "Error getting financial year",
      `Message: ${message}`
    );
    res.status(500).json({ success: false, message });
  }
};

export const updateFinancialYear = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const updatedYear = await financialYearService.updateFinancialYear(
      Number(id),
      req.body
    );
    logger.info(`Financial year ${id} updated successfully`);
    await saveAuditLog(
      req,
      1, // TODO: Replace with actual userId once authenticated
      "UPDATE_FINANCIAL_YEAR",
      "Financial year updated successfully",
      `Financial Year: ${updatedYear.name}`
    );
    res.status(200).json({ success: true, data: updatedYear });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    logger.error(`Error updating financial year ${id}: ${message}`);
    await saveAuditLog(
      req,
      1, // TODO: Replace with actual userId once authenticated
      "UPDATE_FINANCIAL_YEAR",
      "Error updating financial year",
      `Message: ${message}`
    );
    res.status(500).json({ success: false, message });
  }
};

export const deleteFinancialYear = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await financialYearService.deleteFinancialYear(Number(id));
    logger.info(`Financial year ${id} deleted successfully`);
    await saveAuditLog(
      req,
      1, // TODO: Replace with actual userId once authenticated
      "DELETE_FINANCIAL_YEAR",
      "Financial year deleted successfully",
      `Financial Year ID: ${id}`
    );
    res
      .status(200)
      .json({ success: true, message: "Financial Year deleted successfully" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    logger.error(`Error deleting financial year ${id}: ${message}`);
    await saveAuditLog(
      req,
      1, // TODO: Replace with actual userId once authenticated
      "DELETE_FINANCIAL_YEAR",
      "Error deleting financial year",
      `Message: ${message}`
    );
    res.status(500).json({ success: false, message });
  }
};

export const getFinancialYearById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const yearId = Number(id);
    if (Number.isNaN(yearId))
      return res.status(400).json({ success: false, message: "Invalid id" });

    const financialYear =
      await financialYearService.getFinancialYearById(yearId);
    if (!financialYear)
      return res
        .status(404)
        .json({ success: false, message: "Financial year not found" });

    logger.info(`Retrieved financial year ${id}`);
    await saveAuditLog(
      req,
      1, // TODO: Replace with actual userId once authenticated
      "GET_FINANCIAL_YEAR_BY_ID",
      "Financial year retrieved successfully",
      `Financial Year ID: ${id}`
    );

    res.status(200).json({ success: true, data: financialYear });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    logger.error(`Error fetching financial year ${req.params.id}: ${message}`);
    await saveAuditLog(
      req,
      1,
      "GET_FINANCIAL_YEAR_BY_ID",
      "Error fetching financial year",
      `Message: ${message}`
    );
    res.status(500).json({ success: false, message });
  }
};
