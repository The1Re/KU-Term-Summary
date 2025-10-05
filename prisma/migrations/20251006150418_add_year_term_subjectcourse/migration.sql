/*
  Warnings:

  - Added the required column `studyYear` to the `subject_course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `term` to the `subject_course` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `subject_course` ADD COLUMN `studyYear` INTEGER NOT NULL,
    ADD COLUMN `term` INTEGER NOT NULL;
