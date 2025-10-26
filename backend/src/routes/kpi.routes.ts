import express from "express";
import { authenticate } from "../middlewares/auth.middleware";
import {
  createSubCluster,
  createKPI,
  createKpiCategory,
  getSubClusters,
  getKpis,
  getKpiCategories,
} from "../controllers/kpi.controller";
import { checkRole } from "../middlewares/role.middleware";

const router = express.Router();

/**
 * @openapi
 * /api/kpi/sub-cluster:
 *   post:
 *     summary: Create a new sub-cluster
 *     tags: [KPI]
 *     description: Creates a new sub-cluster for organizing KPIs. Each sub-cluster must be assigned a focal person (user).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - focalPersonId
 *             properties:
 *               name:
 *                 type: string
 *                 example: Education
 *               description:
 *                 type: string
 *                 example: This sub-cluster focuses on educational initiatives.
 *               focalPersonId:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       201:
 *         description: Sub-cluster created successfully
 *       400:
 *         description: Error creating sub-cluster
 */
router.post(
  "/sub-cluster",
  checkRole(["admin", "subclusterfocalperson"]),
  createSubCluster
);

/**
 * @openapi
 * /api/kpi/sub-cluster:
 *   get:
 *     summary: Get list of sub-clusters
 *     tags: [KPI]
 *     responses:
 *       200:
 *         description: List of sub-clusters
 */
router.get("/sub-cluster", getSubClusters);

/**
 * @openapi
 * /api/kpi/kpi:
 *   post:
 *     summary: Create a new KPI
 *     tags: [KPI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - subClusterId
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               unit:
 *                 type: string
 *               subClusterId:
 *                 type: integer
 *               kpiCategoryId:
 *                 type: integer
 *               stakeholderCategoryId:
 *                 type: integer
 *               targetValue:
 *                 type: number
 *                 description: Planned target value for KPI
 *               currentValue:
 *                 type: number
 *                 description: Current measured value for KPI
 *     responses:
 *       201:
 *         description: KPI created
 */
router.post(
  "/kpi",
  authenticate,
  checkRole(["admin", "subClusterFocalPerson"]),
  createKPI
);

/**
 * @openapi
 * /api/kpi/kpi:
 *   get:
 *     summary: Get KPIs (optionally filtered by subClusterId and categoryId)
 *     tags: [KPI]
 *     parameters:
 *       - in: query
 *         name: subClusterId
 *         schema:
 *           type: integer
 *         required: false
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *         required: false
 *     responses:
 *       200:
 *         description: List of KPIs
 */
router.get("/kpi", authenticate, getKpis);

/**
 * @openapi
 * /api/kpi/kpi-category:
 *   post:
 *     summary: Create a new KPI category
 *     tags: [KPI]
 *     description: Defines a new KPI category under a specific sub-cluster.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - subClusterId
 *             properties:
 *               name:
 *                 type: string
 *                 example: Performance Indicators
 *               subClusterId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: KPI category created successfully
 *       400:
 *         description: Error creating KPI category
 */
router.post("/kpi-category", checkRole(["admin"]), createKpiCategory);

/**
 * @openapi
 * /api/kpi/kpi-category:
 *   get:
 *     summary: Get KPI categories (optionally by subClusterId)
 *     tags: [KPI]
 *     parameters:
 *       - in: query
 *         name: subClusterId
 *         schema:
 *           type: integer
 *         required: false
 *     responses:
 *       200:
 *         description: List of KPI categories
 *       400:
 *         description: Invalid query
 */
router.get("/kpi-category", getKpiCategories);

export default router;
