-- AlterTable
ALTER TABLE `actionplan` ADD COLUMN `stakeholderId` INTEGER NULL;

-- AlterTable
ALTER TABLE `stakeholder` ADD COLUMN `subClusterId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Stakeholder` ADD CONSTRAINT `Stakeholder_subClusterId_fkey` FOREIGN KEY (`subClusterId`) REFERENCES `SubCluster`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ActionPlan` ADD CONSTRAINT `ActionPlan_stakeholderId_fkey` FOREIGN KEY (`stakeholderId`) REFERENCES `Stakeholder`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
