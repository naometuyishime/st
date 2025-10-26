import express from "express";
import { authenticate } from "../middlewares/auth.middleware";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  importUsers,
} from "../controllers/user.controller";

const router = express.Router();

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
router.get("/", authenticate, getUsers);

/**
 * @openapi
 * /api/users/import:
 *   post:
 *     summary: Bulk import users
 *     tags: [Users]
 *     description: Import multiple users. Provide an array of user objects in the request body or an object with `users` array.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: array
 *                 items:
 *                   type: object
 *                   required: [username, email]
 *                   properties:
 *                     username: { type: string }
 *                     email: { type: string, format: email }
 *                     password: { type: string }
 *                     role: { type: string }
 *                     status: { type: string, enum: [active, inactive] }
 *               - type: object
 *                 properties:
 *                   users:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Bulk import completed
 *       400:
 *         description: Invalid payload
 */
router.post("/import", authenticate, importUsers);

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     summary: Get user by id
 *     tags: [Users]
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
 *         description: User object
 *       404:
 *         description: Not found
 */
router.get("/:id", authenticate, getUserById);

/**
 * @openapi
 * /api/users/{id}:
 *   put:
 *     summary: Update a user
 *     tags: [Users]
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
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 example: admin
 *               status:
 *                 type: string
 *                 example: active
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 */
router.put("/:id", authenticate, updateUser);

/**
 * @openapi
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
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
 *         description: User deleted
 */
router.delete("/:id", authenticate, deleteUser);

export default router;
