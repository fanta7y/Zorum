/*
  Warnings:

  - Added the required column `rm_id` to the `tmess` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `tmess` ADD COLUMN `rm_id` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `dl` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tmess` ADD CONSTRAINT `tmess_rm_id_fkey` FOREIGN KEY (`rm_id`) REFERENCES `dl`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
