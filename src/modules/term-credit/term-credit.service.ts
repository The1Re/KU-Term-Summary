import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { DatabaseService } from '@/core/database/database.service';
import { Prisma } from '@prisma/client';

type CreateTermCreditInput = {
  factTermSummaryId: number;
  creditRequireId?: number | null;
  creditRequire: number;
  creditPass: number;
  grade: number;
};

type BuildTermCreditsInput = {
  termSummaryId: number;
  studentId: number;
  studyYear: number;
  studyTerm: number;
};

type AggRow = {
  categoryId: number;
  creditSum: number;
  weightedGradeSum: number;
  creditForGrade: number;
};

@Injectable()
export class TermCreditService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(input: CreateTermCreditInput) {
    if (input.creditPass > input.creditRequire) {
      throw new BadRequestException(
        'creditPass cannot be greater than creditRequire.'
      );
    }
    try {
      const data: Prisma.FactTermCreditUncheckedCreateInput = {
        factTermSummaryId: input.factTermSummaryId,
        creditRequireId: input.creditRequireId ?? null,
        creditRequire_: input.creditRequire,
        creditPass: input.creditPass,
        grade: input.grade,
      };
      return await this.databaseService.factTermCredit.create({ data });
    } catch (e) {
      const err = e as { code?: string };
      if (err?.code === 'P2002') {
        throw new ConflictException(
          'Term credit for this (factTermSummaryId, creditRequireId) already exists.'
        );
      }
      if (err?.code === 'P2003') {
        throw new BadRequestException(
          'Foreign key constraint failed. Check factTermSummaryId / creditRequireId.'
        );
      }
      throw e;
    }
  }

  async buildForTerm(input: BuildTermCreditsInput) {
    return await this.databaseService.$transaction(async tx => {
      const termSummary = await tx.factTermSummary.findFirst({
        where: {
          studentId: input.studentId,
          studyYear: input.studyYear,
          studyTerm: input.studyTerm,
        },
        select: { factTermSummaryId: true },
      });
      if (!termSummary) {
        throw new NotFoundException(
          'fact_term_summary not found for given student/studyYear/studyTerm.'
        );
      }
      const termSummaryId = termSummary.factTermSummaryId;

      const existedCount = await tx.factTermCredit.count({
        where: { factTermSummaryId: termSummaryId },
      });
      if (existedCount > 0) {
        throw new ConflictException(
          'fact_term_credit for this term already exists. (No upsert)'
        );
      }
      const factStudent = await tx.factStudent.findFirst({
        where: { studentId: input.studentId },
        select: { coursePlanId: true },
      });
      if (!factStudent?.coursePlanId) {
        throw new NotFoundException(
          'course_plan_id for student not found in fact_student.'
        );
      }
      const coursePlanId = factStudent.coursePlanId;

      const requires = await tx.creditRequire.findMany({
        where: { coursePlanId },
        select: {
          creditRequireId: true,
          subjectCategoryId: true,
          creditSubject: true,
        },
      });
      if (requires.length === 0) {
        throw new NotFoundException(
          'No credit_require rows for this course_plan_id.'
        );
      }

      const aggRows = await tx.$queryRaw<AggRow[]>`
        SELECT
            s.subject_category_id AS categoryId,
            SUM(s.credit) AS creditSum,
            SUM(CASE WHEN fsp.std_grade IS NOT NULL THEN fsp.std_grade * s.credit ELSE 0 END) AS weightedGradeSum,
            SUM(CASE WHEN fsp.std_grade IS NOT NULL THEN s.credit ELSE 0 END) AS creditForGrade
        FROM fact_student_plan fsp
        JOIN subject_course sc ON sc.subject_course_id = fsp.subject_course_id
        JOIN subject s ON s.subject_id = sc.subject_id
        WHERE
            fsp.student_id = ${input.studentId}
            AND fsp.is_pass = 1
            AND (
              fsp.pass_year < ${input.studyYear}
              OR (fsp.pass_year = ${input.studyYear} AND fsp.pass_term <= ${input.studyTerm})
            )
        GROUP BY s.subject_category_id
      `;

      const byCategory = new Map<number, AggRow>();
      for (const r of aggRows) byCategory.set(r.categoryId, r);

      const rows: Prisma.FactTermCreditUncheckedCreateInput[] = [];
      for (const req of requires) {
        const agg = byCategory.get(req.subjectCategoryId) ?? {
          categoryId: req.subjectCategoryId,
          creditSum: 0,
          weightedGradeSum: 0,
          creditForGrade: 0,
        };

        const creditPassRaw = Math.trunc(agg.creditSum);
        const creditRequire = req.creditSubject;
        const grade =
          agg.creditForGrade > 0
            ? Number((agg.weightedGradeSum / agg.creditForGrade).toFixed(3))
            : 0;

        rows.push({
          factTermSummaryId: termSummaryId,
          creditRequireId: req.creditRequireId,
          creditRequire_: creditRequire,
          creditPass: Math.min(creditPassRaw, creditRequire),
          grade,
        });
      }

      if (rows.length === 0) {
        throw new BadRequestException(
          'No rows to insert for fact_term_credit.'
        );
      }
      const created = await tx.factTermCredit.createMany({
        data: rows,
        skipDuplicates: true,
      });

      return {
        termSummaryId,
        insertedCount: created.count,
      };
    });
  }
}
