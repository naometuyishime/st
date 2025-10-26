import express from "express";
import { getAuditLogs, getAuditLogById } from "../controllers/audit.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = express.Router();

/**
 * @openapi
 * /api/audit-logs:
 *   get:
 *     summary: Get audit logs
 *     tags: [AuditLogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         required: false
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         required: false
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *         required: false
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *         required: false
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: false
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *     responses:
 *       200:
 *         description: Paginated list of audit logs
 */
router.get("/", authenticate, getAuditLogs);

/**
 * @openapi
 * /api/audit-logs/{id}:
 *   get:
 *     summary: Get an audit log by id
 *     tags: [AuditLogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Audit log entry
 *       404:
 *         description: Not found
 */
router.get("/:id", authenticate, getAuditLogById);

export default router;
