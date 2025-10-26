import { PrismaClient, User as PrismaUser } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * User Model represents the users in the system.
 */
export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  role:
    | "stakeholder_user"
    | "admin"
    | "subclusterfocalperson"
    | "stakeholder_admin";
  status: "pending" | "active" | "inactive";
}

export class UserModel {
  /**
   * Create a new user.
   * @param username - Username of the user.
   * @param email - Email of the user.
   * @param password - Password of the user.
   * @param role - Role of the user (admin, stakeholder, etc.).
   * @returns The created User object.
   */
static async createUser(
  username: string,
  email: string,
  password: string,
  role:
    | "stakeholder_user"
    | "admin"
    | "subclusterfocalperson"
    | "stakeholder_admin",
  stakeholderId?: number | null,   // ✅ new optional field
  subClusterId?: number | null     // ✅ new optional field
): Promise<User> {
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password,
      role: role.toUpperCase() as any,
      status: "PENDING",
      stakeholderId: stakeholderId ?? undefined, // ✅ added
      subClusterId: subClusterId ?? undefined,   // ✅ added
    },
  });

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    password: user.password,
    role: user.role.toLowerCase() as User["role"],
    status: user.status.toLowerCase() as User["status"],
  };
}

  /**
   * Find a user by email.
   * @param email - Email of the user.
   * @returns User object.
   */
  static async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) return null;
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      password: user.password,
      role: user.role.toLowerCase() as User["role"],
      status: user.status.toLowerCase() as User["status"],
    };
  }

  /**
   * Update a user's status.
   * @param id - User ID.
   * @param status - New status of the user (active, inactive).
   * @returns The updated User object.
   */
  static async updateUserStatus(
    id: number,
    status: "active" | "inactive" | "pending"
  ): Promise<User> {
    const user = await prisma.user.update({
      where: { id },
      data: { status: status.toUpperCase() as any }, // Cast to match Prisma enum type
    });
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      password: user.password,
      role: user.role.toLowerCase() as User["role"],
      status: user.status.toLowerCase() as User["status"],
    };
  }

  /**
   * Delete a user.
   * @param id - User ID.
   * @returns The deleted User object.
   */
  static async deleteUser(id: number): Promise<User> {
    const user = await prisma.user.delete({
      where: { id },
    });
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      password: user.password,
      role: user.role.toLowerCase() as User["role"],
      status: user.status.toLowerCase() as User["status"],
    };
  }

  /**
   * Find all users by their role.
   * @param role - Role of the user.
   * @returns List of users with the specified role.
   */
  static async findByRole(
    role:
      | "stakeholder_user"
      | "stakeholder_admin"
      | "admin"
      | "subclusterfocalperson"
  ): Promise<User[]> {
    const users = await prisma.user.findMany({
      where: { role: role.toUpperCase() as any },
    });
    return users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      password: user.password,
      role: user.role.toLowerCase() as User["role"],
      status: user.status.toLowerCase() as User["status"],
    }));
  }

  /**
   * Update a user's password.
   * @param email - User's email.
   * @param newPassword - New hashed password.
   */
  static async updatePassword(
    email: string,
    newPassword: string
  ): Promise<void> {
    await prisma.user.update({
      where: { email },
      data: { password: newPassword },
    });
  }

  /**
   * Find a user by ID.
   * @param id - User ID.
   * @returns User object.
   */
  static async findById(id: number): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      password: user.password,
      role: user.role.toLowerCase() as User["role"],
      status: user.status.toLowerCase() as User["status"],
    };
  }

  /**
   * Find all users.
   * @returns List of all users.
   */
  static async findAll(): Promise<User[]> {
    const users = await prisma.user.findMany();
    return users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      password: user.password,
      role: user.role.toLowerCase() as User["role"],
      status: user.status.toLowerCase() as User["status"],
    }));
  }

  /**
   * Update a user.
   * @param id - User ID.
   * @param data - Partial user data to update.
   * @returns The updated User object.
   */
  static async updateUser(
    id: number,
    data: Partial<{
      username: string;
      email: string;
      role:
        | "stakeholder_user"
        | "stakeholder_admin"
        | "admin"
        | "subclusterfocalperson";
      status: "active" | "inactive";
      password: string; // pass already hashed if updating
    }>
  ): Promise<User> {
    const updateData: any = {};

    if (data.username !== undefined) updateData.username = data.username;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.password !== undefined) updateData.password = data.password;
    if (data.role !== undefined) updateData.role = data.role.toUpperCase();
    if (data.status !== undefined)
      updateData.status = data.status.toUpperCase();

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      password: user.password,
      role: user.role.toLowerCase() as User["role"],
      status: user.status.toLowerCase() as User["status"],
    };
  }

  /**
   * Bulk create users. Skips duplicates (by unique constraints).
   * Expects users with { username, email, password, role?, status? }.
   * Returns created count and skipped count.
   */
  static async createUsersBulk(
    users: Array<{
      username: string;
      email: string;
      password?: string;
      role?: string;
      status?: "active" | "inactive" | "pending";
    }>
  ): Promise<{ created: number; skipped: number }> {
    if (!Array.isArray(users) || users.length === 0) {
      return { created: 0, skipped: 0 };
    }

    // helper to normalize roles to Prisma enum values used in schema.prisma
    const normalizeRole = (r?: string) => {
      if (!r) return undefined;
      const key = String(r).trim().toLowerCase();
      const map: Record<string, string> = {
        stakeholder_user: "STAKEHOLDER_USER",
        stakeholderuser: "STAKEHOLDER_USER",
        stakeholder: "STAKEHOLDER_USER",
        super_admin: "ADMIN",
        superadmin: "ADMIN",
        admin: "ADMIN",
        subclusterfocalperson: "SUBCLUSTERFOCALPERSON",
        subclusterfocal: "SUBCLUSTERFOCALPERSON",
        SUBCLUSTERFOCALPERSON: "SUBCLUSTERFOCALPERSON",
        stakeholder_admin: "STAKEHOLDER_ADMIN",
        stakeholderadmin: "STAKEHOLDER_ADMIN",
      };
      if (map[key]) return map[key];
      // fallback: transform to upper snake case
      return key
        .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
        .replace(/[-\s]/g, "_")
        .toUpperCase();
    };
    // Hash passwords (generate random password if missing)
    const prepared: Prisma.UserCreateManyInput[] = await Promise.all(
      users.map(async (u) => {
        const password = u.password ?? Math.random().toString(36).slice(-10);
        const hashed = await bcrypt.hash(password, 10);
        return {
          username: u.username,
          email: u.email,
          password: hashed,
          role: (normalizeRole(u.role) ??
            "STAKEHOLDER_USER") as Prisma.UserCreateManyInput["role"],
          status: (
            u.status ?? "active"
          ).toUpperCase() as Prisma.UserCreateManyInput["status"],
        };
      })
    );

    // Use createMany with skipDuplicates to avoid failing on unique constraints
    const result = await prisma.user.createMany({
      data: prepared,
      skipDuplicates: true,
    });

    const created = result.count ?? 0;
    const skipped = users.length - created;

    return { created, skipped };
  }
}

export default UserModel;
