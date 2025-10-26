/*
  Warnings:

  - The values [SUBCLUSTERFOCALPERSON] on the enum `User_role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `_kpioptionset` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `KPI` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `_kpioptionset` DROP FOREIGN KEY `_KpiOptionSet_A_fkey`;

-- DropForeignKey
ALTER TABLE `_kpioptionset` DROP FOREIGN KEY `_KpiOptionSet_B_fkey`;

-- DropForeignKey
ALTER TABLE `kpi` DROP FOREIGN KEY `KPI_kpiCategoryId_fkey`;

-- DropForeignKey
ALTER TABLE `kpi` DROP FOREIGN KEY `KPI_stakeholderCategoryId_fkey`;

-- DropIndex
DROP INDEX `KPI_kpiCategoryId_fkey` ON `kpi`;

-- DropIndex
DROP INDEX `KPI_stakeholderCategoryId_fkey` ON `kpi`;

-- AlterTable
ALTER TABLE `kpi` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `currentValue` DOUBLE NULL,
    ADD COLUMN `optionSetId` INTEGER NULL,
    ADD COLUMN `targetValue` DOUBLE NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `description` VARCHAR(191) NULL,
    MODIFY `unit` VARCHAR(191) NULL,
    MODIFY `kpiCategoryId` INTEGER NULL,
    MODIFY `stakeholderCategoryId` INTEGER NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('STAKEHOLDER_USER', 'ADMIN', 'SUBCLUSTERFOCALPERSON', 'STAKEHOLDER_ADMIN') NOT NULL;

-- DropTable
DROP TABLE `_kpioptionset`;

-- AddForeignKey
ALTER TABLE `KPI` ADD CONSTRAINT `KPI_kpiCategoryId_fkey` FOREIGN KEY (`kpiCategoryId`) REFERENCES `KpiCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KPI` ADD CONSTRAINT `KPI_stakeholderCategoryId_fkey` FOREIGN KEY (`stakeholderCategoryId`) REFERENCES `StakeholderCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KPI` ADD CONSTRAINT `KPI_optionSetId_fkey` FOREIGN KEY (`optionSetId`) REFERENCES `OptionSet`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
