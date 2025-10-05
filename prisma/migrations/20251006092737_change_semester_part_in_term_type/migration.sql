-- AlterTable
ALTER TABLE `fact_term_summary` MODIFY `studentStatus` VARCHAR(45) NOT NULL DEFAULT 'studying',
    MODIFY `semesterPartInTerm` VARCHAR(45) NOT NULL;
