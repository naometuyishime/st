import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import logger, { saveAuditLog } from "../utils/logger";
import UserModel from "../models/user.model";

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    await saveAuditLog(req, result.user.id, "LOGIN", "User logged in", email);
    res.json({
      message: "Login successful",
      token: result.token,
      user: result.user,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error(`Login failed: ${msg}`);
    res.status(400).json({ message: msg });
  }
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, username, password, role, stakeholderId, subClusterId } =
      req.body;
    const result = await authService.register(
      email,
      username,
      password,
      role,
      Number(stakeholderId),
      Number(subClusterId)
    );
    await saveAuditLog(req, 0, "REGISTER", "User registered", email);
    res.status(201).json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error(`Registration failed: ${msg}`);
    res.status(400).json({ message: msg });
  }
};

export const activateController = async (req: Request, res: Response) => {
  try {
    const token = (req.query.token as string) || req.body.token;
    if (!token) return res.status(400).json({ message: "Token required" });
    const result = await authService.activateAccount(token);
    await saveAuditLog(req, result.userId, "ACTIVATE_ACCOUNT", "Activated");
    res.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error(`Activation failed: ${msg}`);
    res.status(400).json({ message: msg });
  }
};

export const forgotPasswordController = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    res.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(400).json({ message: msg });
  }
};

export const resetPasswordController = async (req: Request, res: Response) => {
  try {
    const { email, token, newPassword } = req.body;
    const result = await authService.resetPassword(email, token, newPassword);
    res.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(400).json({ message: msg });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ message: msg });
  }
};
