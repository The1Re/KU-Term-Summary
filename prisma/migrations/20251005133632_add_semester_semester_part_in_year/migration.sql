/*
  Warnings:

  - Added the required column `semester` to the `fact_std_plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `semesterPartInYear` to the `fact_std_plan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `fact_std_plan` ADD COLUMN `semester` INTEGER NOT NULL,
    ADD COLUMN `semesterPartInYear` VARCHAR(45) NOT NULL;
