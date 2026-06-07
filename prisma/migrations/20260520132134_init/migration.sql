/*
  Warnings:

  - You are about to drop the column `createdat` on the `Users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Users" DROP COLUMN "createdat",
ADD COLUMN     "createda" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
