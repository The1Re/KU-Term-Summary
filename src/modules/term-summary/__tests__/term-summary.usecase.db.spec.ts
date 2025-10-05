import { Test, TestingModule } from '@nestjs/testing';
import { TermSummaryUsecase } from '../term-summary.usecase';
import { StudentService } from '@/modules/student/student.service';
import { StudentPlanService } from '@/modules/student-plan/student-plan.service';
import { DatabaseService } from '@/core/database/database.service';

describe('TermSummaryUsecase (Mock mode via db.spec)', () => {
  let usecase: TermSummaryUsecase;

  // บังคับใช้ mock mode เพื่ออ่านข้อมูล mock ภายใน usecase
  beforeAll(() => {
    process.env.TERM_SUMMARY_USE_MOCK = '1';
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TermSummaryUsecase,
        // สองตัวนี้ไม่ถูกใช้ใน evaluate() ตอน mock mode — mock เป็น object เปล่าได้
        { provide: StudentService, useValue: {} },
        { provide: StudentPlanService, useValue: {} },
        // DatabaseService ก็ mock ได้ เพราะเราไม่แตะ DB ใน mock mode
        { provide: DatabaseService, useValue: {} },
      ],
    }).compile();

    usecase = module.get(TermSummaryUsecase);
    // เผื่อ ENV ไม่ถูกโหลดในบางสภาพแวดล้อม ให้เปิด mock mode ซ้ำแบบโปรแกรม
    usecase.setMockMode(true);
  });

  it('อ่านผลจากข้อมูล mock ที่กำหนดใน usecase', async () => {
    // คาดหวังผลตาม mock:
    // S001 2025 first → กำลังศึกษา (ปี4เทอม1 → notFirstFirst เป็น false)
    // S001 2025 final → พ้นสภาพนิสิต (prev ≤ 1.75 และปี/เทอมไม่ใช่ปี1เทอม1)
    // S002 2025 final → จบการศึกษา (GPAX>1.75, creditAll=plan, followPlan=1)
    // S003 2025 summer → กำลังศึกษา (GPAX>1.75 แต่เครดิตยังไม่ถึงตามแผน)
    const cases = [
      {
        id: 'S001',
        year: 2025,
        term: 'first' as const,
        expectStatus: 'กำลังศึกษา',
      },
      {
        id: 'S001',
        year: 2025,
        term: 'final' as const,
        expectStatus: 'พ้นสภาพนิสิต',
      },
      {
        id: 'S002',
        year: 2025,
        term: 'final' as const,
        expectStatus: 'จบการศึกษา',
      },
      {
        id: 'S003',
        year: 2025,
        term: 'summer' as const,
        expectStatus: 'กำลังศึกษา',
      },
    ];

    for (const c of cases) {
      const res = await usecase.evaluate(c.id, c.year, c.term);

      // debug log ถ้าอยากดูเหตุผลละเอียด

      console.log(`[${c.id}-${c.year}-${c.term}] → ${res.studentStatus}`);

      console.log(res.reasons.map(r => `• ${r}`).join('\n'));

      expect(res.studentStatus).toBe(c.expectStatus);
      expect(res.gpax).not.toBeNull();
      expect(res.creditAll).not.toBeNull();
    }
  });
});
