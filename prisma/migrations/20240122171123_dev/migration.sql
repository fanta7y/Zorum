/*
  Warnings:

  - You are about to drop the column `user_id` on the `tmess` table. All the data in the column will be lost.
  - Added the required column `username` to the `tmess` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `tmess` DROP FOREIGN KEY `tmess_user_id_fkey`;

-- AlterTable
ALTER TABLE `tmess` DROP COLUMN `user_id`,
    ADD COLUMN `username` VARCHAR(255) NOT NULL;

-- AddForeignKey
ALTER TABLE `tmess` ADD CONSTRAINT `tmess_username_fkey` FOREIGN KEY (`username`) REFERENCES `users`(`username`) ON DELETE RESTRICT ON UPDATE CASCADE;
