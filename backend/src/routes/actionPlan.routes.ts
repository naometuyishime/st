import { Router } from "express";
import * as controller from "../controllers/actionPlan.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { checkRole } from "../middlewares/role.middleware";

const router = Router();

/**
 * @openapi
 * /api/action-plans:
 *   post:
 *     summary: Create an action plan
 *     tags: [Action Plans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - yearId
 *               - stakeholderSubclusterId
 *               - planLevel
 *               - kpiPlans
 *             properties:
 *               yearId:
 *                 type: integer
 *               stakeholderSubclusterId:
 *                 type: integer
 *                 description: SubCluster id this plan targets (stakeholder sub-cluster)
 *               stakeholderId:
 *                 type: integer
 *               planLevel:
 *                 type: string
 *                 enum: [country, province, district]
 *               kpiPlans:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [kpiId, plannedValue]
 *                   properties:
 *                     kpiId:
 *                       type: integer
 *                     plannedValue:
 *                       type: number
 */
router.post(
  "/",
  authenticate,
  checkRole(["stakeholder_admin", "admin", "subClusterFocalPerson"]),
  controller.createActionPlan
);

/**
 * @openapi
 * /api/action-plans/{id}:
 *   get:
 *     summary: Get action plan by id
 *     tags: [Action Plans]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Action plan
 */
router.get(
  "/:id",
  authenticate,
  checkRole(["stakeholder_admin", "admin", "subClusterFocalPerson"]),
  controller.getActionPlan
);

/**
 * @openapi
 * /api/action-plans:
 *   get:
 *     summary: Search action plans
 *     tags: [Action Plans]
 *     parameters:
 *       - in: query
 *         name: yearId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: kpiId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: countryId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of action plans
 */
router.get(
  "/",
  authenticate,
  checkRole(["stakeholder_admin", "admin", "subClusterFocalPerson"]),
  controller.searchActionPlans
);

/**
 * @openapi
 * /api/action-plans/{id}:
 *   put:
 *     summary: Update action plan
 *     tags: [Action Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               document:
 *                 type: string
 *               comment:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated
 */
router.put(
  "/:id",
  authenticate,
  checkRole(["stakeholder_admin", "admin"]),
  controller.updateActionPlan
);

/**
 * @openapi
 * /api/action-plans/{id}:
 *   delete:
 *     summary: Delete action plan
 *     tags: [Action Plans]
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
 *         description: Deleted
 */
router.delete(
  "/:id",
  authenticate,
  checkRole(["admin"]),
  controller.deleteActionPlan
);

export default router;
