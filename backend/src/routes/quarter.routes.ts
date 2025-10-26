import { Router } from "express";
import * as quarterController from "../controllers/quarter.controller";
import { checkRole } from "../middlewares/role.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Quarters
 *   description: API for managing quarters
 */

/**
 * @swagger
 * /api/quarters/quarter:
 *   post:
 *     summary: Create a new quarter
 *     tags: [Quarters]
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
 *               - startDate
 *               - endDate
 *               - reportDueDate
 *               - yearId
 *             properties:
 *               name:
 *                 type: string
 *                 example: "January-March"
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-01-01T00:00:00Z"
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-03-31T23:59:59Z"
 *               reportDueDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-04-10T00:00:00Z"
 *               yearId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Quarter created successfully
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Internal server error
 */
router.post("/quarter", checkRole(["admin"]), quarterController.createQuarter);

/**
 * @swagger
 * /api/quarters/quarters/{yearId}:
 *   get:
 *     summary: Get all quarters for a financial year
 *     tags: [Quarters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: yearId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of quarters
 *       500:
 *         description: Internal server error
 */
router.get(
  "/quarters/:yearId",
  checkRole(["admin", "subclusterfocalperson", "stakeholder"]),
  quarterController.getQuartersByYear
);

/**
 * @swagger
 * /api/quarters/quarter/{id}:
 *   put:
 *     summary: Update a quarter
 *     tags: [Quarters]
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
 *             required:
 *               - name
 *               - startDate
 *               - endDate
 *               - reportDueDate
 *               - yearId
 *             properties:
 *               name:
 *                 type: string
 *                 example: "April-June"
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-04-01T00:00:00Z"
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-06-30T23:59:59Z"
 *               reportDueDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-07-10T00:00:00Z"
 *               yearId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Quarter updated successfully
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Internal server error
 */
router.put(
  "/quarter/:id",
  checkRole(["admin"]),
  quarterController.updateQuarter
);

/**
 * @swagger
 * /api/quarters/quarter/{id}:
 *   delete:
 *     summary: Delete a quarter
 *     tags: [Quarters]
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
 *         description: Quarter deleted successfully
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/quarter/:id",
  checkRole(["admin"]),
  quarterController.deleteQuarter
);

/**
 * @swagger
 * /api/quarters/quarter/{id}:
 *   get:
 *     summary: Get quarter by id
 *     tags: [Quarters]
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
 *         description: Quarter object
 *       404:
 *         description: Not found
 */
router.get(
  "/quarter/:id",
  checkRole(["admin", "subclusterfocalperson", "stakeholder"]),
  quarterController.getQuarterById
);

export default router;
