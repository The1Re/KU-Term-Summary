import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const gradeLabels: Prisma.GradeLabelCreateManyInput[] = [
  {
    gradeLabelId: 1,
    gpaStatusName: 'blue',
    gpaMinInStatus: 3.25,
    gpaStatusMax: 4,
    gpaxStatusName: 'เกียรตินิยม',
    gpaxStatusMin: 3.25,
    gpaxStatusMax: 4,
  },
  {
    gradeLabelId: 2,
    gpaStatusName: 'green',
    gpaMinInStatus: 2,
    gpaStatusMax: 3.2499,
    gpaxStatusName: 'ปกติ',
    gpaxStatusMin: 1.76,
    gpaxStatusMax: 3.24,
  },
  {
    gradeLabelId: 3,
    gpaStatusName: 'orange',
    gpaMinInStatus: 1.75,
    gpaStatusMax: 1.9999,
    gpaxStatusName: 'รอพินิจ',
    gpaxStatusMin: 1.51,
    gpaxStatusMax: 1.75,
  },
  {
    gradeLabelId: 4,
    gpaStatusName: 'red',
    gpaMinInStatus: 0,
    gpaStatusMax: 1.7499,
    gpaxStatusName: 'โปรต่ำ',
    gpaxStatusMin: 0,
    gpaxStatusMax: 1.5,
  },
];

const subjectCategories: Prisma.SubjectCaterogyCreateManyInput[] = [
  {
    subjectCaterogyId: 1,
    subjectCategoryName: 'หมวดวิชาศึกษาทั่วไป',
    subjectGroupName: 'กลุ่มสาระอยู่ดีมีสุข',
  },
  {
    subjectCaterogyId: 2,
    subjectCategoryName: 'หมวดวิชาศึกษาทั่วไป',
    subjectGroupName: 'กลุ่มสาระศาสตร์แห่งผู้ประกอบการ',
  },
  {
    subjectCaterogyId: 3,
    subjectCategoryName: 'หมวดวิชาศึกษาทั่วไป',
    subjectGroupName: 'กลุ่มสาระภาษากับการสื่อสาร',
  },
  {
    subjectCaterogyId: 4,
    subjectCategoryName: 'หมวดวิชาศึกษาทั่วไป',
    subjectGroupName: 'กลุ่มสาระพลเมืองไทยและพลเมืองโลก',
  },
  {
    subjectCaterogyId: 5,
    subjectCategoryName: 'หมวดวิชาศึกษาทั่วไป',
    subjectGroupName: 'กลุ่มสาระสุนทรียศาสตร์',
  },
  {
    subjectCaterogyId: 6,
    subjectCategoryName: 'หมวดวิชาเลือกเสรี',
    subjectGroupName: 'วิชาเลือกเสรี',
  },
  {
    subjectCaterogyId: 7,
    subjectCategoryName: 'หมวดวิชาเฉพาะ',
    subjectGroupName: 'วิชาเลือก',
  },
  {
    subjectCaterogyId: 8,
    subjectCategoryName: 'หมวดวิชาเฉพาะ',
    subjectGroupName: 'วิชาแกน',
  },
  {
    subjectCaterogyId: 9,
    subjectCategoryName: 'หมวดวิชาเฉพาะ',
    subjectGroupName: 'วิชาเฉพาะด้าน',
  },
];

const courses: Prisma.CourseCreateManyInput[] = [
  {
    courseId: 1,
    nameCourseTh: 'หลักสูตรวิศวกรรมศาสตรบัณฑิต สาขาวิชาวิศวกรรมคอมพิวเตอร์',
    nameCourseUse: 'วศ.คอม 65',
  },
  {
    courseId: 2,
    nameCourseTh: 'หลักสูตรวิศวกรรมศาสตรบัณฑิต สาขาวิชาวิศวกรรมโยธา',
    nameCourseUse: 'วศ.โยธา 65',
  },
];

const coursePlans: Prisma.CoursePlanCreateManyInput[] = [
  {
    coursePlanId: 1,
    courseId: 1,
    planCourse: 'แผนสหกิจศึกษา',
    totalCredit: 134,
    generalSubjectCredit: 30,
    specificSubjectCredit: 98,
    freeSubjectCredit: 6,
    coreSubjectCredit: 30,
    spacailSubjectCredit: 49,
    selectSubjectCredit: 19,
    happySubjectCredit: 3,
    entrepreneurshipSubjectCredit: 6,
    languageSubjectCredit: 13,
    peopleSubjectCredit: 5,
    aestheticsSubjectCredit: 3,
    internshipHours: 240,
  },
  {
    coursePlanId: 2,
    courseId: 1,
    planCourse: 'แผนไม่สหกิจศึกษา',
    totalCredit: 134,
    generalSubjectCredit: 30,
    specificSubjectCredit: 98,
    freeSubjectCredit: 6,
    coreSubjectCredit: 30,
    spacailSubjectCredit: 49,
    selectSubjectCredit: 19,
    happySubjectCredit: 3,
    entrepreneurshipSubjectCredit: 6,
    languageSubjectCredit: 13,
    peopleSubjectCredit: 5,
    aestheticsSubjectCredit: 3,
    internshipHours: 0,
  },
];

const subjects: Prisma.SubjectCreateManyInput[] = [
  {
    subjectId: 1,
    courseId: 1,
    subjectCaterogyId: 8,
    subjectCode: '01417167',
    nameSubjectThai: 'คณิตศาสตร์วิศวกรรม I',
    credit: 3,
  },
  {
    subjectId: 2,
    courseId: 1,
    subjectCaterogyId: 8,
    subjectCode: '01420111',
    nameSubjectThai: 'ฟิสิกส์ทั่วไป I',
    credit: 3,
  },
  {
    subjectId: 3,
    courseId: 1,
    subjectCaterogyId: 8,
    subjectCode: '01420113',
    nameSubjectThai: 'ปฎิบัติการฟิสิกส์ I',
    credit: 1,
  },
  {
    subjectId: 4,
    courseId: 1,
    subjectCaterogyId: 4,
    subjectCode: '01999111',
    nameSubjectThai: 'ศาสตร์แห่งแผ่นดิน',
    credit: 2,
  },
  {
    subjectId: 5,
    courseId: 1,
    subjectCaterogyId: 8,
    subjectCode: '02204171',
    nameSubjectThai: 'การเขียนโปรแกรมเชิงโครงสร้าง',
    credit: 3,
  },
  {
    subjectId: 6,
    courseId: 1,
    subjectCaterogyId: 3,
    subjectCode: '1355101',
    nameSubjectThai: 'ภาษาอังกฤษในชีวิตประจำวัน',
    credit: 3,
  },
  {
    subjectId: 7,
    courseId: 1,
    subjectCaterogyId: 3,
    subjectCode: '1999021',
    nameSubjectThai: 'ภาษาไทยเพื่อการสื่อสาร',
    credit: 3,
  },
];

const subjectCourses: Prisma.SubjectCourseCreateManyInput[] = [
  { subjectCourseId: 1, subjectId: 1, coursePlanId: 1 },
  { subjectCourseId: 2, subjectId: 2, coursePlanId: 1 },
  { subjectCourseId: 3, subjectId: 3, coursePlanId: 1 },
  { subjectCourseId: 4, subjectId: 4, coursePlanId: 1 },
  { subjectCourseId: 5, subjectId: 5, coursePlanId: 1 },
  { subjectCourseId: 6, subjectId: 6, coursePlanId: 1 },
  { subjectCourseId: 7, subjectId: 7, coursePlanId: 1 },
];

const subjectCredits: Prisma.SubjectCreditCreateManyInput[] = [
  { subjectCreditId: 1, subjectId: 1, lectureCredit: 3, labCredit: 0 },
  { subjectCreditId: 2, subjectId: 2, lectureCredit: 3, labCredit: 0 },
  { subjectCreditId: 3, subjectId: 3, lectureCredit: 0, labCredit: 3 },
  { subjectCreditId: 4, subjectId: 4, lectureCredit: 2, labCredit: 0 },
  { subjectCreditId: 5, subjectId: 5, lectureCredit: 2, labCredit: 3 },
  { subjectCreditId: 6, subjectId: 6, lectureCredit: 3, labCredit: 0 },
  { subjectCreditId: 7, subjectId: 7, lectureCredit: 3, labCredit: 0 },
];

const studentStatuses: Prisma.StudentStatusCreateManyInput[] = [
  { studentStatusId: 1, status: 'กำลังศึกษา' },
  { studentStatusId: 2, status: 'พ้นสภาพ' },
  { studentStatusId: 3, status: 'จบการศึกษา' },
];

const students: Prisma.StudentCreateManyInput[] = [
  {
    studentId: 1,
    studentUsername: 'b6520501026',
    studentStatusId: 1,
    coursePlanId: 1,
  },
  {
    studentId: 2,
    studentUsername: 'b6520501034',
    studentStatusId: 1,
    coursePlanId: 1,
  },
];

const creditRequires: Prisma.CreditRequireCreateManyInput[] = [
  { creditRequireId: 1, coursePlanId: 1, subjectCaterogyId: 1, credit: 3 },
  { creditRequireId: 2, coursePlanId: 1, subjectCaterogyId: 2, credit: 6 },
  { creditRequireId: 3, coursePlanId: 1, subjectCaterogyId: 3, credit: 13 },
  { creditRequireId: 4, coursePlanId: 1, subjectCaterogyId: 4, credit: 5 },
  { creditRequireId: 5, coursePlanId: 1, subjectCaterogyId: 5, credit: 3 },
  { creditRequireId: 6, coursePlanId: 1, subjectCaterogyId: 6, credit: 6 },
  { creditRequireId: 7, coursePlanId: 1, subjectCaterogyId: 7, credit: 19 },
  { creditRequireId: 8, coursePlanId: 1, subjectCaterogyId: 8, credit: 30 },
  { creditRequireId: 9, coursePlanId: 1, subjectCaterogyId: 9, credit: 49 },
];

const factRegisters: Prisma.FactRegisterCreateManyInput[] = [
  {
    registerId: 1,
    studentId: 1,
    creditRequireId: 4,
    subjectCourseId: 4,
    semester: 2565,
    semesterPartInRegis: 'ภาคต้น',
    gradeNumber: null,
    gradeCharacter: null,
    gradeLabelId: null,
  },
  {
    registerId: 2,
    studentId: 1,
    creditRequireId: 8,
    subjectCourseId: 1,
    semester: 2565,
    semesterPartInRegis: 'ภาคต้น',
    gradeNumber: null,
    gradeCharacter: null,
    gradeLabelId: null,
  },
  {
    registerId: 3,
    studentId: 1,
    creditRequireId: 8,
    subjectCourseId: 2,
    semester: 2565,
    semesterPartInRegis: 'ภาคต้น',
    gradeNumber: null,
    gradeCharacter: null,
    gradeLabelId: null,
  },
  {
    registerId: 4,
    studentId: 1,
    creditRequireId: 8,
    subjectCourseId: 3,
    semester: 2565,
    semesterPartInRegis: 'ภาคต้น',
    gradeNumber: null,
    gradeCharacter: null,
    gradeLabelId: null,
  },
  {
    registerId: 5,
    studentId: 1,
    creditRequireId: 8,
    subjectCourseId: 5,
    semester: 2565,
    semesterPartInRegis: 'ภาคต้น',
    gradeNumber: null,
    gradeCharacter: null,
    gradeLabelId: null,
  },
  {
    registerId: 6,
    studentId: 1,
    creditRequireId: 3,
    subjectCourseId: 6,
    semester: 2565,
    semesterPartInRegis: 'ภาคต้น',
    gradeNumber: null,
    gradeCharacter: null,
    gradeLabelId: null,
  },
  {
    registerId: 7,
    studentId: 1,
    creditRequireId: 3,
    subjectCourseId: 7,
    semester: 2565,
    semesterPartInRegis: 'ภาคต้น',
    gradeNumber: null,
    gradeCharacter: null,
    gradeLabelId: null,
  },
];

async function clearDatabase() {
  console.log('Clearing existing data...');
  await prisma.factRegister.deleteMany();
  await prisma.factStdPlan.deleteMany();
  await prisma.factTermSummary.deleteMany();
  await prisma.subjectCredit.deleteMany();
  await prisma.subjectCourse.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.creditRequire.deleteMany();
  await prisma.student.deleteMany();
  await prisma.studentStatus.deleteMany();
  await prisma.coursePlan.deleteMany();
  await prisma.course.deleteMany();
  await prisma.gradeLabel.deleteMany();
  await prisma.subjectCaterogy.deleteMany();
}

async function seedDatabase() {
  console.log('Seeding reference data...');
  await prisma.subjectCaterogy.createMany({ data: subjectCategories });
  await prisma.gradeLabel.createMany({ data: gradeLabels });
  await prisma.course.createMany({ data: courses });
  await prisma.coursePlan.createMany({ data: coursePlans });
  await prisma.subject.createMany({ data: subjects });
  await prisma.subjectCourse.createMany({ data: subjectCourses });
  await prisma.subjectCredit.createMany({ data: subjectCredits });
  await prisma.studentStatus.createMany({ data: studentStatuses });
  await prisma.student.createMany({ data: students });
  await prisma.creditRequire.createMany({ data: creditRequires });
  await prisma.factRegister.createMany({ data: factRegisters });
}

async function main() {
  await clearDatabase();
  await seedDatabase();
  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async e => {
    console.error('Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
