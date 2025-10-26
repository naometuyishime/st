import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import UserModel from "../models/user.model";
import logger, { saveAuditLog } from "../utils/logger";

const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await UserModel.findAll();
    logger.info("Fetched all users");
    // @ts-ignore
    await saveAuditLog(
      req,
      (req.user?.userId || req.user?.id) ?? null,
      "USERS_LIST",
      "Fetched users list",
      ""
    );
    res.json(users);
  } catch (error) {
    logger.error(
      `Get users failed: ${error instanceof Error ? error.message : String(error)}`
    );
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

const getUserById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id))
      return res.status(400).json({ message: "Invalid user id" });

    const user = await UserModel.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    logger.info(`Fetched user ${id}`);
    // @ts-ignore
    await saveAuditLog(
      req,
      (req.user?.userId || req.user?.id) ?? null,
      "USER_VIEW",
      "Viewed user",
      `UserId:${id}`
    );

    res.json(user);
  } catch (error) {
    logger.error(
      `Get user by id failed: ${error instanceof Error ? error.message : String(error)}`
    );
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

const updateUser = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id))
      return res.status(400).json({ message: "Invalid user id" });

    const { username, email, role, status, password } = req.body;
    const updatePayload: any = { username, email, role, status };

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      updatePayload.password = hashed;
    }

    const updated = await UserModel.updateUser(id, updatePayload);
    logger.info(`Updated user ${id}`);
    // @ts-ignore
    await saveAuditLog(
      req,
      (req.user?.userId || req.user?.id) ?? null,
      "USER_UPDATE",
      "Updated user",
      `UserId:${id}`
    );

    res.json({ message: "User updated", user: updated });
  } catch (error) {
    logger.error(
      `Update user failed: ${error instanceof Error ? error.message : String(error)}`
    );
    res.status(400).json({
      message: error instanceof Error ? error.message : "Failed to update user",
    });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id))
      return res.status(400).json({ message: "Invalid user id" });

    const deleted = await UserModel.deleteUser(id);
    logger.info(`Deleted user ${id}`);
    // @ts-ignore
    await saveAuditLog(
      req,
      (req.user?.userId || req.user?.id) ?? null,
      "USER_DELETE",
      "Deleted user",
      `UserId:${id}`
    );

    res.json({ message: "User deleted", user: deleted });
  } catch (error) {
    logger.error(
      `Delete user failed: ${error instanceof Error ? error.message : String(error)}`
    );
    res.status(400).json({
      message: error instanceof Error ? error.message : "Failed to delete user",
    });
  }
};

/**
 * Bulk import users.
 * Accepts:
 * - JSON array in request body (e.g. [{username,email,password,role,status}, ...])
 * - or object with `users` property containing the array.
 */
const importUsers = async (req: Request, res: Response) => {
  try {
    const payload = Array.isArray(req.body) ? req.body : req.body.users;
    if (!Array.isArray(payload) || payload.length === 0) {
      return res
        .status(400)
        .json({ message: "Provide an array of users to import" });
    }

    // basic validation: ensure username & email present
    const invalid = payload.findIndex(
      (u: any) => !u || !u.username || !u.email
    );
    if (invalid !== -1) {
      return res
        .status(400)
        .json({
          message: `Invalid record at index ${invalid}: username and email are required`,
        });
    }

    // delegate hashing & bulk creation to model
    const { created, skipped } = await UserModel.createUsersBulk(payload);

    logger.info(`Bulk import - created: ${created}, skipped: ${skipped}`);
    // @ts-ignore
    await saveAuditLog(
      req,
      (req.user?.userId || req.user?.id) ?? 0,
      "USERS_BULK_IMPORT",
      "Performed bulk import of users",
      `created=${created}; skipped=${skipped}; total=${payload.length}`
    );

    res
      .status(201)
      .json({
        message: "Bulk import completed",
        created,
        skipped,
        total: payload.length,
      });
  } catch (error) {
    logger.error(
      `Bulk import failed: ${error instanceof Error ? error.message : String(error)}`
    );
    res
      .status(500)
      .json({
        message: "Bulk import failed",
        error: error instanceof Error ? error.message : String(error),
      });
  }
};

export { getUsers, getUserById, updateUser, deleteUser, importUsers };
