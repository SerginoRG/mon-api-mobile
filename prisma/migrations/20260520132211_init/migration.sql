/*
  Warnings:

  - You are about to drop the column `createda` on the `Users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Users" DROP COLUMN "createda",
ADD COLUMN     "createdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
