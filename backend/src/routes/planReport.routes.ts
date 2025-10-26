import { Router } from "express";
import * as planReportController from "../controllers/planReport.controller";
import { checkRole } from "../middlewares/role.middleware";

const router = Router();

/**
 * @swagger
 * /api/planReports/plans/{subClusterId}:
 *   get:
 *     summary: Get all plans in a sub-cluster
 *     tags: [Plans & Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subClusterId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of plans
 */
router.get(
  "/plans/:subClusterId",
  checkRole(["subclusterfocalperson", "admin"]),
  planReportController.getPlansBySubCluster
);

/**
 * @swagger
 * /api/planReports/reports/{subClusterId}:
 *   get:
 *     summary: Get all reports in a sub-cluster
 *     tags: [Plans & Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subClusterId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of reports
 */
router.get(
  "/reports/:subClusterId",
  checkRole(["subclusterfocalperson", "admin"]),
  planReportController.getReportsBySubCluster
);

export default router;
