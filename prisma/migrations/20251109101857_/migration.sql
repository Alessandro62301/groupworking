/*
  Warnings:

  - Added the required column `password_hash` to the `members` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `members` ADD COLUMN `admin` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `password_hash` VARCHAR(191) NOT NULL;
