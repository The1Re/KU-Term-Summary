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
    const [subjectCategory, result] = await Promise.all([
      this.databaseService.creditRequire.findMany({
        where: { coursePlanId },
        include: { subjectCategory: true },
      }),
      this.databaseService.$queryRaw<
        Array<{
          subjectCategoryId: number;
          totalCredit: number;
          avgGrade: number;
        }>
      >`
        WITH RECURSIVE category_hierarchy AS (
          SELECT 
            sc.subject_category_id, sc.subject_category_id AS root_category_id, sc.master_category
          FROM subject_category sc

          UNION ALL

          SELECT 
            c.subject_category_id, ch.root_category_id, c.master_category
          FROM subject_category c
          INNER JOIN category_hierarchy ch ON c.master_category = ch.subject_category_id
        ),
        category_credit AS (
          SELECT
              cr.subject_category_id,
              SUM(subc.credit) AS totalCredit,
              CASE
                WHEN SUM(subc.credit) > 0
                THEN SUM(subc.credit * sub.grade) / SUM(subc.credit)
                ELSE NULL
              END AS avgGrade
          FROM credit_require AS cr
          NATURAL JOIN subject AS s
          NATURAL JOIN sub_credit AS subc
          INNER JOIN (
                SELECT 
                  sc.subject_id,
                  fsp.std_grade AS grade
                FROM subject_course AS sc
                NATURAL JOIN fact_student_plan AS fsp
                WHERE 
                  fsp.student_id = ${studentId}
                  AND fsp.is_pass = TRUE
                  AND (
                    fsp.pass_year < ${year}
                    OR (fsp.pass_year = ${year} AND fsp.pass_term <= ${term})
                  )
            ) AS sub ON sub.subject_id = s.subject_id
          WHERE cr.course_plan_id = ${coursePlanId}
          GROUP BY cr.subject_category_id
        )
        SELECT
          ch.root_category_id AS subjectCategoryId,
          SUM(cc.totalCredit) AS totalCredit,
          CASE 
            WHEN SUM(cc.totalCredit) > 0
            THEN SUM(cc.totalCredit * cc.avgGrade) / SUM(cc.totalCredit)
            ELSE NULL
          END AS avgGrade
        FROM category_hierarchy ch
        LEFT JOIN category_credit cc
          ON ch.subject_category_id = cc.subject_category_id
        GROUP BY ch.root_category_id
        ORDER BY ch.root_category_id;
      `,
    ]);

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

    const existingRecords = await this.databaseService.factTermCredit.findMany({
      where: {
        factTermSummaryId: termSummaryId,
        creditRequireId: {
          in: subjectCategoryWithCredits.map(item => item.creditRequireId),
        },
      },
    });

    await this.databaseService.$transaction(
      subjectCategoryWithCredits.map(item => {
        const existingRecord = existingRecords.find(
          record => record.creditRequireId === item.creditRequireId
        );

        if (existingRecord) {
          return this.databaseService.factTermCredit.update({
            where: {
              factTermCredit: existingRecord.factTermCredit,
            },
            data: {
              creditPass: item.totalCredit,
              grade: item.avgGrade,
              creditRequire_: item.creditRequire,
            },
          });
        } else {
          return this.databaseService.factTermCredit.create({
            data: {
              factTermSummary: {
                connect: { factTermSummaryId: termSummaryId },
              },
              creditPass: item.totalCredit,
              grade: item.avgGrade,
              creditRequire_: item.creditRequire,
              creditRequireId: item.creditRequireId,
            } as Prisma.FactTermCreditCreateInput,
          });
        }
      })
    );
  }
}
