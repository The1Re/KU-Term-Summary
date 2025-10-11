import { DatabaseService } from '@/core/database/database.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TermSummaryService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getTermSummary(studentId: number) {
    return this.databaseService.factTermSummary.findMany({
      where: { studentId },
      orderBy: [{ studyYear: 'desc' }, { studyTerm: 'desc' }],
    });
  }
}
