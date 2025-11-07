export function normalizeSummerYear(year: number, term: number) {
  /**
   * NOTE:
   * fact_register raw data has a known data quality issue:
   * - If the student studied in summer, some rows store the year incorrectly (+2 years)
   *
   * So if term === 3 (summer), we normalize the year by subtracting 2.
   *
   * If the raw data is already fixed → you can switch this to:
   *   term === 3 ? year : year
   * or simply return year directly
   * or consider removing this function entirely.
   */

  return term === 3 ? year : year;
}
