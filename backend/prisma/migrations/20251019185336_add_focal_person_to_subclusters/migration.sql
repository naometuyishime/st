/*
  Warnings:

  - Added the required column `focalPersonId` to the `SubCluster` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `subcluster` ADD COLUMN `focalPersonId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `SubCluster` ADD CONSTRAINT `SubCluster_focalPersonId_fkey` FOREIGN KEY (`focalPersonId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
