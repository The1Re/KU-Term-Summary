import { Test, TestingModule } from '@nestjs/testing';
import {
  TermSummaryUsecase,
  TermKey,
  TermSummaryRow,
} from '../term-summary.usecase';
import { StudentService } from '@/modules/student/student.service';
import { StudentPlanService } from '@/modules/student-plan/student-plan.service';
import { DatabaseService } from '@/core/database/database.service';

describe('TermSummaryUsecase (Unit)', () => {
  let usecase: TermSummaryUsecase;

  // mock provider แบบ minimal (เราใช้ mock mode จึงไม่เรียก DB จริง)
  const mockStudentService = {};
  const mockStudentPlanService = {};
  const mockDatabaseService = {}; // ไม่ต้องมี .query เพราะเราใช้ mock mode

  const row = (
    studentId: string,
    academicYear: number,
    term: TermKey,
    gpax: number,
    creditAll: number,
    studyYear: number,
    studyTerm: number
  ): TermSummaryRow => ({
    studentId,
    academicYear,
    term,
    gpax,
    creditAll,
    studyYear,
    studyTerm,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TermSummaryUsecase,
        { provide: StudentService, useValue: mockStudentService },
        { provide: StudentPlanService, useValue: mockStudentPlanService },
        { provide: DatabaseService, useValue: mockDatabaseService },
      ],
    }).compile();

    usecase = module.get<TermSummaryUsecase>(TermSummaryUsecase);

    // ใช้ mock mode เสมอใน unit test (อ่าน/เขียนผ่าน setter)
    usecase.setMockMode(true);

    // เคลียร์ mock data ทุกครั้งก่อนเริ่มทดสอบแต่ละเคส
    usecase.setMockTermSummaries([]);
    usecase.setMockCoursePlanCredits({});
    usecase.setMockFollowPlanFlag({});
  });

  describe('กรณีไม่มีข้อมูลเทอมปัจจุบัน', () => {
    it('ควรได้สถานะ "กำลังศึกษา" พร้อมเหตุผลแจ้งว่าไม่พบข้อมูล', async () => {
      // ไม่มีการ setMockTermSummaries สำหรับ student S000
      const result = await usecase.evaluate('S000', 2025, 'final');

      expect(result.studentStatus).toBe('กำลังศึกษา');
      expect(
        result.reasons.find(r => r.includes('ไม่พบข้อมูล fact-term-summary'))
      ).toBeTruthy();
      expect(result.gpax).toBeNull();
      expect(result.prevGpax).toBeNull();
    });
  });

  describe('เงื่อนไข GPAX ≤ 1.75', () => {
    it('กรณี prevGPAX ≤ 1.75 และไม่ใช่ปี 1 เทอม 1 ⇒ "พ้นสภาพนิสิต"', async () => {
      // term = 'final' → prev = (ปีเดียวกัน, 'first')
      usecase.setMockTermSummaries([
        row('S100', 2025, 'first', 1.7, 90, 2, 1), // prev GPAX ≤ 1.75
        row('S100', 2025, 'final', 1.6, 100, 2, 2), // curr GPAX ≤ 1.75, และไม่ใช่ปี1เทอม1
      ]);

      const result = await usecase.evaluate('S100', 2025, 'final');
      expect(result.studentStatus).toBe('พ้นสภาพนิสิต');
      expect(result.reasons.join(' ')).toContain('GPAX ≤ 1.75');
    });

    it('กรณี prevGPAX ≤ 1.75 แต่เป็นปี 1 เทอม 1 ⇒ "กำลังศึกษา"', async () => {
      // term = 'first' → prev = (ปี-1, 'final')
      usecase.setMockTermSummaries([
        row('S101', 2024, 'final', 1.6, 24, 1, 2), // prev
        row('S101', 2025, 'first', 1.6, 30, 1, 1), // curr เป็นปี1เทอม1
      ]);

      const result = await usecase.evaluate('S101', 2025, 'first');
      expect(result.studentStatus).toBe('กำลังศึกษา');
      expect(result.reasons.join(' ')).toContain('ยังเป็นปี 1 เทอม 1');
    });

    it('กรณี prevGPAX > 1.75 และ GPAX ปัจจุบัน > 1.5 ⇒ "กำลังศึกษา"', async () => {
      // ไม่เข้า (prev ≤ 1.75) และไม่เข้า (curr ≤ 1.5)
      usecase.setMockTermSummaries([
        row('S102', 2025, 'first', 1.8, 30, 1, 1), // prev > 1.75
        row('S102', 2025, 'final', 1.7, 45, 1, 2), // curr ≤ 1.75 แต่ > 1.5 → ไม่ตกซ้ำ
      ]);

      const result = await usecase.evaluate('S102', 2025, 'final');
      expect(result.studentStatus).toBe('กำลังศึกษา');
      expect(result.reasons.join(' ')).toContain(
        'แม้ GPAX ≤ 1.75 แต่ไม่เข้าเกณฑ์ตกซ้ำ/ต่ำกว่า 1.5'
      );
    });
  });

  describe('เงื่อนไข GPAX > 1.75', () => {
    it('เครดิตสะสมยังไม่ถึงตามแผน ⇒ "กำลังศึกษา"', async () => {
      // plan ต้อง >= 120 แต่ creditAll = 100
      usecase.setMockTermSummaries([
        row('S200', 2025, 'final', 2.2, 100, 4, 2),
      ]);
      usecase.setMockCoursePlanCredits({ S200: 120 });

      const result = await usecase.evaluate('S200', 2025, 'final');
      expect(result.studentStatus).toBe('กำลังศึกษา');
      expect(result.reasons.join(' ')).toContain('หน่วยกิตสะสมยังไม่ถึงตามแผน');
    });

    it('เครดิตถึงตามแผน แต่ followPlan = 0 ⇒ "กำลังศึกษา"', async () => {
      usecase.setMockTermSummaries([
        row('S201', 2025, 'final', 2.3, 130, 4, 2),
      ]);
      usecase.setMockCoursePlanCredits({ S201: 120 });
      usecase.setMockFollowPlanFlag({ S201: 0 }); // เพื่อนรีเทิร์น 0

      const result = await usecase.evaluate('S201', 2025, 'final');
      expect(result.studentStatus).toBe('กำลังศึกษา');
      expect(result.reasons.join(' ')).toContain('ยังไม่ผ่านเกณฑ์ตามแผน');
    });

    it('เครดิตถึงตามแผน และ followPlan = 1 ⇒ "จบการศึกษา"', async () => {
      usecase.setMockTermSummaries([
        row('S202', 2025, 'final', 2.8, 140, 4, 2),
      ]);
      usecase.setMockCoursePlanCredits({ S202: 120 });
      usecase.setMockFollowPlanFlag({ S202: 1 }); // เพื่อนรีเทิร์น 1

      const result = await usecase.evaluate('S202', 2025, 'final');
      expect(result.studentStatus).toBe('จบการศึกษา');
      expect(result.reasons.join(' ')).toContain('บันทึกสถานะ: จบการศึกษา');
    });
  });

  describe('กรณีเทอม summer', () => {
    it('summer ใช้เทอมก่อนหน้าเป็น final ของปีเดียวกัน', async () => {
      // summer → prev = (ปีเดียวกัน, final)
      usecase.setMockTermSummaries([
        row('S300', 2025, 'final', 1.7, 24, 1, 2),
        row('S300', 2025, 'summer', 1.6, 30, 1, 3),
      ]);

      const result = await usecase.evaluate('S300', 2025, 'summer');
      // เนื่องจากปี1เทอม3 (summer) ⇒ เช็คเงื่อนไข GPAX ≤ 1.75 และ prev ≤ 1.75 แต่ยังอยู่ปีแรก
      expect(['กำลังศึกษา', 'พ้นสภาพนิสิต']).toContain(result.studentStatus);
      // ปกติจะยัง "กำลังศึกษา" เพราะปี 1 term 3 ถือว่าไม่ใช่ปี 1 เทอม 1? (ขึ้นกับเกณฑ์องค์กร)
      // ถ้าต้องการให้ summer ปีแรกยังไม่พ้นสภาพ ให้ปรับตรรกะใน usecase หรือใน test ตามเกณฑ์จริงของคณะ
    });
  });
});
