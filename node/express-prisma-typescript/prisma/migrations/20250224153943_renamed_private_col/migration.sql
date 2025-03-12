/*
  Warnings:

  - You are about to drop the column `isPrivate` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "isPrivate",
ADD COLUMN     "private" BOOLEAN NOT NULL DEFAULT false;
