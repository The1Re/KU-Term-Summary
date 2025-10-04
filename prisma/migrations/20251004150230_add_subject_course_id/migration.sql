/*
  Warnings:

  - You are about to drop the column `subjectCourse` on the `fact_std_plan` table. All the data in the column will be lost.
  - The primary key for the `subject_course` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `subjectCourse` on the `subject_course` table. All the data in the column will be lost.
  - Added the required column `subjectCourseId` to the `fact_std_plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subjectCourseId` to the `subject_course` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `fact_register` DROP FOREIGN KEY `fk_register_sublect-course1`;

-- DropForeignKey
ALTER TABLE `fact_std_plan` DROP FOREIGN KEY `fk_fact_std_plan_subject_course1`;

-- DropIndex
DROP INDEX `fk_fact_std_plan_subject_course1_idx` ON `fact_std_plan`;

-- AlterTable
ALTER TABLE `fact_std_plan` DROP COLUMN `subjectCourse`,
    ADD COLUMN `subjectCourseId` INTEGER NOT NULL,
    MODIFY `gradeLabelId` INTEGER NULL,
    MODIFY `note` VARCHAR(45) NULL;

-- AlterTable
ALTER TABLE `fact_term_summary` MODIFY `gradeLabelId` INTEGER NULL;

-- AlterTable
ALTER TABLE `subject_course` DROP PRIMARY KEY,
    DROP COLUMN `subjectCourse`,
    ADD COLUMN `subjectCourseId` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`subjectCourseId`);

-- CreateIndex
CREATE INDEX `fk_fact_std_plan_subject_course1_idx` ON `fact_std_plan`(`subjectCourseId`);

-- AddForeignKey
ALTER TABLE `fact_register` ADD CONSTRAINT `fk_register_sublect-course1` FOREIGN KEY (`subjectCourseId`) REFERENCES `subject_course`(`subjectCourseId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `fact_std_plan` ADD CONSTRAINT `fk_fact_std_plan_subject_course1` FOREIGN KEY (`subjectCourseId`) REFERENCES `subject_course`(`subjectCourseId`) ON DELETE NO ACTION ON UPDATE NO ACTION;
