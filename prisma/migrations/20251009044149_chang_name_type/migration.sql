/*
  Warnings:

  - You are about to drop the column `semester` on the `fact_std_plan` table. All the data in the column will be lost.
  - You are about to drop the column `semesterPartInYear` on the `fact_std_plan` table. All the data in the column will be lost.
  - The primary key for the `fact_term_summary` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `TermSummaryId` on the `fact_term_summary` table. All the data in the column will be lost.
  - You are about to drop the column `isCoop` on the `fact_term_summary` table. All the data in the column will be lost.
  - Added the required column `studyTerm` to the `fact_std_plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studyYear` to the `fact_std_plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `termSummaryId` to the `fact_term_summary` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `fact_std_plan` DROP COLUMN `semester`,
    DROP COLUMN `semesterPartInYear`,
    ADD COLUMN `studyTerm` INTEGER NOT NULL,
    ADD COLUMN `studyYear` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `fact_term_summary` DROP PRIMARY KEY,
    DROP COLUMN `TermSummaryId`,
    DROP COLUMN `isCoop`,
    ADD COLUMN `coopStatus` VARCHAR(45) NOT NULL DEFAULT 'nopass',
    ADD COLUMN `termSummaryId` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `planStatus` VARCHAR(45) NOT NULL DEFAULT 'notfollow',
    ADD PRIMARY KEY (`termSummaryId`, `studentId`);
