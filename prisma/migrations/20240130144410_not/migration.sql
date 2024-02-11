/*
  Warnings:

  - You are about to drop the column `rm_id` on the `tmess` table. All the data in the column will be lost.
  - You are about to drop the `dl` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `tmess` DROP FOREIGN KEY `tmess_rm_id_fkey`;

-- AlterTable
ALTER TABLE `tmess` DROP COLUMN `rm_id`;

-- DropTable
DROP TABLE `dl`;
