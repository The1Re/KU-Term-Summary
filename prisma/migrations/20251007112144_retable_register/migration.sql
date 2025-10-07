/*
  Warnings:

  - You are about to drop the column `credit` on the `credit_require` table. All the data in the column will be lost.
  - You are about to drop the column `semester` on the `fact_register` table. All the data in the column will be lost.
  - The primary key for the `fact_term_summary` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `student` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `subjectId` on the `subject_credit` table. All the data in the column will be lost.
  - Added the required column `couseEndYear` to the `course_plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `couseStartYear` to the `course_plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creditIntern` to the `course_plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creditSubject` to the `credit_require` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creditRegis` to the `fact_register` table without a default value. This is not possible if the table is not empty.
  - Added the required column `semesterYearInRegis` to the `fact_register` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studyTermInRegis` to the `fact_register` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studyYearInRegis` to the `fact_register` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nameSubjectEng` to the `subject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subjectCourse` to the `subject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subjectCreditId` to the `subject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bySelfHours` to the `subject_credit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `labHours` to the `subject_credit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lectureHours` to the `subject_credit` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `fact_register` DROP FOREIGN KEY `fk_register_student1`;

-- DropForeignKey
ALTER TABLE `fact_std_plan` DROP FOREIGN KEY `fk_fact-std-plan_student1`;

-- DropForeignKey
ALTER TABLE `fact_term_summary` DROP FOREIGN KEY `fk_fact-term-summary_student1`;

-- DropForeignKey
ALTER TABLE `subject_credit` DROP FOREIGN KEY `fk_subject_credit_subject1`;

-- DropIndex
DROP INDEX `fk_subject_credit_subject1_idx` ON `subject_credit`;

-- AlterTable
ALTER TABLE `course_plan` ADD COLUMN `couseEndYear` INTEGER NOT NULL,
    ADD COLUMN `couseStartYear` INTEGER NOT NULL,
    ADD COLUMN `creditIntern` INTEGER NOT NULL,
    MODIFY `internshipHours` INTEGER NULL;

-- AlterTable
ALTER TABLE `credit_require` DROP COLUMN `credit`,
    ADD COLUMN `creditSubject` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `fact_register` DROP COLUMN `semester`,
    ADD COLUMN `creditRegis` INTEGER NOT NULL,
    ADD COLUMN `semesterYearInRegis` INTEGER NOT NULL,
    ADD COLUMN `studyTermInRegis` INTEGER NOT NULL,
    ADD COLUMN `studyYearInRegis` INTEGER NOT NULL,
    MODIFY `studentId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `fact_std_plan` MODIFY `studentId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `fact_term_summary` DROP PRIMARY KEY,
    MODIFY `studentId` VARCHAR(191) NOT NULL,
    MODIFY `isCoop` BOOLEAN NOT NULL DEFAULT false,
    ADD PRIMARY KEY (`TermSummaryId`, `studentId`);

-- AlterTable
ALTER TABLE `student` DROP PRIMARY KEY,
    MODIFY `studentId` VARCHAR(45) NOT NULL,
    ADD PRIMARY KEY (`studentId`);

-- AlterTable
ALTER TABLE `subject` ADD COLUMN `nameSubjectEng` VARCHAR(225) NOT NULL,
    ADD COLUMN `subjectCourse` INTEGER NOT NULL,
    ADD COLUMN `subjectCreditId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `subject_credit` DROP COLUMN `subjectId`,
    ADD COLUMN `bySelfHours` INTEGER NOT NULL,
    ADD COLUMN `labHours` INTEGER NOT NULL,
    ADD COLUMN `lectureHours` INTEGER NOT NULL,
    ADD COLUMN `subjectSubjectId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `fk_subject_subject_credit1_idx` ON `subject`(`subjectCreditId`);

-- AddForeignKey
ALTER TABLE `fact_register` ADD CONSTRAINT `fk_register_student1` FOREIGN KEY (`studentId`) REFERENCES `student`(`studentId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `fact_std_plan` ADD CONSTRAINT `fk_fact-std-plan_student1` FOREIGN KEY (`studentId`) REFERENCES `student`(`studentId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `subject_credit` ADD CONSTRAINT `subject_credit_subjectSubjectId_fkey` FOREIGN KEY (`subjectSubjectId`) REFERENCES `subject`(`subjectId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fact_term_summary` ADD CONSTRAINT `fk_fact-term-summary_student1` FOREIGN KEY (`studentId`) REFERENCES `student`(`studentId`) ON DELETE NO ACTION ON UPDATE NO ACTION;
