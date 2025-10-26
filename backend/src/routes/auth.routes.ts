import express from "express";
import {
  loginUser,
  registerUser,
  forgotPasswordController,
  resetPasswordController,
  getProfile,
  activateController,
} from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = express.Router();

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     description: Allows the user to log in and receive a JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token and user info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid credentials
 */
router.post("/login", loginUser);

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     description: Allows the admin to register a new user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *                 example: janedoe
 *               email:
 *                 type: string
 *                 example: janedoe@example.com
 *               password:
 *                 type: string
 *                 example: securePassword123
 *               role:
 *                 type: string
 *                 enum: [admin, stakeholder, subclusterfocalperson]
 *                 example: Stakeholder
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid request body
 */
router.post("/register", registerUser);

/**
 * @openapi
 * /api/auth/forgot-password:
 *   post:
 *     summary: Forgot password
 *     tags: [Auth]
 *     description: Sends a password reset link to the user's email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *     responses:
 *       200:
 *         description: Password reset link sent
 *       400:
 *         description: Error
 */
router.post("/forgot-password", forgotPasswordController);

/**
 * @openapi
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password
 *     tags: [Auth]
 *     description: Resets the user's password using a token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - token
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Error
 */
router.post("/reset-password", resetPasswordController);

/**
 * @openapi
 * /api/auth/activate:
 *   get:
 *     summary: Activate account by token
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Account activated
 *       400:
 *         description: Invalid or expired token
 */
router.get("/activate", activateController);

/**
 * @openapi
 * /api/auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get("/profile", authenticate, getProfile);

export default router;
