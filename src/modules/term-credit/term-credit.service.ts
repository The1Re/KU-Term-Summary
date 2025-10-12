import { DatabaseService } from '@/core/database/database.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class TermCreditService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createTermCredit(
    termSummaryId: number,
    studentId: number,
    coursePlanId: number,
    year: number,
    term: number
  ) {
    const subjectCategory = await this.databaseService.creditRequire.findMany({
      where: { coursePlanId },
      select: {
        creditRequireId: true,
        subjectCategoryId: true,
        creditRequire: true,
      },
    });

    const result = await this.databaseService.$queryRaw<
      Array<{
        subjectCategoryId: number;
        totalCredit: number;
        avgGrade: number;
      }>
    >`
      SELECT
          cr.subject_category_id AS subjectCategoryId,
          SUM(subc.credit) AS totalCredit,
          CASE
            WHEN SUM(subc.credit) > 0
            THEN SUM(subc.credit * sub.grade) / SUM(subc.credit)
            ELSE 0
          END AS avgGrade
      FROM
          credit_require AS cr
      NATURAL JOIN subject AS s
      NATURAL JOIN sub_credit AS subc
      INNER JOIN (
            SELECT 
              sc.subject_id AS subject_id,
              fsp.std_grade AS grade
            FROM subject_course AS sc
            NATURAL JOIN fact_student_plan AS fsp
            WHERE 
              fsp.student_id = ${studentId} AND
              fsp.is_pass = TRUE AND
              (
                    fsp.pass_year < ${year} OR
                      (fsp.pass_year = ${year} AND fsp.pass_term <= ${term})
                  )
          ) AS sub ON sub.subject_id = s.subject_id
      WHERE
          cr.course_plan_id = ${coursePlanId}
      GROUP BY cr.subject_category_id
    `;

    const subjectCategoryWithCredits = subjectCategory.map(item => {
      const found = result.find(
        r => r.subjectCategoryId === item.subjectCategoryId
      );
      return {
        ...item,
        totalCredit: found?.totalCredit ?? 0,
        avgGrade: found?.avgGrade ?? 0,
      };
    });

    await this.databaseService.$transaction([
      this.databaseService.factTermCredit.createMany({
        data: subjectCategoryWithCredits.map(item => {
          return {
            factTermSummaryId: termSummaryId,
            creditPass: item.totalCredit,
            grade: item.avgGrade,
            creditRequire_: item.creditRequire,
            creditRequireId: item.creditRequireId,
          } as Prisma.FactTermCreditCreateManyInput;
        }),
      }),
    ]);
  }
}
