/*
  Warnings:

  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `auditlog` DROP FOREIGN KEY `AuditLog_userId_fkey`;

-- DropForeignKey
ALTER TABLE `stakeholder` DROP FOREIGN KEY `Stakeholder_userId_fkey`;

-- DropIndex
DROP INDEX `AuditLog_userId_fkey` ON `auditlog`;

-- DropTable
DROP TABLE `user`;
