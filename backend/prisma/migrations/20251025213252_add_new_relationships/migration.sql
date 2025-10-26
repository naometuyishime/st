/*
  Warnings:

  - You are about to drop the column `userId` on the `stakeholder` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `stakeholder` DROP FOREIGN KEY `Stakeholder_userId_fkey`;

-- DropIndex
DROP INDEX `Stakeholder_userId_key` ON `stakeholder`;

-- AlterTable
ALTER TABLE `stakeholder` DROP COLUMN `userId`;

-- CreateTable
CREATE TABLE `StakeholderDistrict` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stakeholderId` INTEGER NOT NULL,
    `districtId` INTEGER NOT NULL,

    UNIQUE INDEX `StakeholderDistrict_stakeholderId_districtId_key`(`stakeholderId`, `districtId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StakeholderSubCluster` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stakeholderId` INTEGER NOT NULL,
    `subClusterId` INTEGER NOT NULL,

    UNIQUE INDEX `StakeholderSubCluster_stakeholderId_subClusterId_key`(`stakeholderId`, `subClusterId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `StakeholderDistrict` ADD CONSTRAINT `StakeholderDistrict_stakeholderId_fkey` FOREIGN KEY (`stakeholderId`) REFERENCES `Stakeholder`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StakeholderDistrict` ADD CONSTRAINT `StakeholderDistrict_districtId_fkey` FOREIGN KEY (`districtId`) REFERENCES `District`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StakeholderSubCluster` ADD CONSTRAINT `StakeholderSubCluster_stakeholderId_fkey` FOREIGN KEY (`stakeholderId`) REFERENCES `Stakeholder`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StakeholderSubCluster` ADD CONSTRAINT `StakeholderSubCluster_subClusterId_fkey` FOREIGN KEY (`subClusterId`) REFERENCES `SubCluster`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
