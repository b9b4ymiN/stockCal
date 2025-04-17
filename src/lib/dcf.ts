export type DCFInput = {
  fcf: number;
  growthRate: number;
  wacc: number;
  terminalGrowthRate: number;
  sharesOutstanding: number;
};

export type WACCInput = {
  equityValue: number;
  totalDebt: number;
  interestExpense: number;
  incomeBeforeTax: number;
  incomeTax: number;
  beta: number;
  stockholdersEquity: number;
};

export type DCFResult = {
  npv: number;
  terminalValue: number;
  discountedTerminalValue: number;
  enterpriseValue: number;
  equityValuePerShare: number;
  yearlyFCF: number[];
  yearlyChartData: Fcfchart[];
};

export type Fcfchart = {
  year: string;
  data: number;
};

export function calculateDCF(input: DCFInput): DCFResult {
  const { fcf, growthRate, wacc, terminalGrowthRate, sharesOutstanding } =
    input;

  let npv = 0;
  let projectedFCF = fcf;
  const yearlyFCF: number[] = [];
  const yearlyChartData: Fcfchart[] = [];

  for (let year = 1; year <= 5; year++) {
    projectedFCF *= 1 + growthRate;
    yearlyFCF.push(projectedFCF);
    yearlyChartData.push({ year: `Year ${year}`, data: projectedFCF });
    npv += projectedFCF / Math.pow(1 + wacc, year);
  }

  const terminalValue =
    (projectedFCF * (1 + terminalGrowthRate)) / (wacc - terminalGrowthRate);
  const discountedTerminalValue = terminalValue / Math.pow(1 + wacc, 5);

  const enterpriseValue = npv + discountedTerminalValue;
  const equityValuePerShare = enterpriseValue / sharesOutstanding;

  return {
    npv,
    terminalValue,
    discountedTerminalValue,
    enterpriseValue,
    equityValuePerShare,
    yearlyFCF,
    yearlyChartData,
  };
}
