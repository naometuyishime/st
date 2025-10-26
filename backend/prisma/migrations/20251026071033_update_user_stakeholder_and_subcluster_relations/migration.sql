/*
  Warnings:

  - You are about to drop the column `countryId` on the `stakeholder` table. All the data in the column will be lost.
  - You are about to drop the column `districtId` on the `stakeholder` table. All the data in the column will be lost.
  - You are about to drop the column `provinceId` on the `stakeholder` table. All the data in the column will be lost.
  - You are about to drop the column `subClusterId` on the `stakeholder` table. All the data in the column will be lost.
  - You are about to drop the column `focalPersonId` on the `subcluster` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `stakeholder` DROP FOREIGN KEY `Stakeholder_countryId_fkey`;

-- DropForeignKey
ALTER TABLE `stakeholder` DROP FOREIGN KEY `Stakeholder_districtId_fkey`;

-- DropForeignKey
ALTER TABLE `stakeholder` DROP FOREIGN KEY `Stakeholder_provinceId_fkey`;

-- DropForeignKey
ALTER TABLE `stakeholder` DROP FOREIGN KEY `Stakeholder_subClusterId_fkey`;

-- DropForeignKey
ALTER TABLE `subcluster` DROP FOREIGN KEY `SubCluster_focalPersonId_fkey`;

-- DropIndex
DROP INDEX `Stakeholder_countryId_fkey` ON `stakeholder`;

-- DropIndex
DROP INDEX `Stakeholder_districtId_fkey` ON `stakeholder`;

-- DropIndex
DROP INDEX `Stakeholder_provinceId_fkey` ON `stakeholder`;

-- DropIndex
DROP INDEX `Stakeholder_subClusterId_fkey` ON `stakeholder`;

-- DropIndex
DROP INDEX `SubCluster_focalPersonId_fkey` ON `subcluster`;

-- AlterTable
ALTER TABLE `stakeholder` DROP COLUMN `countryId`,
    DROP COLUMN `districtId`,
    DROP COLUMN `provinceId`,
    DROP COLUMN `subClusterId`;

-- AlterTable
ALTER TABLE `subcluster` DROP COLUMN `focalPersonId`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `stakeholderId` INTEGER NULL,
    ADD COLUMN `subClusterId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_subClusterId_fkey` FOREIGN KEY (`subClusterId`) REFERENCES `SubCluster`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_stakeholderId_fkey` FOREIGN KEY (`stakeholderId`) REFERENCES `Stakeholder`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
