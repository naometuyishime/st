/*
  Warnings:

  - The values [STAKEHOLDER,ADMIN] on the enum `User_role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('STAKEHOLDER_USER', 'ADMIN', 'SUBCLUSTERFOCALPERSON', 'STAKEHOLDER_ADMIN') NOT NULL;
