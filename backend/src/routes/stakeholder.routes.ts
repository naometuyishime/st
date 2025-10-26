import express from "express";
import {
  createStakeholder,
  createStakeholderCategory,
  getStakeholders,
  getStakeholderById,
  getStakeholderCategories,
  getStakeholderCategoryById,
} from "../controllers/stakeholder.controller";
import { checkRole } from "../middlewares/role.middleware";

const router = express.Router();

/**
 * @openapi
 * /api/stakeholder:
 *   post:
 *     summary: Create a new Stakeholder
 *     tags: [Stakeholder]
 *     description: Create a new stakeholder.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - organizationName
 *               - districtId
 *               - provinceId
 *               - countryId
 *               - stakeholderCategoryId
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 1
 *               organizationName:
 *                 type: string
 *                 example: NGO Rwanda
 *               districtId:
 *                 type: integer
 *                 example: 1
 *               provinceId:
 *                 type: integer
 *                 example: 1
 *               countryId:
 *                 type: integer
 *                 example: 1
 *               stakeholderCategoryId:
 *                 type: integer
 *                 example: 1
 *               subClusterId:
 *                 type: integer
 *                 example: 2
 *               implementationLevel:
 *                 type: string
 *                 enum: [Country, Province, District]
 *                 example: Province
 *     responses:
 *       201:
 *         description: Stakeholder created successfully
 *       400:
 *         description: Error creating stakeholder
 */
router.post("/", checkRole(["admin"]), createStakeholder);

/**
 * @openapi
 * /api/stakeholder/category:
 *   post:
 *     summary: Create a new Stakeholder Category
 *     tags: [Stakeholder]
 *     description: Create a new category for stakeholders.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 example: 'Implementing Partner'
 *               description:
 *                 type: string
 *                 example: 'Partners that implement development programs.'
 *     responses:
 *       201:
 *         description: Stakeholder Category created successfully
 *       400:
 *         description: Error creating stakeholder category
 */
router.post("/category", checkRole(["admin"]), createStakeholderCategory);

/**
 * @openapi
 * /api/stakeholder:
 *   get:
 *     summary: Get list of Stakeholders
 *     tags: [Stakeholder]
 *     description: Fetch the list of all stakeholders.
 *     responses:
 *       200:
 *         description: List of stakeholders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   organizationName:
 *                     type: string
 *                   country:
 *                     type: object
 *                   province:
 *                     type: object
 *                   district:
 *                     type: object
 *                   stakeholderCategory:
 *                     type: object
 *                   implementationLevel:
 *                     type: string
 *                     example: 'Province'
 *       400:
 *         description: Error fetching stakeholders
 */
router.get("/", getStakeholders);

/**
 * @openapi
 * /api/stakeholder/category:
 *   get:
 *     summary: Get stakeholder categories
 *     tags: [Stakeholder]
 *     responses:
 *       200:
 *         description: List of stakeholder categories
 */
router.get("/category", getStakeholderCategories);

/**
 * @openapi
 * /api/stakeholder/category/{id}:
 *   get:
 *     summary: Get stakeholder category by id
 *     tags: [Stakeholder]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Stakeholder category object
 *       404:
 *         description: Not found
 */
router.get("/category/:id", getStakeholderCategoryById);

/**
 * @openapi
 * /api/stakeholder/{id}:
 *   get:
 *     summary: Get stakeholder details by id
 *     tags: [Stakeholder]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Stakeholder object with relations
 *       404:
 *         description: Not found
 */
router.get("/:id", getStakeholderById);

export default router;