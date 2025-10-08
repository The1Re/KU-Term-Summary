import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '@/core/database/database.service';
import { StudentService } from '@/modules/student/student.service';
import { NotFoundException } from '@nestjs/common';
import { FactRegister } from '@prisma/client';
import { RegisterUsecase } from '../register.usecase';

describe('RegisterUsecase', () => {
  let registerUsecase: RegisterUsecase;
  let databaseService: DatabaseService;
  let studentService: StudentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUsecase,
        {
          provide: DatabaseService,
          useValue: {
            factRegister: {
              findFirst: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
        {
          provide: StudentService,
          useValue: {
            getStudentById: jest.fn(),
          },
        },
      ],
    }).compile();

    registerUsecase = module.get<RegisterUsecase>(RegisterUsecase);
    databaseService = module.get<DatabaseService>(DatabaseService);
    studentService = module.get<StudentService>(StudentService);
  });

  describe('getGpa', () => {
    it('should correctly calculate GPA for the latest term', async () => {
      const studentId = '6520503461';

      (studentService.getStudentById as jest.Mock).mockResolvedValue({
        studentId,
      });
      (databaseService.factRegister.findFirst as jest.Mock).mockResolvedValue({
        studyYearInRegis: 2024,
        studyTermInRegis: 1,
      });
      (databaseService.factRegister.findMany as jest.Mock).mockResolvedValue([
        { gradeNumber: 4, creditRegis: 3, gradeCharacter: 'A' },
        { gradeNumber: 3, creditRegis: 3, gradeCharacter: 'B+' },
      ] as FactRegister[]);

      const result = await registerUsecase.getGpa(studentId);

      expect(result).toEqual({ gpa: 3.5 });
    });

    it('should throw NotFoundException if student not found', async () => {
      (studentService.getStudentById as jest.Mock).mockResolvedValue(null);

      await expect(registerUsecase.getGpa('6520503461')).rejects.toThrow(
        NotFoundException
      );
    });

    it('should return GPA = 0 if no register records found for latest term', async () => {
      (studentService.getStudentById as jest.Mock).mockResolvedValue({
        studentId: '6520503461',
      });
      (databaseService.factRegister.findFirst as jest.Mock).mockResolvedValue({
        studyYearInRegis: 2024,
        studyTermInRegis: 1,
      });
      (databaseService.factRegister.findMany as jest.Mock).mockResolvedValue(
        []
      );

      const result = await registerUsecase.getGpa('123');
      expect(result).toEqual({ gpa: 0 });
    });
  });

  describe('getGpax', () => {
    it('should correctly calculate cumulative GPAX', async () => {
      const studentId = '6520503461';

      (studentService.getStudentById as jest.Mock).mockResolvedValue({
        studentId,
      });
      (databaseService.factRegister.findMany as jest.Mock).mockResolvedValue([
        { gradeNumber: 4, creditRegis: 3, gradeCharacter: 'A' },
        { gradeNumber: 3, creditRegis: 3, gradeCharacter: 'B+' },
      ] as FactRegister[]);

      const result = await registerUsecase.getGpax(studentId);

      expect(result).toEqual({ gpax: 3.5 });
    });

    it('should throw NotFoundException if student not found', async () => {
      (studentService.getStudentById as jest.Mock).mockResolvedValue(null);

      await expect(registerUsecase.getGpax('6520503461')).rejects.toThrow(
        NotFoundException
      );
    });

    it('should return GPAX = 0 if no register data found', async () => {
      const studentId = '6502503461';
      (studentService.getStudentById as jest.Mock).mockResolvedValue({
        studentId,
      });
      (databaseService.factRegister.findMany as jest.Mock).mockResolvedValue(
        []
      );

      const result = await registerUsecase.getGpax(studentId);
      expect(result).toEqual({ gpax: 0 });
    });
  });
});
