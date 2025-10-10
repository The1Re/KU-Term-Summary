-- CreateTable
CREATE TABLE `admission_round` (
    `admission_round_id` INTEGER NOT NULL AUTO_INCREMENT,
    `admission_round` INTEGER NOT NULL,
    `admission_round_name` VARCHAR(100) NULL,

    PRIMARY KEY (`admission_round_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `building` (
    `building_Id` INTEGER NOT NULL AUTO_INCREMENT,
    `building_name` VARCHAR(255) NULL,
    `building_code` VARCHAR(10) NOT NULL,

    PRIMARY KEY (`building_Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `classroom` (
    `classroom_id` INTEGER NOT NULL AUTO_INCREMENT,
    `class_id` INTEGER NOT NULL,
    `room_id` INTEGER NOT NULL,

    INDEX `idx_class_id`(`class_id`),
    INDEX `idx_room_id`(`room_id`),
    PRIMARY KEY (`classroom_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `classtime` (
    `classtime_id` INTEGER NOT NULL AUTO_INCREMENT,
    `start_time` TIME(0) NOT NULL,
    `end_time` TIME(0) NOT NULL,
    `time_period` VARCHAR(50) NULL,
    `duration` DECIMAL(4, 2) NULL,

    PRIMARY KEY (`classtime_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `department` (
    `dept_id` INTEGER NOT NULL AUTO_INCREMENT,
    `dept_code` VARCHAR(10) NOT NULL,
    `dept_name` VARCHAR(30) NOT NULL,
    `dept_alias_th` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`dept_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dim_date` (
    `date_key` INTEGER NOT NULL,
    `full_date` DATE NOT NULL,
    `day` INTEGER NOT NULL,
    `day_name` VARCHAR(20) NOT NULL,
    `day_of_week` INTEGER NOT NULL,
    `week_number` INTEGER NOT NULL,
    `week_start_date` DATE NOT NULL,
    `week_end_date` DATE NOT NULL,
    `month` INTEGER NOT NULL,
    `month_name` VARCHAR(20) NOT NULL,
    `quarter` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `is_weekend` BOOLEAN NOT NULL,

    PRIMARY KEY (`date_key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fact_class` (
    `class_id` INTEGER NOT NULL AUTO_INCREMENT,
    `subject_id` INTEGER NULL,
    `course_id` INTEGER NOT NULL,
    `classtime_id1` INTEGER NULL,
    `classtime_id2` INTEGER NULL,
    `semester_year` INTEGER NULL,
    `semesterPart` ENUM('0', '1', '2') NULL,
    `sec` INTEGER NULL,
    `secType` ENUM('Lec', 'Lab') NULL,
    `class_capacity` VARCHAR(45) NULL,
    `day_name1` VARCHAR(3) NOT NULL,
    `day_name2` VARCHAR(3) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `is_current` BOOLEAN NULL DEFAULT true,
    `effective_start_ts` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `effective_end_ts` TIMESTAMP(0) NULL,
    `change_comment` VARCHAR(255) NULL,

    INDEX `course_id`(`course_id`),
    INDEX `idx_classtime1`(`classtime_id1`),
    INDEX `idx_classtime2`(`classtime_id2`),
    INDEX `idx_subject`(`subject_id`),
    UNIQUE INDEX `unique_class_naja`(`subject_id`, `course_id`, `semester_year`, `semesterPart`, `sec`),
    PRIMARY KEY (`class_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fact_leave` (
    `fact_leave_id` INTEGER NOT NULL AUTO_INCREMENT,
    `leave_type_id` INTEGER NOT NULL,
    `student_id` INTEGER NOT NULL,
    `advisor_id` INTEGER NOT NULL,
    `type` ENUM('ลากิจ', 'ลาป่วย') NOT NULL,
    `date_start` DATE NULL,
    `date_end` DATE NULL,
    `total_day` INTEGER NOT NULL,
    `leave_reason` TEXT NULL,
    `reject_reason` TEXT NULL,
    `statusAdvisor` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `statusDepartHead` ENUM('not_required', 'pending', 'rejected', 'approved') NOT NULL DEFAULT 'not_required',
    `statusDean` ENUM('not_required', 'pending', 'rejected', 'approved') NOT NULL DEFAULT 'not_required',
    `statusFinal` ENUM('pending', 'cancelled', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `file_path` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `address_detail` TEXT NULL,
    `phone` VARCHAR(10) NULL,
    `email` VARCHAR(255) NULL,

    UNIQUE INDEX `fact_leave_id`(`fact_leave_id`),
    INDEX `advisor_teacher_id`(`advisor_id`),
    INDEX `fact_leave_index_0`(`fact_leave_id`, `leave_type_id`),
    INDEX `leave_type_id`(`leave_type_id`),
    INDEX `student_id`(`student_id`),
    PRIMARY KEY (`fact_leave_id`, `leave_type_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fact_leave_subject` (
    `fact_leave_subject_id` INTEGER NOT NULL AUTO_INCREMENT,
    `fact_leave_id` INTEGER NULL,
    `fact_regis_id` INTEGER NULL,
    `fact_room_usage_id` INTEGER NULL,

    UNIQUE INDEX `fact_leave_subject_id`(`fact_leave_subject_id`),
    INDEX `fact_leave_id`(`fact_leave_id`),
    INDEX `fact_register_id`(`fact_leave_subject_id`),
    INDEX `fact_register_leave-subject_ibfk`(`fact_regis_id`),
    INDEX `fact_room_usage_id`(`fact_room_usage_id`),
    PRIMARY KEY (`fact_leave_subject_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fact_room_usage` (
    `room_usage_id` INTEGER NOT NULL AUTO_INCREMENT,
    `date_key` INTEGER NOT NULL,
    `class_id` INTEGER NOT NULL,
    `room_id` INTEGER NOT NULL,
    `teacher_id` INTEGER NOT NULL,
    `classtime_id` INTEGER NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `is_current` BOOLEAN NULL DEFAULT true,
    `effective_start_ts` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `effective_end_ts` TIMESTAMP(0) NULL,
    `change_comment` VARCHAR(255) NULL,

    INDEX `idx_class`(`class_id`),
    INDEX `idx_classtime`(`classtime_id`),
    INDEX `idx_date`(`date_key`),
    INDEX `idx_room`(`room_id`),
    INDEX `idx_teacher`(`teacher_id`),
    UNIQUE INDEX `uq_room_usage_current`(`date_key`, `room_id`, `classtime_id`, `is_current`),
    PRIMARY KEY (`room_usage_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fact_student` (
    `student_id` INTEGER NOT NULL,
    `school_id` INTEGER NOT NULL,
    `department_id` INTEGER NOT NULL,
    `program_id` INTEGER NOT NULL,
    `teacher_id` INTEGER NOT NULL,
    `course_plan_id` INTEGER NOT NULL,
    `admission_round_id` INTEGER NOT NULL,
    `student_status_id` INTEGER NOT NULL,
    `admission_year` INTEGER NOT NULL,
    `study_generation` INTEGER NOT NULL,

    INDEX `admission_round_id`(`admission_round_id`),
    INDEX `course_id`(`course_plan_id`),
    INDEX `department_id`(`department_id`),
    INDEX `fact_student_ibfk_10`(`student_status_id`),
    INDEX `program_id`(`program_id`),
    INDEX `school_id`(`school_id`),
    INDEX `teacher_id`(`teacher_id`),
    PRIMARY KEY (`student_id`, `school_id`, `student_status_id`, `department_id`, `program_id`, `teacher_id`, `course_plan_id`, `admission_round_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `leave_type` (
    `leave_type_id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('ลากิจ', 'ลาป่วย') NOT NULL,
    `min_day` INTEGER NOT NULL,
    `required` TINYINT NOT NULL DEFAULT 0,

    PRIMARY KEY (`leave_type_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lecturer` (
    `lecturer_id` INTEGER NOT NULL AUTO_INCREMENT,
    `teacher_id` INTEGER NOT NULL,
    `class_id` INTEGER NOT NULL,

    INDEX `idx_class_id`(`class_id`),
    INDEX `idx_teacher_id`(`teacher_id`),
    PRIMARY KEY (`lecturer_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `program` (
    `program_id` INTEGER NOT NULL AUTO_INCREMENT,
    `lang_program` VARCHAR(20) NOT NULL,
    `name_program` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`program_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `province` (
    `province_id` INTEGER NOT NULL AUTO_INCREMENT,
    `province_name` VARCHAR(50) NOT NULL,
    `region_id` INTEGER NOT NULL,

    INDEX `region_id`(`region_id`),
    PRIMARY KEY (`province_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `region` (
    `region_id` INTEGER NOT NULL AUTO_INCREMENT,
    `region_name` VARCHAR(30) NOT NULL,

    PRIMARY KEY (`region_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `room` (
    `room_Id` INTEGER NOT NULL AUTO_INCREMENT,
    `building_building_Id` INTEGER NULL,
    `room_code` VARCHAR(10) NOT NULL,
    `room_capacity` DECIMAL(10, 0) NULL,
    `roomType` ENUM('Lecture', 'Laboratory', 'Meeting') NULL,

    INDEX `fk_room_building1`(`building_building_Id`),
    PRIMARY KEY (`room_Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `school` (
    `school_id` INTEGER NOT NULL AUTO_INCREMENT,
    `school_name` VARCHAR(150) NOT NULL,
    `province_id` INTEGER NOT NULL,

    INDEX `province_id`(`province_id`),
    PRIMARY KEY (`school_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sub_credit` (
    `sub_credit_id` INTEGER NOT NULL AUTO_INCREMENT,
    `credit` INTEGER NOT NULL,
    `lecture_hours` INTEGER NOT NULL,
    `lab_hours` INTEGER NOT NULL,
    `by_self_hours` INTEGER NOT NULL,

    PRIMARY KEY (`sub_credit_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `course` (
    `course_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name_course_th` VARCHAR(150) NOT NULL,
    `name_course_use` VARCHAR(50) NOT NULL,
    `name_course_eng` VARCHAR(150) NOT NULL,
    `name_full_degree_th` VARCHAR(150) NOT NULL,
    `name_full_degree_eng` VARCHAR(150) NOT NULL,
    `name_initials_degree_th` VARCHAR(100) NOT NULL,
    `name_initials_degree_eng` VARCHAR(100) NOT NULL,
    `department_id` INTEGER NOT NULL,

    INDEX `fk_course_department`(`department_id`),
    PRIMARY KEY (`course_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subject_type` (
    `subject_type_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name_subject_type` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`subject_type_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `teacher` (
    `teacher_id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(20) NOT NULL,
    `teacher_code` VARCHAR(10) NULL,
    `first_name_th` VARCHAR(50) NOT NULL,
    `title_teacher_th` VARCHAR(10) NOT NULL,
    `last_name_th` VARCHAR(50) NOT NULL,
    `first_name_eng` VARCHAR(50) NOT NULL,
    `last_name_eng` VARCHAR(50) NOT NULL,
    `department_id` INTEGER NOT NULL,
    `faculty_check` INTEGER NOT NULL,

    INDEX `department_id`(`department_id`),
    INDEX `teacher_id_teacher_code`(`teacher_id`, `teacher_code`),
    PRIMARY KEY (`teacher_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `course_plan` (
    `course_plan_id` INTEGER NOT NULL AUTO_INCREMENT,
    `course_id` INTEGER NOT NULL,
    `plan_course` VARCHAR(50) NOT NULL,
    `credit_intern` INTEGER NOT NULL,
    `total_credit` INTEGER NOT NULL,
    `general_subject_credit` INTEGER NOT NULL,
    `specific_subject_credit` INTEGER NOT NULL,
    `free_subject_credit` INTEGER NOT NULL,
    `core_subject_credit` INTEGER NOT NULL,
    `special_subject_credit` INTEGER NOT NULL,
    `select_subject_credit` INTEGER NOT NULL,
    `happy_subject_credit` INTEGER NOT NULL,
    `entrepreneurship_subject_credit` INTEGER NOT NULL,
    `language_subject_credit` INTEGER NOT NULL,
    `people_subject_credit` INTEGER NOT NULL,
    `aesthetics_subject_credit` INTEGER NOT NULL,
    `internship_hours` INTEGER NULL,
    `is_visible` TINYINT NOT NULL DEFAULT 1,

    INDEX `fk_course_plan_course1_idx`(`course_id`),
    PRIMARY KEY (`course_plan_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `credit_require` (
    `credit_require_id` INTEGER NOT NULL AUTO_INCREMENT,
    `subject_category_id` INTEGER NOT NULL,
    `course_plan_id` INTEGER NOT NULL,
    `credit_subject` INTEGER NOT NULL,

    INDEX `fk_credit_require_course_plan1_idx`(`course_plan_id`),
    INDEX `fk_credit_require_subject_category1_idx`(`subject_category_id`),
    PRIMARY KEY (`credit_require_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fact_register` (
    `regis_id` INTEGER NOT NULL AUTO_INCREMENT,
    `student_id` INTEGER NULL,
    `subject_code_in_regis` VARCHAR(10) NULL,
    `class_id` INTEGER NULL,
    `sec_lecture` INTEGER NULL,
    `sec_lab` INTEGER NULL,
    `grade_character` VARCHAR(2) NULL,
    `grade_number` FLOAT NULL,
    `credit_regis` INTEGER NULL,
    `typeRegis` ENUM('0', '1') NULL,
    `study_year_in_regis` INTEGER NULL,
    `study_term_in_regis` INTEGER NULL,
    `semester_year_in_regis` INTEGER NULL,
    `semesterPartInRegis` ENUM('0', '1', '2') NULL,
    `subject_course_id` INTEGER NULL,
    `grade_label_id` INTEGER NULL,
    `credit_require_id` INTEGER NULL,
    `register_time` INTEGER NULL DEFAULT 1,

    INDEX `fk_class_id`(`class_id`),
    INDEX `fk_credit_require`(`credit_require_id`),
    INDEX `fk_fact_register_grade_label_id`(`grade_label_id`),
    INDEX `fk_fact_register_subject_course`(`subject_course_id`),
    INDEX `fk_student_id`(`student_id`),
    PRIMARY KEY (`regis_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fact_student_plan` (
    `fact_student_plan_id` INTEGER NOT NULL AUTO_INCREMENT,
    `student_id` INTEGER NOT NULL,
    `subject_course_id` INTEGER NOT NULL,
    `grade_label_id` INTEGER NULL,
    `is_require` BOOLEAN NOT NULL DEFAULT false,
    `is_pass` BOOLEAN NOT NULL DEFAULT false,
    `pass_year` INTEGER NULL,
    `pass_term` INTEGER NULL,
    `std_grade` FLOAT NULL,
    `grade_details` VARCHAR(45) NULL,

    INDEX `fk_fact_student_plan_grade_label_id`(`grade_label_id`),
    INDEX `fk_fact_student_plan_student_id`(`student_id`),
    INDEX `fk_fact_student_plan_subject_course_id`(`subject_course_id`),
    PRIMARY KEY (`fact_student_plan_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fact_term_summary` (
    `fact_term_summary_id` INTEGER NOT NULL AUTO_INCREMENT,
    `student_id` INTEGER NOT NULL,
    `teacher_id` INTEGER NOT NULL,
    `credit_term` INTEGER NOT NULL,
    `credit_all` INTEGER NOT NULL,
    `gpa` FLOAT NOT NULL,
    `gpax` FLOAT NOT NULL,
    `study_year` INTEGER NOT NULL,
    `study_term` INTEGER NOT NULL,
    `is_follow_plan` BOOLEAN NULL DEFAULT false,
    `semester_year_in_term` INTEGER NOT NULL,
    `semester_part_in_term` VARCHAR(45) NOT NULL,
    `grade_label_id` INTEGER NULL,
    `is_coop_eligible` BOOLEAN NOT NULL DEFAULT false,

    INDEX `fk_fact_term_summary_grade_label_id`(`grade_label_id`),
    INDEX `fk_fact_term_summary_student_id`(`student_id`),
    INDEX `fk_fact_term_summary_teacher_id`(`teacher_id`),
    INDEX `study_year`(`study_year`, `study_term`),
    PRIMARY KEY (`fact_term_summary_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fact_term_credit` (
    `fact_term_credit` INTEGER NOT NULL AUTO_INCREMENT,
    `fact_term_summary_id` INTEGER NOT NULL,
    `credit_require_id` INTEGER NULL,
    `credit_require` INTEGER NOT NULL,
    `credit_pass` INTEGER NOT NULL,
    `grade` FLOAT NOT NULL,

    INDEX `fk_fact_term_credit_credit_require_id`(`credit_require_id`),
    INDEX `fk_fact_term_credit_fact_term_summary_id`(`fact_term_summary_id`),
    PRIMARY KEY (`fact_term_credit`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `grade_label` (
    `grade_label_id` INTEGER NOT NULL AUTO_INCREMENT,
    `grade_status_name` VARCHAR(20) NULL,
    `grade_min_in_status` FLOAT NULL,
    `grade_max_status` FLOAT NULL,

    PRIMARY KEY (`grade_label_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pre_subject` (
    `pre_subject_id` INTEGER NOT NULL AUTO_INCREMENT,
    `previous_subject_id` INTEGER NOT NULL,
    `subject_id` INTEGER NOT NULL,

    INDEX `previous_subject_id_idx`(`previous_subject_id`, `subject_id`),
    INDEX `subject_id_idx`(`subject_id`),
    PRIMARY KEY (`pre_subject_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student` (
    `student_id` INTEGER NOT NULL AUTO_INCREMENT,
    `student_username` VARCHAR(10) NOT NULL,
    `stdLevel` ENUM('b', 'g') NULL,
    `person_id` VARCHAR(13) NULL,
    `name_th` VARCHAR(50) NOT NULL,
    `name_eng` VARCHAR(50) NOT NULL,
    `genderTh` ENUM('ชาย', 'หญิง') NULL,
    `genderEng` ENUM('Male', 'Female') NULL,
    `titleTh` ENUM('นาย', 'นางสาว', 'นาง') NOT NULL,
    `titleEng` ENUM('Mr.', 'Mrs.', 'Miss') NOT NULL,
    `tell` VARCHAR(10) NOT NULL,
    `parent_phone` VARCHAR(10) NULL,
    `email` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `student_username`(`student_username`),
    PRIMARY KEY (`student_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_status` (
    `student_status_id` INTEGER NOT NULL,
    `status` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`student_status_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subject_course` (
    `subject_course_id` INTEGER NOT NULL AUTO_INCREMENT,
    `subject_id` INTEGER NOT NULL,
    `course_plan_id` INTEGER NOT NULL,
    `study_year` INTEGER NOT NULL,
    `study_term` INTEGER NOT NULL,

    INDEX `fk_subject_course_course_plan1_idx`(`course_plan_id`),
    INDEX `fk_subject_course_subject1_idx`(`subject_id`),
    PRIMARY KEY (`subject_course_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subject_category` (
    `subject_category_id` INTEGER NOT NULL AUTO_INCREMENT,
    `subject_category_name` VARCHAR(30) NOT NULL,
    `subject_group_name` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`subject_category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subject` (
    `subject_id` INTEGER NOT NULL AUTO_INCREMENT,
    `course_id` INTEGER NOT NULL,
    `subject_type_id` INTEGER NOT NULL,
    `subject_category_id` INTEGER NOT NULL,
    `sub_credit_id` INTEGER NOT NULL,
    `subject_code` VARCHAR(255) NOT NULL,
    `name_subject_thai` VARCHAR(100) NOT NULL,
    `name_subject_eng` VARCHAR(100) NOT NULL,
    `credit` INTEGER NOT NULL,
    `is_visible` TINYINT NOT NULL DEFAULT 1,

    INDEX `fk_subject_course1_idx`(`course_id`),
    INDEX `fk_subject_sub_credit1_idx`(`sub_credit_id`),
    INDEX `subject_group_id`(`subject_category_id`),
    INDEX `subject_type_id_idx`(`subject_type_id`),
    PRIMARY KEY (`subject_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `classroom` ADD CONSTRAINT `fk_classroom_class` FOREIGN KEY (`class_id`) REFERENCES `fact_class`(`class_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `classroom` ADD CONSTRAINT `fk_classroom_room` FOREIGN KEY (`room_id`) REFERENCES `room`(`room_Id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fact_class` ADD CONSTRAINT `fact_class_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `course`(`course_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `fact_class` ADD CONSTRAINT `fk_fact_class_classtime1` FOREIGN KEY (`classtime_id1`) REFERENCES `classtime`(`classtime_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `fact_class` ADD CONSTRAINT `fk_fact_class_classtime2` FOREIGN KEY (`classtime_id2`) REFERENCES `classtime`(`classtime_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `fact_class` ADD CONSTRAINT `fk_fact_class_subject` FOREIGN KEY (`subject_id`) REFERENCES `subject`(`subject_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fact_leave` ADD CONSTRAINT `advisor_teacher_id_ibfk` FOREIGN KEY (`advisor_id`) REFERENCES `teacher`(`teacher_id`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `fact_leave` ADD CONSTRAINT `fact_leave_ibfk_1` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_type`(`leave_type_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `fact_leave` ADD CONSTRAINT `fact_leave_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `student`(`student_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `fact_leave_subject` ADD CONSTRAINT `fact_leave_subject_ibfk_1` FOREIGN KEY (`fact_leave_id`) REFERENCES `fact_leave`(`fact_leave_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `fact_leave_subject` ADD CONSTRAINT `fact_register_leave-subject_ibfk` FOREIGN KEY (`fact_regis_id`) REFERENCES `fact_register`(`regis_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `fact_leave_subject` ADD CONSTRAINT `fact_room_usage_leave-subject_ibfk` FOREIGN KEY (`fact_room_usage_id`) REFERENCES `fact_room_usage`(`room_usage_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `fact_room_usage` ADD CONSTRAINT `fk_room_usage_class` FOREIGN KEY (`class_id`) REFERENCES `fact_class`(`class_id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fact_room_usage` ADD CONSTRAINT `fk_room_usage_classtime` FOREIGN KEY (`classtime_id`) REFERENCES `classtime`(`classtime_id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fact_room_usage` ADD CONSTRAINT `fk_room_usage_date` FOREIGN KEY (`date_key`) REFERENCES `dim_date`(`date_key`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fact_room_usage` ADD CONSTRAINT `fk_room_usage_room` FOREIGN KEY (`room_id`) REFERENCES `room`(`room_Id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fact_room_usage` ADD CONSTRAINT `fk_room_usage_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teacher`(`teacher_id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fact_student` ADD CONSTRAINT `fact_student_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `school`(`school_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `fact_student` ADD CONSTRAINT `fact_student_ibfk_10` FOREIGN KEY (`student_status_id`) REFERENCES `student_status`(`student_status_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `fact_student` ADD CONSTRAINT `fact_student_ibfk_3` FOREIGN KEY (`program_id`) REFERENCES `program`(`program_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `fact_student` ADD CONSTRAINT `fact_student_ibfk_4` FOREIGN KEY (`admission_round_id`) REFERENCES `admission_round`(`admission_round_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `fact_student` ADD CONSTRAINT `fact_student_ibfk_6` FOREIGN KEY (`department_id`) REFERENCES `department`(`dept_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `fact_student` ADD CONSTRAINT `fact_student_ibfk_7` FOREIGN KEY (`teacher_id`) REFERENCES `teacher`(`teacher_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `fact_student` ADD CONSTRAINT `fact_student_ibfk_8` FOREIGN KEY (`course_plan_id`) REFERENCES `course_plan`(`course_plan_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `fact_student` ADD CONSTRAINT `fact_student_ibfk_9` FOREIGN KEY (`student_id`) REFERENCES `student`(`student_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lecturer` ADD CONSTRAINT `fk_lecturer_class` FOREIGN KEY (`class_id`) REFERENCES `fact_class`(`class_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lecturer` ADD CONSTRAINT `fk_lecturer_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teacher`(`teacher_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `province` ADD CONSTRAINT `province_ibfk_1` FOREIGN KEY (`region_id`) REFERENCES `region`(`region_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `room` ADD CONSTRAINT `fk_room_building1` FOREIGN KEY (`building_building_Id`) REFERENCES `building`(`building_Id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `school` ADD CONSTRAINT `school_ibfk_1` FOREIGN KEY (`province_id`) REFERENCES `province`(`province_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course` ADD CONSTRAINT `fk_course_department` FOREIGN KEY (`department_id`) REFERENCES `department`(`dept_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teacher` ADD CONSTRAINT `teacher_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `department`(`dept_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_plan` ADD CONSTRAINT `fk_course_plan_course1` FOREIGN KEY (`course_id`) REFERENCES `course`(`course_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `credit_require` ADD CONSTRAINT `fk_credit_require_course_plan1` FOREIGN KEY (`course_plan_id`) REFERENCES `course_plan`(`course_plan_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `credit_require` ADD CONSTRAINT `fk_credit_require_subject_category1` FOREIGN KEY (`subject_category_id`) REFERENCES `subject_category`(`subject_category_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `fact_register` ADD CONSTRAINT `fk_class_id` FOREIGN KEY (`class_id`) REFERENCES `fact_class`(`class_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `fact_register` ADD CONSTRAINT `fk_credit_require` FOREIGN KEY (`credit_require_id`) REFERENCES `credit_require`(`credit_require_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `fact_register` ADD CONSTRAINT `fk_fact_register_grade_label_id` FOREIGN KEY (`grade_label_id`) REFERENCES `grade_label`(`grade_label_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `fact_register` ADD CONSTRAINT `fk_fact_register_subject_course` FOREIGN KEY (`subject_course_id`) REFERENCES `subject_course`(`subject_course_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fact_register` ADD CONSTRAINT `fk_student_id` FOREIGN KEY (`student_id`) REFERENCES `student`(`student_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `fact_student_plan` ADD CONSTRAINT `fk_fact_student_plan_grade_label_id` FOREIGN KEY (`grade_label_id`) REFERENCES `grade_label`(`grade_label_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `fact_student_plan` ADD CONSTRAINT `fk_fact_student_plan_subject_course_id` FOREIGN KEY (`subject_course_id`) REFERENCES `subject_course`(`subject_course_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `fact_term_summary` ADD CONSTRAINT `fk_fact_term_summary_grade_label_id` FOREIGN KEY (`grade_label_id`) REFERENCES `grade_label`(`grade_label_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `fact_term_summary` ADD CONSTRAINT `fk_fact_term_summary_teacher_id` FOREIGN KEY (`teacher_id`) REFERENCES `teacher`(`teacher_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `fact_term_credit` ADD CONSTRAINT `fk_fact_std_plan_credit_require_id` FOREIGN KEY (`credit_require_id`) REFERENCES `credit_require`(`credit_require_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `fact_term_credit` ADD CONSTRAINT `fk_fact_term_credit_fact_term_summary_id` FOREIGN KEY (`fact_term_summary_id`) REFERENCES `fact_term_summary`(`fact_term_summary_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `pre_subject` ADD CONSTRAINT `pre_subject_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `subject`(`subject_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pre_subject` ADD CONSTRAINT `pre_subject_ibfk_2` FOREIGN KEY (`previous_subject_id`) REFERENCES `subject`(`subject_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subject_course` ADD CONSTRAINT `fk_subject_course_course_plan1` FOREIGN KEY (`course_plan_id`) REFERENCES `course_plan`(`course_plan_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `subject_course` ADD CONSTRAINT `fk_subject_course_subject1` FOREIGN KEY (`subject_id`) REFERENCES `subject`(`subject_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `subject` ADD CONSTRAINT `fk_subject_course1` FOREIGN KEY (`course_id`) REFERENCES `course`(`course_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `subject` ADD CONSTRAINT `fk_subject_sub_credit1` FOREIGN KEY (`sub_credit_id`) REFERENCES `sub_credit`(`sub_credit_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `subject` ADD CONSTRAINT `subject_ibfk_1` FOREIGN KEY (`subject_category_id`) REFERENCES `subject_category`(`subject_category_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subject` ADD CONSTRAINT `subject_ibfk_2` FOREIGN KEY (`subject_type_id`) REFERENCES `subject_type`(`subject_type_id`) ON DELETE CASCADE ON UPDATE CASCADE;
