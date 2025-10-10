export const calculateGPA = (grades: { grade: number; credit: number }[]) => {
  const totalPoints = grades.reduce(
    (acc, { grade, credit }) => acc + grade * credit,
    0
  );
  const totalCredits = grades.reduce((acc, { credit }) => acc + credit, 0);
  return totalCredits > 0 ? totalPoints / totalCredits : 0;
};
