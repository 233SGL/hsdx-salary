
import { MonthlyData, CalculationResult } from '../types';

export const getWorkingDays = (year: number, month: number): number => {
  const daysInMonth = new Date(year, month, 0).getDate();
  let workingDays = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const dayOfWeek = new Date(year, month - 1, d).getDay();
    // 0 is Sunday. If not Sunday, it's a working day.
    if (dayOfWeek !== 0) {
      workingDays++;
    }
  }
  return workingDays;
};

export const calculateSalary = (data: MonthlyData): CalculationResult => {
  const { area, unitPrice, attendancePack, kpiScore, weightTime, weightBase } = data.params;

  // 1. Calculate Total Pool
  const totalPool = (area * unitPrice) + attendancePack + kpiScore;

  let sumWorkHours = 0;
  let sumExpectedHours = 0;
  let sumStandardBase = 0;
  let sumRealBase = 0;

  // 2. First Pass: Calculate Real Base and Sums (filter out terminated employees)
  const preCalcRecords = data.records
    .filter(record => {
      // Skip if employeeId ends with '-terminated' or employeeName indicates terminated status
      return !record.employeeId.includes('-terminated');
    })
    .map(record => {
      const { workHours, expectedHours, baseScoreSnapshot } = record;

      // Safety check for divide by zero
      const attendanceRatio = expectedHours > 0 ? workHours / expectedHours : 0;
      const realBase = baseScoreSnapshot * attendanceRatio;

      sumWorkHours += workHours;
      sumExpectedHours += expectedHours;
      sumStandardBase += baseScoreSnapshot;
      sumRealBase += realBase;

      return {
        ...record,
        realBase,
      };
    });

  // 3. Calculate Bonus Pool
  const bonusPool = Math.max(0, totalPool - sumRealBase);

  // 4. Second Pass: Calculate Weights and Final Scores
  const wTime = weightTime / 100;
  const wBase = weightBase / 100;

  const finalRecords = preCalcRecords.map(record => {
    // Work Ratio: My Work / Total Work
    const workRatio = sumWorkHours > 0 ? record.workHours / sumWorkHours : 0;

    // Base Ratio: My Real Base / Total Real Base
    const baseRatio = sumRealBase > 0 ? record.realBase / sumRealBase : 0;

    // Composite Weight
    const compositeWeight = (workRatio * wTime) + (baseRatio * wBase);

    // Bonus Allocation
    const bonus = bonusPool * compositeWeight;

    // Final Score
    const finalScore = record.realBase + bonus;

    return {
      ...record,
      workRatio,
      baseRatio,
      compositeWeight,
      bonus,
      finalScore
    };
  });

  return {
    records: finalRecords,
    totalPool,
    totalBasePayout: sumRealBase,
    bonusPool,
    sumWorkHours,
    sumExpectedHours,
    sumStandardBase
  };
};
