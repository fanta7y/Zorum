/*
  Warnings:

  - Added the required column `mid` to the `rooms` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `rooms` ADD COLUMN `mid` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `rooms` ADD CONSTRAINT `rooms_mid_fkey` FOREIGN KEY (`mid`) REFERENCES `tmess`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
