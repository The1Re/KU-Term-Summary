import { Test, TestingModule } from '@nestjs/testing';
import { RegisterService } from '../register.service';
import { DatabaseService } from '@/core/database/database.service';
import { FactRegister } from '@prisma/client';

describe('Register Service', () => {
  let registerService: RegisterService;
  let databaseService: jest.Mocked<DatabaseService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterService,
        {
          provide: DatabaseService,
          useValue: {
            factRegister: {
              findMany: jest.fn(() => Promise.resolve([])),
            },
          },
        },
      ],
    }).compile();

    registerService = module.get<RegisterService>(RegisterService);
    databaseService = module.get(DatabaseService);
  });

  describe('getAllRegistersByStudentId', () => {
    const studentId = '6520501234';
    const mockRegisters: FactRegister[] = [
      {
        studentId: '6520501234',
        subjectCourseId: 10,
        regisId: 1,
        creditRequireId: 1,
        creditRegis: 3,
        gradeNumber: 4,
        gradeCharacter: 'A',
        gradeLabelId: 1,
        studyYearInRegis: 1,
        studyTermInRegis: 1,
        semesterYearInRegis: 2568,
        semesterPartInRegis: 'ภาคต้น',
      },
      {
        studentId: '6520501234',
        subjectCourseId: 11,
        regisId: 2,
        creditRequireId: 1,
        creditRegis: 4,
        gradeNumber: 0,
        gradeCharacter: 'F',
        gradeLabelId: 4,
        studyYearInRegis: 1,
        studyTermInRegis: 1,
        semesterYearInRegis: 2568,
        semesterPartInRegis: 'ภาคต้น',
      },
      {
        studentId: '6520501234',
        subjectCourseId: 11,
        regisId: 3,
        creditRequireId: 1,
        creditRegis: 3,
        gradeNumber: 2,
        gradeCharacter: 'C',
        gradeLabelId: 3,
        studyYearInRegis: 1,
        studyTermInRegis: 2,
        semesterYearInRegis: 2568,
        semesterPartInRegis: 'ภาคปลาย',
      },
    ];

    it('should return an array of registers', async () => {
      (databaseService.factRegister.findMany as jest.Mock).mockResolvedValue(
        mockRegisters
      );

      const result =
        await registerService.getAllRegistersByStudentId(studentId);

      expect(databaseService.factRegister.findMany).toHaveBeenCalledWith({
        where: { studentId: studentId },
        orderBy: [{ studyYearInRegis: 'asc' }],
      });
      expect(result).toEqual(mockRegisters);
    });

    it('should apply whereClause if provided', async () => {
      const mockRegisters = [
        {
          id: 1,
          studentId: '6520501234',
          studyYearInRegis: 1,
          gradeCharacter: 'A',
        },
      ];
      const whereClause = { gradeCharacter: 'A' };
      (databaseService.factRegister.findMany as jest.Mock).mockResolvedValue(
        mockRegisters
      );

      const result = await registerService.getAllRegistersByStudentId(
        studentId,
        whereClause
      );

      expect(databaseService.factRegister.findMany).toHaveBeenCalledWith({
        where: { studentId: studentId, ...whereClause },
        orderBy: [{ studyYearInRegis: 'asc' }],
      });
      expect(result).toEqual(mockRegisters);
    });
  });
});
