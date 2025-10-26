import * as quarterService from "../services/quarter.service";
import logger, { saveAuditLog } from "../utils/logger";
import { Request, Response } from "express";

export const createQuarter = async (req: Request, res: Response) => {
  try {
    const quarter = await quarterService.createQuarter(req.body);
    logger.info(`Quarter created successfully with id ${quarter.id}`);
    await saveAuditLog(
      req,
      1, // TODO: Replace with actual userId once authenticated
      "CREATE_QUARTER",
      "Quarter created successfully",
      `Quarter: ${quarter.name}`
    );
    res.status(201).json({ success: true, data: quarter });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    logger.error(`Error creating quarter: ${message}`);
    await saveAuditLog(
      req,
      1, // TODO: Replace with actual userId once authenticated
      "CREATE_QUARTER",
      "Error creating quarter",
      `Message: ${message}`
    );
    res.status(500).json({ success: false, message });
  }
};

export const getQuartersByYear = async (req: Request, res: Response) => {
  const { yearId } = req.params;
  try {
    const quarters = await quarterService.getQuartersByYear(Number(yearId));
    logger.info(`Retrieved ${quarters.length} quarters for year ${yearId}`);
    await saveAuditLog(
      req,
      1, // TODO: Replace with actual userId once authenticated
      "GET_QUARTERS_BY_YEAR",
      "Quarters retrieved successfully",
      `Year ID: ${yearId}`
    );
    res.status(200).json({ success: true, data: quarters });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    logger.error(`Error fetching quarters for year ${yearId}: ${message}`);
    await saveAuditLog(
      req,
      1, // TODO: Replace with actual userId once authenticated
      "GET_QUARTERS_BY_YEAR",
      "Error fetching quarters",
      `Message: ${message}`
    );
    res.status(500).json({ success: false, message });
  }
};

export const updateQuarter = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const updatedQuarter = await quarterService.updateQuarter(
      Number(id),
      req.body
    );
    logger.info(`Quarter ${id} updated successfully`);
    await saveAuditLog(
      req,
      1, // TODO: Replace with actual userId once authenticated
      "UPDATE_QUARTER",
      "Quarter updated successfully",
      `Quarter: ${updatedQuarter.name}`
    );
    res.status(200).json({ success: true, data: updatedQuarter });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    logger.error(`Error updating quarter ${id}: ${message}`);
    await saveAuditLog(
      req,
      1, // TODO: Replace with actual userId once authenticated
      "UPDATE_QUARTER",
      "Error updating quarter",
      `Message: ${message}`
    );
    res.status(500).json({ success: false, message });
  }
};

export const deleteQuarter = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await quarterService.deleteQuarter(Number(id));
    logger.info(`Quarter ${id} deleted successfully`);
    await saveAuditLog(
      req,
      1, // TODO: Replace with actual userId once authenticated
      "DELETE_QUARTER",
      "Quarter deleted successfully",
      `Quarter ID: ${id}`
    );
    res
      .status(200)
      .json({ success: true, message: "Quarter deleted successfully" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    logger.error(`Error deleting quarter ${id}: ${message}`);
    await saveAuditLog(
      req,
      1, // TODO: Replace with actual userId once authenticated
      "DELETE_QUARTER",
      "Error deleting quarter",
      `Message: ${message}`
    );
    res.status(500).json({ success: false, message });
  }
};

export const getQuarterById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const quarterId = Number(id);
    if (Number.isNaN(quarterId))
      return res.status(400).json({ success: false, message: "Invalid id" });

    const quarter = await quarterService.getQuarterById(quarterId);
    if (!quarter)
      return res
        .status(404)
        .json({ success: false, message: "Quarter not found" });

    logger.info(`Retrieved quarter ${id}`);
    await saveAuditLog(
      req,
      1, // TODO: Replace with actual userId once authenticated
      "GET_QUARTER_BY_ID",
      "Quarter retrieved successfully",
      `Quarter ID: ${id}`
    );

    res.status(200).json({ success: true, data: quarter });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    logger.error(`Error fetching quarter ${id}: ${message}`);
    await saveAuditLog(
      req,
      1,
      "GET_QUARTER_BY_ID",
      "Error fetching quarter",
      `Message: ${message}`
    );
    res.status(500).json({ success: false, message });
  }
};
