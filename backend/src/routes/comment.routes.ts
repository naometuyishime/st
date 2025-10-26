import { Router } from "express";
import * as commentController from "../controllers/comment.controller";
import { checkRole } from "../middlewares/role.middleware";

const router = Router();

/**
 * @swagger
 * /api/comments/comment:
 *   post:
 *     summary: Add a comment to a report
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reportId
 *               - commentText
 *             properties:
 *               reportId:
 *                 type: integer
 *                 example: 1
 *               commentText:
 *                 type: string
 *                 example: "This is a comment on the report"
 *     responses:
 *       201:
 *         description: Comment added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Invalid input
 */
router.post(
  "/comment",
  checkRole(["subclusterfocalperson", "admin"]),
  commentController.addComment
);

/**
 * @swagger
 * /api/comments/comments/{reportId}:
 *   get:
 *     summary: Get all comments for a specific report
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: List of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       404:
 *         description: No comments found
 */
router.get(
  "/comments/:reportId",
  checkRole(["admin", "subclusterfocalperson", "stakeholder_admin"]),
  commentController.getCommentsByReport
);

export default router;
