-- CreateTable
CREATE TABLE `course` (
    `courseId` INTEGER NOT NULL AUTO_INCREMENT,
    `nameCourseTh` VARCHAR(225) NOT NULL,
    `nameCourseUse` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`courseId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `course_plan` (
    `coursePlanId` INTEGER NOT NULL AUTO_INCREMENT,
    `courseId` INTEGER NOT NULL,
    `planCourse` VARCHAR(225) NOT NULL,
    `totalCredit` INTEGER NOT NULL,
    `generalSubjectCredit` INTEGER NOT NULL,
    `specificSubjectCredit` INTEGER NOT NULL,
    `freeSubjectCredit` INTEGER NOT NULL,
    `coreSubjectCredit` INTEGER NOT NULL,
    `spacailSubjectCredit` INTEGER NOT NULL,
    `selectSubjectCredit` INTEGER NOT NULL,
    `happySubjectCredit` INTEGER NOT NULL,
    `entrepreneurshipSubjectCredit` INTEGER NOT NULL,
    `languageSubjectCredit` INTEGER NOT NULL,
    `peopleSubjectCredit` INTEGER NOT NULL,
    `aestheticsSubjectCredit` INTEGER NOT NULL,
    `internshipHours` INTEGER NOT NULL,

    INDEX `fk_course_plan_course1_idx`(`courseId`),
    PRIMARY KEY (`coursePlanId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `credit_require` (
    `creditRequireId` INTEGER NOT NULL AUTO_INCREMENT,
    `coursePlanId` INTEGER NOT NULL,
    `subjectCaterogyId` INTEGER NOT NULL,
    `credit` INTEGER NOT NULL,

    INDEX `fk_credit_require_course_plan1_idx`(`coursePlanId`),
    INDEX `fk_credit_require_subject_caterogy1_idx`(`subjectCaterogyId`),
    PRIMARY KEY (`creditRequireId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fact_register` (
    `regisId` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NOT NULL,
    `creditRequireId` INTEGER NOT NULL,
    `subjectCourseId` INTEGER NOT NULL,
    `semester` INTEGER NOT NULL,
    `semesterPartInRegis` VARCHAR(45) NOT NULL,
    `gradeNumber` FLOAT NULL,
    `gradeCharacter` VARCHAR(45) NULL,
    `gradeLabelId` INTEGER NULL,

    INDEX `fk_fact_register_grade_label1_idx`(`gradeLabelId`),
    INDEX `fk_register_credit_require1_idx`(`creditRequireId`),
    INDEX `fk_register_student1_idx`(`studentId`),
    INDEX `fk_register_sublect_course1_idx`(`subjectCourseId`),
    PRIMARY KEY (`regisId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student` (
    `studentId` INTEGER NOT NULL AUTO_INCREMENT,
    `studentUsername` VARCHAR(45) NOT NULL,
    `studentStatusId` INTEGER NOT NULL,
    `coursePlanId` INTEGER NOT NULL,

    INDEX `fk_student_course_plan1_idx`(`coursePlanId`),
    INDEX `fk_student_student_status1_idx`(`studentStatusId`),
    PRIMARY KEY (`studentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_status` (
    `studentStatusId` INTEGER NOT NULL AUTO_INCREMENT,
    `status` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`studentStatusId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fact_std_plan` (
    `stdPlanId` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NOT NULL,
    `subjectCourse` INTEGER NOT NULL,
    `gradeLabelId` INTEGER NOT NULL,
    `grade` VARCHAR(45) NULL,
    `isPass` TINYINT NOT NULL DEFAULT 0,
    `note` VARCHAR(45) NOT NULL,

    INDEX `fk_fact-std-plan_student1_idx`(`studentId`),
    INDEX `fk_fact_std_plan_grade_label1_idx`(`gradeLabelId`),
    INDEX `fk_fact_std_plan_subject_course1_idx`(`subjectCourse`),
    PRIMARY KEY (`stdPlanId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subject` (
    `subjectId` INTEGER NOT NULL AUTO_INCREMENT,
    `courseId` INTEGER NOT NULL,
    `subjectCaterogyId` INTEGER NOT NULL,
    `subjectCode` VARCHAR(45) NOT NULL,
    `nameSubjectThai` VARCHAR(225) NOT NULL,
    `credit` INTEGER NOT NULL,

    INDEX `fk_subject_course1_idx`(`courseId`),
    INDEX `fk_subject_subject_caterogy1_idx`(`subjectCaterogyId`),
    PRIMARY KEY (`subjectId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subject_caterogy` (
    `subjectCaterogyId` INTEGER NOT NULL AUTO_INCREMENT,
    `subjectCategoryName` VARCHAR(100) NOT NULL,
    `subjectGroupName` VARCHAR(225) NOT NULL,

    PRIMARY KEY (`subjectCaterogyId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subject_course` (
    `subjectCourse` INTEGER NOT NULL AUTO_INCREMENT,
    `subjectId` INTEGER NOT NULL,
    `coursePlanId` INTEGER NOT NULL,

    INDEX `fk_subject_course_course_plan1_idx`(`coursePlanId`),
    INDEX `fk_subject_course_subject1_idx`(`subjectId`),
    PRIMARY KEY (`subjectCourse`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subject_credit` (
    `subjectCreditId` INTEGER NOT NULL AUTO_INCREMENT,
    `subjectId` INTEGER NOT NULL,
    `lectureCredit` INTEGER NOT NULL,
    `labCredit` INTEGER NOT NULL,

    INDEX `fk_subject_credit_subject1_idx`(`subjectId`),
    PRIMARY KEY (`subjectCreditId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fact_term_summary` (
    `TermSummaryId` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NOT NULL,
    `creditTerm` INTEGER NOT NULL,
    `creditAll` INTEGER NOT NULL,
    `gpa` FLOAT NOT NULL,
    `gpax` FLOAT NOT NULL,
    `studyYear` INTEGER NOT NULL,
    `studyTerm` INTEGER NOT NULL,
    `planStatus` VARCHAR(45) NOT NULL DEFAULT 'nopass',
    `studentStatus` VARCHAR(45) NOT NULL DEFAULT ' studying',
    `isCoop` TINYINT NOT NULL DEFAULT 0,
    `generalSubjectCredit` INTEGER NOT NULL,
    `specificSubjectCredit` INTEGER NOT NULL,
    `freeSubjectCredit` INTEGER NOT NULL,
    `selectSubjectCredit` INTEGER NOT NULL,
    `generalSubjectCreditAll` INTEGER NOT NULL,
    `specificSubjectCreditAll` INTEGER NOT NULL,
    `freeSubjectCreditAll` INTEGER NOT NULL,
    `selectSubjectCreditAll` INTEGER NOT NULL,
    `semesterYearInTerm` INTEGER NOT NULL,
    `semesterPartInTerm` INTEGER NOT NULL,
    `gradeLabelId` INTEGER NOT NULL,

    INDEX `fk_fact-term-summary_grade-label1_idx`(`gradeLabelId`),
    INDEX `fk_fact-term-summary_student1_idx`(`studentId`),
    PRIMARY KEY (`TermSummaryId`, `studentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `grade_label` (
    `gradeLabelId` INTEGER NOT NULL AUTO_INCREMENT,
    `gpaStatusName` VARCHAR(45) NOT NULL,
    `gpaMinInStatus` FLOAT NOT NULL,
    `gpaStatusMax` FLOAT NOT NULL,
    `gpaxStatusName` VARCHAR(45) NOT NULL,
    `gpaxStatusMin` FLOAT NOT NULL,
    `gpaxStatusMax` FLOAT NOT NULL,

    PRIMARY KEY (`gradeLabelId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `course_plan` ADD CONSTRAINT `fk_course_plan_course1` FOREIGN KEY (`courseId`) REFERENCES `course`(`courseId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `credit_require` ADD CONSTRAINT `fk_credit_require_course_plan1` FOREIGN KEY (`coursePlanId`) REFERENCES `course_plan`(`coursePlanId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `credit_require` ADD CONSTRAINT `fk_credit_require_subject_caterogy1` FOREIGN KEY (`subjectCaterogyId`) REFERENCES `subject_caterogy`(`subjectCaterogyId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `fact_register` ADD CONSTRAINT `fk_fact_register_grade_label1` FOREIGN KEY (`gradeLabelId`) REFERENCES `grade_label`(`gradeLabelId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `fact_register` ADD CONSTRAINT `fk_register_credit-require1` FOREIGN KEY (`creditRequireId`) REFERENCES `credit_require`(`creditRequireId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `fact_register` ADD CONSTRAINT `fk_register_student1` FOREIGN KEY (`studentId`) REFERENCES `student`(`studentId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `fact_register` ADD CONSTRAINT `fk_register_sublect-course1` FOREIGN KEY (`subjectCourseId`) REFERENCES `subject_course`(`subjectCourse`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `student` ADD CONSTRAINT `fk_student_course_plan1` FOREIGN KEY (`coursePlanId`) REFERENCES `course_plan`(`coursePlanId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `student` ADD CONSTRAINT `fk_student_student_status1` FOREIGN KEY (`studentStatusId`) REFERENCES `student_status`(`studentStatusId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `fact_std_plan` ADD CONSTRAINT `fk_fact-std-plan_student1` FOREIGN KEY (`studentId`) REFERENCES `student`(`studentId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `fact_std_plan` ADD CONSTRAINT `fk_fact_std_plan_grade_label1` FOREIGN KEY (`gradeLabelId`) REFERENCES `grade_label`(`gradeLabelId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `fact_std_plan` ADD CONSTRAINT `fk_fact_std_plan_subject_course1` FOREIGN KEY (`subjectCourse`) REFERENCES `subject_course`(`subjectCourse`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `subject` ADD CONSTRAINT `fk_subject_course1` FOREIGN KEY (`courseId`) REFERENCES `course`(`courseId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `subject` ADD CONSTRAINT `fk_subject_subject_caterogy1` FOREIGN KEY (`subjectCaterogyId`) REFERENCES `subject_caterogy`(`subjectCaterogyId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `subject_course` ADD CONSTRAINT `fk_subject_course_course_plan1` FOREIGN KEY (`coursePlanId`) REFERENCES `course_plan`(`coursePlanId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `subject_course` ADD CONSTRAINT `fk_subject_course_subject1` FOREIGN KEY (`subjectId`) REFERENCES `subject`(`subjectId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `subject_credit` ADD CONSTRAINT `fk_subject_credit_subject1` FOREIGN KEY (`subjectId`) REFERENCES `subject`(`subjectId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `fact_term_summary` ADD CONSTRAINT `fk_fact-term-summary_grade-label1` FOREIGN KEY (`gradeLabelId`) REFERENCES `grade_label`(`gradeLabelId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `fact_term_summary` ADD CONSTRAINT `fk_fact-term-summary_student1` FOREIGN KEY (`studentId`) REFERENCES `student`(`studentId`) ON DELETE NO ACTION ON UPDATE NO ACTION;
