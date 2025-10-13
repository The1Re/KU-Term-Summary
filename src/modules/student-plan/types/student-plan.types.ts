import {
  FactStudentPlan,
  SubjectCourse,
  Subject,
  SubCredit,
  SubjectCategory,
  FactRegister,
} from '@prisma/client';

export type StudentPlanWithLast = FactStudentPlan & {
  subjectCourse: SubjectCourse & {
    subject: Subject & {
      subCredit: SubCredit;
      subjectCategory: SubjectCategory;
    };
  };
  lastRegisterYear?: number | null;
  lastRegisterTerm?: number | null;

  lastRegister?: FactRegister | null;
};
