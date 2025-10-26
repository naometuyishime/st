import { Request, Response } from "express";
import * as planReportService from "../services/planReport.service";
import logger, { saveAuditLog } from "../utils/logger";

export const getPlansBySubCluster = async (req: Request, res: Response) => {
  try {
    const subClusterId = Number(req.params.subClusterId);
    const plans = await planReportService.getPlansBySubCluster(subClusterId);

    logger.info(`Fetched plans for sub-cluster ${subClusterId}`);
    await saveAuditLog(
      req,
      req.user?.userId ?? 0,
      "GET_PLANS_BY_SUBCLUSTER",
      "Fetched plans for sub-cluster",
      `SubCluster ID: ${subClusterId}`
    );
    res.status(200).json({ success: true, data: plans });
  } catch (error) {
    logger.error(`Error fetching plans: ${error}`);
    await saveAuditLog(
      req,
      req.user?.userId ?? 0,
      "GET_PLANS_BY_SUBCLUSTER_ERROR",
      "Error fetching plans for sub-cluster",
      `Message: ${error}`
    );
    res.status(500).json({ success: false, message: "Failed to fetch plans" });
  }
};

export const getReportsBySubCluster = async (req: Request, res: Response) => {
  try {
    const subClusterId = Number(req.params.subClusterId);
    const reports = await planReportService.getReportsBySubCluster(
      subClusterId
    );

    logger.info(`Fetched reports for sub-cluster ${subClusterId}`);
    await saveAuditLog(
      req,
      req.user?.userId ?? 0,
      "GET_REPORTS_BY_SUBCLUSTER",
      "Fetched reports for sub-cluster",
      `SubCluster ID: ${subClusterId}`
    );
    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    logger.error(`Error fetching reports: ${error}`);
    await saveAuditLog(
      req,
      req.user?.userId ?? 0,
      "GET_REPORTS_BY_SUBCLUSTER_ERROR",
      "Error fetching reports for sub-cluster",
      `Message: ${error}`
    );
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch reports" });
  }
};
