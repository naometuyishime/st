-- CreateTable
CREATE TABLE `KpiOptionSet` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `optionSetId` INTEGER NOT NULL,
    `kpiId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `KpiPlan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kpiId` INTEGER NOT NULL,
    `actionPlanId` INTEGER NOT NULL,
    `plannedValue` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_KpiOptionSet` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_KpiOptionSet_AB_unique`(`A`, `B`),
    INDEX `_KpiOptionSet_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `KpiOptionSet` ADD CONSTRAINT `KpiOptionSet_optionSetId_fkey` FOREIGN KEY (`optionSetId`) REFERENCES `OptionSet`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KpiOptionSet` ADD CONSTRAINT `KpiOptionSet_kpiId_fkey` FOREIGN KEY (`kpiId`) REFERENCES `KPI`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KpiPlan` ADD CONSTRAINT `KpiPlan_kpiId_fkey` FOREIGN KEY (`kpiId`) REFERENCES `KPI`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KpiPlan` ADD CONSTRAINT `KpiPlan_actionPlanId_fkey` FOREIGN KEY (`actionPlanId`) REFERENCES `ActionPlan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_KpiOptionSet` ADD CONSTRAINT `_KpiOptionSet_A_fkey` FOREIGN KEY (`A`) REFERENCES `KPI`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_KpiOptionSet` ADD CONSTRAINT `_KpiOptionSet_B_fkey` FOREIGN KEY (`B`) REFERENCES `OptionSet`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
