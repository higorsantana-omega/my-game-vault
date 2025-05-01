/*
  Warnings:

  - Added the required column `rawgId` to the `game` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "game" ADD COLUMN     "rawgId" TEXT NOT NULL;
