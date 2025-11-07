-- DropForeignKey
ALTER TABLE `course_plan` DROP FOREIGN KEY `fk_course_plan_course1`;

-- DropForeignKey
ALTER TABLE `credit_require` DROP FOREIGN KEY `fk_credit_require_course_plan1`;

-- DropForeignKey
ALTER TABLE `credit_require` DROP FOREIGN KEY `fk_credit_require_subject_category1`;

-- DropForeignKey
ALTER TABLE `fact_class` DROP FOREIGN KEY `fact_class_ibfk_1`;

-- DropForeignKey
ALTER TABLE `fact_class` DROP FOREIGN KEY `fk_fact_class_subject`;

-- DropForeignKey
ALTER TABLE `fact_leave` DROP FOREIGN KEY `advisor_teacher_id_ibfk`;

-- DropForeignKey
ALTER TABLE `fact_leave` DROP FOREIGN KEY `fact_leave_ibfk_1`;

-- DropForeignKey
ALTER TABLE `fact_leave` DROP FOREIGN KEY `fact_leave_ibfk_2`;

-- DropForeignKey
ALTER TABLE `fact_leave_subject` DROP FOREIGN KEY `fact_leave_subject_ibfk_1`;

-- DropForeignKey
ALTER TABLE `fact_leave_subject` DROP FOREIGN KEY `fact_register_leave-subject_ibfk`;

-- DropForeignKey
ALTER TABLE `fact_leave_subject` DROP FOREIGN KEY `fact_room_usage_leave-subject_ibfk`;

-- DropForeignKey
ALTER TABLE `fact_register` DROP FOREIGN KEY `fk_class_id`;

-- DropForeignKey
ALTER TABLE `fact_register` DROP FOREIGN KEY `fk_credit_require`;

-- DropForeignKey
ALTER TABLE `fact_register` DROP FOREIGN KEY `fk_fact_register_grade_label_id`;

-- DropForeignKey
ALTER TABLE `fact_register` DROP FOREIGN KEY `fk_fact_register_subject_course`;

-- DropForeignKey
ALTER TABLE `fact_register` DROP FOREIGN KEY `fk_student_id`;

-- DropForeignKey
ALTER TABLE `fact_room_usage` DROP FOREIGN KEY `fk_room_usage_class`;

-- DropForeignKey
ALTER TABLE `fact_room_usage` DROP FOREIGN KEY `fk_room_usage_date`;

-- DropForeignKey
ALTER TABLE `fact_room_usage` DROP FOREIGN KEY `fk_room_usage_room`;

-- DropForeignKey
ALTER TABLE `fact_room_usage` DROP FOREIGN KEY `fk_room_usage_teacher`;

-- DropForeignKey
ALTER TABLE `fact_student` DROP FOREIGN KEY `fact_student_ibfk_1`;

-- DropForeignKey
ALTER TABLE `fact_student` DROP FOREIGN KEY `fact_student_ibfk_10`;

-- DropForeignKey
ALTER TABLE `fact_student` DROP FOREIGN KEY `fact_student_ibfk_3`;

-- DropForeignKey
ALTER TABLE `fact_student` DROP FOREIGN KEY `fact_student_ibfk_4`;

-- DropForeignKey
ALTER TABLE `fact_student` DROP FOREIGN KEY `fact_student_ibfk_6`;

-- DropForeignKey
ALTER TABLE `fact_student` DROP FOREIGN KEY `fact_student_ibfk_7`;

-- DropForeignKey
ALTER TABLE `fact_student` DROP FOREIGN KEY `fact_student_ibfk_8`;

-- DropForeignKey
ALTER TABLE `fact_student_plan` DROP FOREIGN KEY `fk_fact_student_plan_grade_label_id`;

-- DropForeignKey
ALTER TABLE `fact_student_plan` DROP FOREIGN KEY `fk_fact_student_plan_subject_course_id`;

-- DropForeignKey
ALTER TABLE `fact_term_credit` DROP FOREIGN KEY `fk_fact_std_plan_credit_require_id`;

-- DropForeignKey
ALTER TABLE `fact_term_credit` DROP FOREIGN KEY `fk_fact_term_credit_fact_term_summary_id`;

-- DropForeignKey
ALTER TABLE `fact_term_summary` DROP FOREIGN KEY `fk_fact_term_summary_grade_label_id`;

-- DropForeignKey
ALTER TABLE `fact_term_summary` DROP FOREIGN KEY `fk_fact_term_summary_teacher_id`;

-- DropForeignKey
ALTER TABLE `lecturer` DROP FOREIGN KEY `fk_lecturer_class`;

-- DropForeignKey
ALTER TABLE `subject` DROP FOREIGN KEY `fk_subject_course1`;

-- DropForeignKey
ALTER TABLE `subject` DROP FOREIGN KEY `fk_subject_sub_credit1`;

-- DropForeignKey
ALTER TABLE `subject_course` DROP FOREIGN KEY `fk_subject_course_course_plan1`;

-- DropForeignKey
ALTER TABLE `subject_course` DROP FOREIGN KEY `fk_subject_course_subject1`;

-- AddForeignKey
ALTER TABLE `fact_class` ADD CONSTRAINT `fact_class_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `course`(`course_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fact_class` ADD CONSTRAINT `fk_fact_class_subject` FOREIGN KEY (`subject_id`) REFERENCES `subject`(`subject_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fact_leave` ADD CONSTRAINT `advisor_teacher_id_ibfk` FOREIGN KEY (`advisor_id`) REFERENCES `teacher`(`teacher_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `fact_leave` ADD CONSTRAINT `fact_leave_ibfk_1` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_type`(`leave_type_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `fact_leave` ADD CONSTRAINT `fact_leave_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `student`(`student_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `fact_leave_subject` ADD CONSTRAINT `fact_leave_subject_ibfk_1` FOREIGN KEY (`fact_leave_id`) REFERENCES `fact_leave`(`fact_leave_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `fact_leave_subject` ADD CONSTRAINT `fact_register_leave-subject_ibfk` FOREIGN KEY (`fact_regis_id`) REFERENCES `fact_register`(`regis_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `fact_leave_subject` ADD CONSTRAINT `fact_room_usage_leave-subject_ibfk` FOREIGN KEY (`fact_room_usage_id`) REFERENCES `fact_room_usage`(`room_usage_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `fact_room_usage` ADD CONSTRAINT `fk_room_usage_class` FOREIGN KEY (`class_id`) REFERENCES `fact_class`(`class_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `fact_room_usage` ADD CONSTRAINT `fk_room_usage_date` FOREIGN KEY (`date_key`) REFERENCES `dim_date`(`date_key`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fact_room_usage` ADD CONSTRAINT `fk_room_usage_room` FOREIGN KEY (`room_id`) REFERENCES `room`(`room_Id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fact_room_usage` ADD CONSTRAINT `fk_room_usage_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teacher`(`teacher_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE `lecturer` ADD CONSTRAINT `fk_lecturer_class` FOREIGN KEY (`class_id`) REFERENCES `fact_class`(`class_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `course_plan` ADD CONSTRAINT `fk_course_plan_course1` FOREIGN KEY (`course_id`) REFERENCES `course`(`course_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `credit_require` ADD CONSTRAINT `fk_credit_require_course_plan1` FOREIGN KEY (`course_plan_id`) REFERENCES `course_plan`(`course_plan_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `credit_require` ADD CONSTRAINT `fk_credit_require_subject_category1` FOREIGN KEY (`subject_category_id`) REFERENCES `subject_category`(`subject_category_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `fact_register` ADD CONSTRAINT `fk_class_id` FOREIGN KEY (`class_id`) REFERENCES `fact_class`(`class_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `fact_register` ADD CONSTRAINT `fk_credit_require` FOREIGN KEY (`credit_require_id`) REFERENCES `credit_require`(`credit_require_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `fact_register` ADD CONSTRAINT `fk_fact_register_subject_course` FOREIGN KEY (`subject_course_id`) REFERENCES `subject_course`(`subject_course_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `fact_register` ADD CONSTRAINT `fk_fact_register_grade_label_id` FOREIGN KEY (`grade_label_id`) REFERENCES `grade_label`(`grade_label_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `fact_register` ADD CONSTRAINT `fk_student_id` FOREIGN KEY (`student_id`) REFERENCES `student`(`student_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `fact_student_plan` ADD CONSTRAINT `fk_fact_student_plan_grade_label_id` FOREIGN KEY (`grade_label_id`) REFERENCES `grade_label`(`grade_label_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `fact_student_plan` ADD CONSTRAINT `fk_fact_student_plan_student_id` FOREIGN KEY (`student_id`) REFERENCES `student`(`student_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `fact_student_plan` ADD CONSTRAINT `fk_fact_student_plan_subject_course_id` FOREIGN KEY (`subject_course_id`) REFERENCES `subject_course`(`subject_course_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `fact_term_summary` ADD CONSTRAINT `fk_fact_term_summary_grade_label_id` FOREIGN KEY (`grade_label_id`) REFERENCES `grade_label`(`grade_label_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `fact_term_summary` ADD CONSTRAINT `fk_fact_term_summary_student_id` FOREIGN KEY (`student_id`) REFERENCES `student`(`student_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `fact_term_summary` ADD CONSTRAINT `fk_fact_term_summary_teacher_id` FOREIGN KEY (`teacher_id`) REFERENCES `teacher`(`teacher_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `fact_term_credit` ADD CONSTRAINT `fk_fact_std_plan_credit_require_id` FOREIGN KEY (`credit_require_id`) REFERENCES `credit_require`(`credit_require_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `fact_term_credit` ADD CONSTRAINT `fk_fact_term_credit_fact_term_summary_id` FOREIGN KEY (`fact_term_summary_id`) REFERENCES `fact_term_summary`(`fact_term_summary_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `subject_course` ADD CONSTRAINT `fk_subject_course_course_plan1` FOREIGN KEY (`course_plan_id`) REFERENCES `course_plan`(`course_plan_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `subject_course` ADD CONSTRAINT `fk_subject_course_subject1` FOREIGN KEY (`subject_id`) REFERENCES `subject`(`subject_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `subject` ADD CONSTRAINT `fk_subject_course1` FOREIGN KEY (`course_id`) REFERENCES `course`(`course_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `subject` ADD CONSTRAINT `fk_subject_sub_credit1` FOREIGN KEY (`sub_credit_id`) REFERENCES `sub_credit`(`sub_credit_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
