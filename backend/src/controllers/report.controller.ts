import { Request, Response } from "express";
import * as service from "../services/report.service";
import logger, { saveAuditLog } from "../utils/logger";

declare global {
  namespace Express {
    interface Request {
      file?: Express.Multer.File;
    }
  }
}

/**
 * Upload handled by multer middleware in the route.
 */
export const createReport = async (req: Request, res: Response) => {
  try {
    // multer stores file in req.file
    const filePath = req.file ? (req.file.path as string) : undefined;
    const body = req.body;

    // parse options if passed as JSON string (client might send stringified)
    let options = [];
    if (body.options) {
      options =
        typeof body.options === "string"
          ? JSON.parse(body.options)
          : body.options;
    }

    if (
      !body.actionPlanId ||
      !body.kpiPlanId ||
      !body.quarterId ||
      body.actualValue === undefined
    ) {
      return res
        .status(400)
        .json({
          message:
            "Missing required fields: actionPlanId, kpiPlanId, quarterId, actualValue",
        });
    }

    const dto = {
      actionPlanId: Number(body.actionPlanId),
      yearId: Number(body.yearId),
      kpiPlanId: Number(body.kpiPlanId),
      quarterId: Number(body.quarterId),
      actualValue: Number(body.actualValue),
      progressSummary: body.progressSummary,
      reportDocument: filePath,
      options,
    };

    const report = await service.createReport(dto);

    if (!report) {
      logger.error("Failed to create report: service returned null");
      return res.status(500).json({ message: "Failed to create report" });
    }

    logger.info(
      `Report submitted id=${report.id} by user=${
        req.user?.userId ?? "unknown"
      }`
    );
    await saveAuditLog(
      req,
      req.user?.userId ?? 0,
      "CREATE_REPORT",
      "A new quarterly report was submitted",
      `Report ID: ${report.id}`
    );

    res.status(201).json({ message: "Report submitted successfully", report });
  } catch (err) {
    logger.error("Failed to create report: %o", err);
    res
      .status(500)
      .json({
        message: "Failed to create report",
        error: (err as Error).message,
      });
  }
};

export const getReportsByActionPlan = async (req: Request, res: Response) => {
  try {
    const actionPlanId = Number(req.params.actionPlanId);
    const reports = await service.getReportsForActionPlan(actionPlanId);
    res.json(reports);
  } catch (err) {
    logger.error("Failed to get reports: %o", err);
    res.status(500).json({ message: "Failed to get reports" });
  }
};

export const getReport = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const report = await service.getReportById(id);
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json(report);
  } catch (err) {
    logger.error("Failed to get report: %o", err);
    res.status(500).json({ message: "Failed to get report" });
  }
};
