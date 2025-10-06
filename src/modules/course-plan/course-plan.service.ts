import { DatabaseService } from '@/core/database/database.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CoursePlanService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getCoursePlanById(coursePlanId: number) {
    return this.databaseService.coursePlan.findUnique({
      where: { coursePlanId: coursePlanId },
    });
  }
}
