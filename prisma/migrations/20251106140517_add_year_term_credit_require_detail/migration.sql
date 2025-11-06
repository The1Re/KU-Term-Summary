-- CreateTable
CREATE TABLE `credit_require_detail` (
    `credit_require_detail_id` INTEGER NOT NULL AUTO_INCREMENT,
    `credit_require_id` INTEGER NOT NULL,
    `credit` INTEGER NOT NULL,
    `study_year` INTEGER NOT NULL,
    `study_term` INTEGER NOT NULL,

    INDEX `fk_credit_require_detail_credit_require1_idx`(`credit_require_id`),
    INDEX `study_year_term`(`study_year`, `study_term`),
    PRIMARY KEY (`credit_require_detail_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `credit_require_detail` ADD CONSTRAINT `fk_credit_require_detail_credit_require1` FOREIGN KEY (`credit_require_id`) REFERENCES `credit_require`(`credit_require_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
