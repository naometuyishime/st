import { Request, Response } from "express";
import * as auditService from "../services/audit.service";
import logger, { saveAuditLog } from "../utils/logger";

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId ? Number(req.query.userId) : undefined;
    if (req.query.userId && Number.isNaN(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const action = (req.query.action as string) || undefined;
    const page = req.query.page ? Math.max(1, Number(req.query.page)) : 1;
    const limit = req.query.limit ? Math.max(1, Number(req.query.limit)) : 50;

    const from = req.query.from ? new Date(String(req.query.from)) : undefined;
    const to = req.query.to ? new Date(String(req.query.to)) : undefined;

    const result = await auditService.getAuditLogs(
      { userId, action, from, to },
      page,
      limit
    );

    logger.info(
      `Fetched audit logs (userId=${userId ?? "all"} action=${action ?? "all"})`
    );
    // @ts-ignore
    await saveAuditLog(
      req,
      (req as any).user?.userId ?? (req as any).user?.id ?? 0,
      "GET_AUDIT_LOGS",
      "Fetched audit logs",
      `filters: userId=${userId}; action=${action}; page=${page}; limit=${limit}`
    );

    res.json({
      success: true,
      meta: { total: result.total, page: result.page, limit: result.limit },
      data: result.data,
    });
  } catch (error) {
    logger.error(
      `Get audit logs failed: ${error instanceof Error ? error.message : String(error)}`
    );
    res.status(500).json({ message: "Failed to fetch audit logs" });
  }
};

export const getAuditLogById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id))
      return res.status(400).json({ message: "Invalid id" });

    const log = await auditService.getAuditLogById(id);
    if (!log) return res.status(404).json({ message: "Audit log not found" });

    logger.info(`Fetched audit log ${id}`);
    // @ts-ignore
    await saveAuditLog(
      req,
      (req as any).user?.userId ?? (req as any).user?.id ?? 0,
      "GET_AUDIT_LOG",
      "Fetched an audit log entry",
      `id=${id}`
    );

    res.json({ success: true, data: log });
  } catch (error) {
    logger.error(
      `Get audit log by id failed: ${error instanceof Error ? error.message : String(error)}`
    );
    res.status(500).json({ message: "Failed to fetch audit log" });
  }
};
