import { Router } from "express";
import * as financialYearController from "../controllers/financialYear.controller";
import { checkRole } from "../middlewares/role.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: FinancialYears
 *   description: API for managing financial years
 */

/**
 * @swagger
 * /api/financial-years/financialYear:
 *   post:
 *     summary: Create a new financial year
 *     tags: [FinancialYears]
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
 *               - planStartDate
 *               - planEndDate
 *               - reportStartDate
 *               - reportEndDate
 *             properties:
 *               name:
 *                 type: string
 *                 example: "2023-2024"
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-01-01T00:00:00Z"
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-12-31T23:59:59Z"
 *               planStartDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-04-01T00:00:00Z"
 *               planEndDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-03-31T23:59:59Z"
 *               reportStartDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-07-01T00:00:00Z"
 *               reportEndDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-06-30T23:59:59Z"
 *     responses:
 *       201:
 *         description: Financial Year created successfully
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Internal server error
 */
router.post(
  "/financialYear",
  checkRole(["admin"]),
  financialYearController.createFinancialYear
);

/**
 * @swagger
 * /api/financial-years/financialYears:
 *   get:
 *     summary: Get all financial years
 *     tags: [FinancialYears]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of financial years
 *       500:
 *         description: Internal server error
 */
router.get(
  "/financialYears",
  checkRole(["admin", "subclusterfocalperson", "stakeholder"]),
  financialYearController.getFinancialYears
);

/**
 * @swagger
 * /api/financial-years/financialYear/{id}:
 *   put:
 *     summary: Update a financial year
 *     tags: [FinancialYears]
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
 *               - planStartDate
 *               - planEndDate
 *               - reportStartDate
 *               - reportEndDate
 *             properties:
 *               name:
 *                 type: string
 *                 example: "2023-2024"
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-01-01T00:00:00Z"
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-12-31T23:59:59Z"
 *               planStartDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-04-01T00:00:00Z"
 *               planEndDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-03-31T23:59:59Z"
 *               reportStartDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-07-01T00:00:00Z"
 *               reportEndDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-06-30T23:59:59Z"
 *     responses:
 *       200:
 *         description: Financial year updated successfully
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Internal server error
 */
router.put(
  "/financialYear/:id",
  checkRole(["admin"]),
  financialYearController.updateFinancialYear
);

/**
 * @swagger
 * /api/financial-years/financialYear/{id}:
 *   delete:
 *     summary: Delete a financial year
 *     tags: [FinancialYears]
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
 *         description: Financial year deleted successfully
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/financialYear/:id",
  checkRole(["admin"]),
  financialYearController.deleteFinancialYear
);

/**
 * @swagger
 * /api/financial-years/financialYear/{id}:
 *   get:
 *     summary: Get a financial year by id
 *     tags: [FinancialYears]
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
 *         description: Financial year object
 *       404:
 *         description: Not found
 */
router.get(
  "/financialYear/:id",
  checkRole(["admin", "subclusterfocalperson", "stakeholder"]),
  financialYearController.getFinancialYearById
);

export default router;
