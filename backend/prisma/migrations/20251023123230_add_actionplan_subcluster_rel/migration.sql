-- AddForeignKey
ALTER TABLE `ActionPlan` ADD CONSTRAINT `ActionPlan_stakeholderSubclusterId_fkey` FOREIGN KEY (`stakeholderSubclusterId`) REFERENCES `SubCluster`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
