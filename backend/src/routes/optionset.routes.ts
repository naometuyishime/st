import { Router } from "express";
import * as optionSetController from "../controllers/optionset.controller";
import { checkRole } from "../middlewares/role.middleware";

const router = Router();

/**
 * @swagger
 * /api/optionSet:
 *   post:
 *     summary: Create a new OptionSet
 *     description: This endpoint allows the admin or sub-cluster focal person to create a new OptionSet.
 *     tags:
 *       - OptionSet
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the OptionSet (e.g., Gender, Age Range, etc.)
 *                 example: Gender
 *               description:
 *                 type: string
 *                 description: Description of the OptionSet
 *                 example: Defines the gender categories
 *     responses:
 *       201:
 *         description: OptionSet created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Option Set created
 *                 optionSet:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: Gender
 *                     description:
 *                       type: string
 *                       example: Defines the gender categories
 *       400:
 *         description: Error creating OptionSet
 */
router.post(
  "/",
  checkRole(["admin", "subclusterfocalperson"]),
  optionSetController.createOptionSet
);

/**
 * @swagger
 * /api/optionSet/option:
 *   post:
 *     summary: Create a new Option under a specific OptionSet
 *     description: This endpoint allows the admin or sub-cluster focal person to create an Option under a specific OptionSet.
 *     tags:
 *       - OptionSet
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               optionSetId:
 *                 type: integer
 *                 description: The ID of the OptionSet under which the option will be created.
 *                 example: 1
 *               name:
 *                 type: string
 *                 description: The name of the option (e.g., Male, Female, 12-18, etc.)
 *                 example: Male
 *     responses:
 *       201:
 *         description: Option created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Option created
 *                 option:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: Male
 *                     optionSetId:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: Error creating Option
 */
router.post(
  "/option",
  checkRole(["admin", "subclusterfocalperson"]),
  optionSetController.createOption
);

/**
 * @openapi
 * /api/optionSet:
 *   get:
 *     summary: Get all OptionSets (with options)
 *     tags: [OptionSet]
 *     responses:
 *       200:
 *         description: List of OptionSets
 */
router.get("/", optionSetController.getOptionSets);

/**
 * @openapi
 * /api/optionSet/{id}/options:
 *   get:
 *     summary: Get options for a specific OptionSet
 *     tags: [OptionSet]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of options
 *       400:
 *         description: Invalid id
 */
router.get("/:id/options", optionSetController.getOptionsBySet);

export default router;
