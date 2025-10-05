import { Injectable } from '@nestjs/common';
import { StudentService } from '../student/student.service';
import { StudentPlanService } from '../student-plan/student-plan.service';
import { DatabaseService } from '@/core/database/database.service';

// ===== Types =====
export type TermKey = 'first' | 'final' | 'summer';

export interface TermSummaryRow {
  studentId: string;
  academicYear: number; // e.g., 2025
  term: TermKey; // 'first' | 'final' | 'summer'
  gpax: number; // เกรดเฉลี่ยรวม สะสม ณ เทอมนั้น
  creditAll: number; // หน่วยกิตสะสมที่ผ่านทั้งหมด ณ เทอมนั้น
  studyYear: number; // ปีการศึกษาของนิสิต: 1..N
  studyTerm: number; // ลำดับเทอมภายในปี: 1=first, 2=final, 3=summer
}

export interface EvaluateResult {
  studentId: string;
  academicYear: number;
  term: TermKey;
  gpax: number | null;
  prevGpax: number | null;
  creditAll: number | null;
  coursePlanCreditAll: number | null;
  studyYear: number | null;
  studyTerm: number | null;
  followPlan: 0 | 1 | null;
  studentStatus: 'พ้นสภาพนิสิต' | 'กำลังศึกษา' | 'จบการศึกษา';
  reasons: string[]; // บันทึกเหตุผลการตัดสินใจทีละขั้น
}

@Injectable()
export class TermSummaryUsecase {
  // ===== Mock controls =====
  private useMock: boolean =
    process.env.TERM_SUMMARY_USE_MOCK === '0' ? false : true;

  private mockTermSummaries: TermSummaryRow[] = [
    // ตัวอย่างข้อมูลสมมุติ (แก้ไข/เพิ่มได้ตามต้องการ)
    {
      studentId: 'S001',
      academicYear: 2025,
      term: 'first',
      gpax: 1.62,
      creditAll: 102,
      studyYear: 4,
      studyTerm: 1,
    },
    {
      studentId: 'S001',
      academicYear: 2025,
      term: 'final',
      gpax: 1.7,
      creditAll: 120,
      studyYear: 4,
      studyTerm: 2,
    },
    {
      studentId: 'S001',
      academicYear: 2024,
      term: 'final',
      gpax: 1.6,
      creditAll: 96,
      studyYear: 3,
      studyTerm: 2,
    },

    {
      studentId: 'S002',
      academicYear: 2025,
      term: 'final',
      gpax: 2.51,
      creditAll: 136,
      studyYear: 4,
      studyTerm: 2,
    },
    {
      studentId: 'S002',
      academicYear: 2025,
      term: 'first',
      gpax: 2.4,
      creditAll: 128,
      studyYear: 4,
      studyTerm: 1,
    },

    {
      studentId: 'S003',
      academicYear: 2025,
      term: 'summer',
      gpax: 1.8,
      creditAll: 30,
      studyYear: 1,
      studyTerm: 3,
    },
    {
      studentId: 'S003',
      academicYear: 2025,
      term: 'final',
      gpax: 1.7,
      creditAll: 24,
      studyYear: 1,
      studyTerm: 2,
    },
  ];

  private mockCoursePlanCredits: Record<string, number> = {
    S001: 130, // รวมหน่วยกิตตามแผนสำหรับจบ
    S002: 136,
    S003: 140,
  };

  private mockFollowPlanFlag: Record<string, 0 | 1> = {
    S001: 0, // ยังไม่ครบตามแผน (หรือลำดับไม่ตรงตามแผน)
    S002: 1, // เรียนตามแผนครบแล้ว
    S003: 0,
  };

  constructor(
    private readonly studentService: StudentService,
    private readonly studentPlanService: StudentPlanService,
    private readonly databaseService: DatabaseService
  ) {}

  // ===== Helpers: term mapping =====
  private termToPart(term: TermKey): number {
    return term === 'first' ? 1 : term === 'final' ? 2 : 3;
  }

  private partToTerm(part: number): TermKey {
    return part === 1 ? 'first' : part === 2 ? 'final' : 'summer';
  }

  // previous term mapping
  private getPreviousTerm(
    academicYear: number,
    term: TermKey
  ): { academicYear: number; term: TermKey } {
    // สมมุติรูปแบบปฏิทิน: first → final (ปีเดียวกัน) → summer (ปีเดียวกัน) → first (ปีถัดไป)
    if (term === 'first') {
      return { academicYear: academicYear - 1, term: 'final' };
    }
    if (term === 'final') {
      return { academicYear, term: 'first' };
    }
    // summer
    return { academicYear, term: 'final' };
  }

  // ===== Data access (DB or Mock) =====
  private async getTermSummary(
    studentId: string,
    academicYear: number,
    term: TermKey
  ): Promise<TermSummaryRow | null> {
    if (this.useMock) {
      return (
        this.mockTermSummaries.find(
          r =>
            r.studentId === studentId &&
            r.academicYear === academicYear &&
            r.term === term
        ) ?? null
      );
    }

    const part = this.termToPart(term);

    const factTermSummary = this.databaseService.factTermSummary;
    const r = await factTermSummary.findFirst({
      where: {
        studentId: Number(studentId),
        semesterYearInTerm: academicYear,
        semesterPartInTerm: part,
      },
      select: {
        studentId: true,
        semesterYearInTerm: true,
        semesterPartInTerm: true,
        gpax: true,
        creditAll: true,
        studyYear: true,
        studyTerm: true,
      },
    });

    if (!r) return null;

    return {
      studentId: String(r.studentId),
      academicYear: r.semesterYearInTerm,
      term: this.partToTerm(Number(r.semesterPartInTerm)),
      gpax: r.gpax,
      creditAll: r.creditAll,
      studyYear: r.studyYear,
      studyTerm: r.studyTerm,
    };
  }

  private async getCoursePlanCreditAll(
    studentId: string
  ): Promise<number | null> {
    if (this.useMock) {
      return this.mockCoursePlanCredits[studentId] ?? null;
    }

    // join ผ่าน Prisma: student → course_plan(totalCredit)
    const s: { course_plan?: { totalCredit: number | null } } | null =
      await this.databaseService.student.findUnique({
        where: { studentId: Number(studentId) },
        select: { course_plan: { select: { totalCredit: true } } },
      });

    return typeof s?.course_plan?.totalCredit === 'number'
      ? s.course_plan.totalCredit
      : null;
  }

  /**
   * ตรวจว่าเรียน "ตามแผน" หรือไม่ (เพื่อนจะส่งค่า 0/1 กลับมาในอนาคต)
   * DB-mode ชั่วคราว: อ่าน planStatus จาก fact_term_summary (เทอมที่ระบุ) แล้ว map เป็น 0/1
   */
  private async checkFollowPlan(
    studentId: string,
    academicYear: number,
    term: TermKey
  ): Promise<0 | 1> {
    if (this.useMock) {
      return this.mockFollowPlanFlag[studentId] ?? 0;
    }

    const part = this.termToPart(term);
    const r = await this.databaseService.factTermSummary.findFirst({
      where: {
        studentId: Number(studentId),
        semesterYearInTerm: academicYear,
        semesterPartInTerm: part,
      },
      select: { planStatus: true },
    });

    const status = r?.planStatus?.toLowerCase?.() ?? '';
    return status === 'pass' || status === 'complete' ? 1 : 0;
  }

  /**
   * เปิด/ปิด mock โหมดใน runtime (เช่นใช้ใน e2e test หรือ dev console)
   */
  private ensureMockEnabled() {
    if (!this.useMock) {
      throw new Error(
        'Mock mode is disabled. Set TERM_SUMMARY_USE_MOCK=1 to use mock setters.'
      );
    }
  }

  // ===== Public API =====
  /**
   * ประเมินสถานะนิสิตในเทอมที่ระบุ และตัดสินว่า "จบการศึกษา" / "กำลังศึกษา" / "พ้นสภาพนิสิต" ตามกฎที่ให้มา
   *
   * @param studentId รหัสนิสิต (string)
   * @param academicYear ปีการศึกษา เช่น 2025
   * @param term 'first' | 'final' | 'summer'
   */
  async evaluate(
    studentId: string,
    academicYear: number,
    term: TermKey
  ): Promise<EvaluateResult> {
    const reasons: string[] = [];

    // 1) ดึงข้อมูลเทอมปัจจุบัน + เทอมก่อนหน้า
    const curr = await this.getTermSummary(studentId, academicYear, term);
    if (!curr) {
      // ถ้าไม่มีข้อมูลเทอมนี้เลย — ให้ถือว่ายัง "กำลังศึกษา" และแจ้งเหตุผล
      return {
        studentId,
        academicYear,
        term,
        gpax: null,
        prevGpax: null,
        creditAll: null,
        coursePlanCreditAll: null,
        studyYear: null,
        studyTerm: null,
        followPlan: null,
        studentStatus: 'กำลังศึกษา',
        reasons: [
          'ไม่พบข้อมูล fact-term-summary สำหรับเทอมที่ระบุ จึงถือว่ายังอยู่ระหว่างการศึกษา',
        ],
      };
    }

    const prevRef = this.getPreviousTerm(academicYear, term);
    const prev = await this.getTermSummary(
      studentId,
      prevRef.academicYear,
      prevRef.term
    );

    // 2) เตรียมค่าที่ต้องใช้
    const gpax = curr.gpax;
    const prevGpax = prev?.gpax ?? null;
    const creditAll = curr.creditAll;
    const coursePlanCreditAll = await this.getCoursePlanCreditAll(studentId);

    reasons.push(`GPAX ปัจจุบัน = ${gpax}`);
    if (prevGpax !== null) reasons.push(`GPAX เทอมก่อนหน้า = ${prevGpax}`);

    // 3) กฎส่วน GPAX ต่ำ
    if (gpax <= 1.75) {
      reasons.push('เงื่อนไขแรก: GPAX ≤ 1.75');
      const atRisk = (prevGpax !== null && prevGpax <= 1.75) || gpax <= 1.5;
      reasons.push(
        `ตรวจต่อ: (GPAX[-1] ≤ 1.75) || (GPAX ≤ 1.5) → ${atRisk ? 'จริง' : 'เท็จ'}`
      );
      if (atRisk) {
        const notFirstFirst = curr.studyYear !== 1 && curr.studyTerm !== 1;
        reasons.push(
          `ตรวจว่าไม่ใช่ปี 1 เทอม 1 → studyYear=${curr.studyYear}, studyTerm=${curr.studyTerm} → ${notFirstFirst ? 'จริง' : 'เท็จ'}`
        );
        if (notFirstFirst) {
          reasons.push('บันทึกสถานะ: พ้นสภาพนิสิต');
          return {
            studentId,
            academicYear,
            term,
            gpax,
            prevGpax,
            creditAll,
            coursePlanCreditAll,
            studyYear: curr.studyYear,
            studyTerm: curr.studyTerm,
            followPlan: null,
            studentStatus: 'พ้นสภาพนิสิต',
            reasons,
          };
        } else {
          reasons.push('บันทึกสถานะ: กำลังศึกษา (ยังเป็นปี 1 เทอม 1)');
          return {
            studentId,
            academicYear,
            term,
            gpax,
            prevGpax,
            creditAll,
            coursePlanCreditAll,
            studyYear: curr.studyYear,
            studyTerm: curr.studyTerm,
            followPlan: null,
            studentStatus: 'กำลังศึกษา',
            reasons,
          };
        }
      } else {
        reasons.push(
          'บันทึกสถานะ: กำลังศึกษา (แม้ GPAX ≤ 1.75 แต่ไม่เข้าเกณฑ์ตกซ้ำ/ต่ำกว่า 1.5)'
        );
        return {
          studentId,
          academicYear,
          term,
          gpax,
          prevGpax,
          creditAll,
          coursePlanCreditAll,
          studyYear: curr.studyYear,
          studyTerm: curr.studyTerm,
          followPlan: null,
          studentStatus: 'กำลังศึกษา',
          reasons,
        };
      }
    }

    // 4) กฎส่วน GPAX > 1.75 → ตรวจเครดิตสะสมตามแผน
    reasons.push(
      'เงื่อนไขแรก: GPAX > 1.75 → ไปตรวจเครดิตสะสมเทียบกับ course plan'
    );
    let hasEnoughCredit = false;
    if (creditAll !== null && coursePlanCreditAll !== null) {
      hasEnoughCredit = creditAll >= coursePlanCreditAll;
      reasons.push(
        `creditAll=${creditAll} เทียบ coursePlanCreditAll=${coursePlanCreditAll} → ${hasEnoughCredit ? 'ครบตามแผน/มากกว่า' : 'ยังไม่ครบตามแผน'}`
      );
    } else {
      reasons.push(
        'ไม่ทราบค่า creditAll หรือ coursePlanCreditAll (ข้อมูลไม่ครบ)'
      );
    }

    if (!hasEnoughCredit) {
      reasons.push('บันทึกสถานะ: กำลังศึกษา (หน่วยกิตสะสมยังไม่ถึงตามแผน)');
      return {
        studentId,
        academicYear,
        term,
        gpax,
        prevGpax,
        creditAll,
        coursePlanCreditAll,
        studyYear: curr.studyYear,
        studyTerm: curr.studyTerm,
        followPlan: null,
        studentStatus: 'กำลังศึกษา',
        reasons,
      };
    }

    // 5) เมื่อเครดิตถึง → เรียกตรวจ "ตามแผนไหม" (เพื่อนจะส่ง 0/1)
    const followPlan = await this.checkFollowPlan(
      studentId,
      academicYear,
      term
    );
    reasons.push(`ผลตรวจตามแผน (mock/db) = ${followPlan}`);

    if (followPlan === 1) {
      reasons.push('บันทึกสถานะ: จบการศึกษา');
      return {
        studentId,
        academicYear,
        term,
        gpax,
        prevGpax,
        creditAll,
        coursePlanCreditAll,
        studyYear: curr.studyYear,
        studyTerm: curr.studyTerm,
        followPlan,
        studentStatus: 'จบการศึกษา',
        reasons,
      };
    }

    reasons.push('บันทึกสถานะ: กำลังศึกษา (ยังไม่ผ่านเกณฑ์ตามแผน)');
    return {
      studentId,
      academicYear,
      term,
      gpax,
      prevGpax,
      creditAll,
      coursePlanCreditAll,
      studyYear: curr.studyYear,
      studyTerm: curr.studyTerm,
      followPlan,
      studentStatus: 'กำลังศึกษา',
      reasons,
    };
  }

  // ===== Utilities for tests/dev =====
  public setMockMode(on: boolean) {
    this.useMock = on;
  }

  public setMockTermSummaries(rows: TermSummaryRow[]) {
    this.ensureMockEnabled();
    this.mockTermSummaries = [...rows];
  }

  public setMockCoursePlanCredits(map: Record<string, number>) {
    this.ensureMockEnabled();
    this.mockCoursePlanCredits = { ...map };
  }

  public setMockFollowPlanFlag(map: Record<string, 0 | 1>) {
    this.ensureMockEnabled();
    this.mockFollowPlanFlag = { ...map };
  }
}
