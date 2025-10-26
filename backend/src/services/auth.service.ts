import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import UserModel from "../models/user.model";
import { sendEmailNotification } from "../utils/email.util";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";
const APP_URL = process.env.APP_URL || "http://localhost:3000";

// lightweight internal email sender fallback (replace with real mailer)
const sendEmail = async (to: string, subject: string, text: string) => {
  console.log(`Sending email to ${to}\nSubject: ${subject}\n\n${text}`);
  sendEmailNotification(to, subject, text);
  return Promise.resolve();
};

export const login = async (email: string, password: string) => {
  const user = await UserModel.findByEmail(email);
  if (!user) throw new Error("Invalid credentials");

  if (user.status !== "active") {
    throw new Error(
      "Account not activated. Please check your email for the activation link."
    );
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new Error("Invalid credentials");

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: "8h",
  });

  const { password: _p, ...userSafe } = user as any;
  return { token, user: userSafe };
};

// ========== REGISTER ==========
export const register = async (
  email: string,
  username: string,
  password: string,
  role: string,
  stakeholderId?: number,
  subClusterId?: number
) => {
  const existing = await UserModel.findByEmail(email);
  if (existing) throw new Error("Email already registered");

  const hashed = await bcrypt.hash(password, 10);

  // role normalization to Prisma enum
  const roleLower = role.toLowerCase();
  
  const normalizeRole = (r: string):
    | "stakeholder_user"
    | "admin"
    | "subclusterfocalperson"
    | "stakeholder_admin" => {
    if (r === "admin") return "admin";
    if (r === "stakeholder_admin" || r === "stakeholderadmin") return "stakeholder_admin";
    if (r === "stakeholder_user" || r === "stakeholderuser") return "stakeholder_user";
    if (
      r === "subclusterfocalperson" ||
      r === "sub_cluster_focal_person" ||
      r === "subcluster_focal_person"
    )
      return "subclusterfocalperson";
    throw new Error("Invalid role");
  };
  
  const normalizedRole = normalizeRole(roleLower);
  
  // validate stakeholder/subcluster mapping based on role
  let stakeholder = null;
  if (
    normalizedRole === "stakeholder_admin" ||
    normalizedRole === "stakeholder_user"
  ) {
    if (!stakeholderId)
      throw new Error("stakeholderId is required for stakeholder roles");
    stakeholder = await prisma.stakeholder.findUnique({
      where: { id: stakeholderId },
    });
    if (!stakeholder) throw new Error("Invalid stakeholder ID");
  }
  
  if (normalizedRole === "subclusterfocalperson" && !subClusterId) {
    throw new Error("subClusterId is required for sub-cluster focal persons");
  }
  
  const created = await UserModel.createUser(
    username,
    email,
    hashed,
    normalizedRole,
    stakeholderId || null,
    subClusterId || null
  );
  
  // Create activation token valid 24h
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.activationToken.create({
    data: {
      userId: created.id,
      token,
      expiresAt,
    },
  });

  const activationLink = `${APP_URL}/activate?token=${token}`;
  const subject = "Activate your account";
  const body = `Hi ${username},\n\nPlease activate your account by visiting the link below:\n\n${activationLink}\n\nThis link expires in 24 hours.`;

  await sendEmail(email, subject, body);

  return {
    message: "Registered successfully. Activation email sent.",
    userId: created.id,
  };
};

// ========== ACTIVATE ==========
export const activateAccount = async (token: string) => {
  const record = await prisma.activationToken.findUnique({ where: { token } });
  if (!record) throw new Error("Invalid or expired token");

  if (record.expiresAt.getTime() < Date.now()) {
    await prisma.activationToken.delete({ where: { id: record.id } });
    throw new Error("Activation token expired");
  }

  await UserModel.updateUserStatus(record.userId, "active");
  await prisma.activationToken.delete({ where: { id: record.id } });

  return { message: "Account activated", userId: record.userId };
};

// ========== PASSWORD RESET ==========
const passwordResetTokens: Record<
  string,
  { token: string; expires: number }
> = {};

export const forgotPassword = async (email: string) => {
  const user = await UserModel.findByEmail(email);
  if (!user) throw new Error("User not found");

  const token = crypto.randomBytes(32).toString("hex");
  const expires = Date.now() + 1000 * 60 * 15; // 15 min
  passwordResetTokens[email] = { token, expires };

  const resetLink = `${APP_URL}/reset-password?token=${token}&email=${email}`;
  const subject = "Password Reset Request";
  const text = `Click to reset password: ${resetLink}`;

  await sendEmail(email, subject, text);
  return { message: "Password reset link sent to your email" };
};

export const resetPassword = async (
  email: string,
  token: string,
  newPassword: string
) => {
  const record = passwordResetTokens[email];
  if (!record || record.token !== token || record.expires < Date.now()) {
    throw new Error("Invalid or expired reset token");
  }
  const hashed = await bcrypt.hash(newPassword, 10);
  await UserModel.updatePassword(email, hashed);
  delete passwordResetTokens[email];
  return { message: "Password reset successful" };
};
