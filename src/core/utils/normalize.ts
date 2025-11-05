export function normalizeSummerYear(year: number, term: number) {
  return term === 3 ? year - 2 : year;
}
