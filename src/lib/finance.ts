import yahooFinance from "yahoo-finance2";

// ดึงข้อมูล quote summary
export async function fetchQuoteSummary(symbol: string): Promise<{
  price: number;
  forwardDividend: number;
  earningsPerShare: number;
  peRatio: number;
}> {
  try {
    const quote = await yahooFinance.quoteSummary(symbol, {
      modules: [
        "price",
        "summaryDetail",
        "defaultKeyStatistics",
        "financialData",
      ],
    });

    return {
      price: quote.price?.regularMarketPrice || 0,
      forwardDividend: quote.summaryDetail?.dividendRate || 0,
      earningsPerShare: quote.defaultKeyStatistics?.forwardEps || 0,
      peRatio: quote.summaryDetail?.forwardPE || 0,
    };
  } catch (error) {
    console.error("fetchQuoteSummary error:", error);
    return { price: 0, forwardDividend: 0, earningsPerShare: 0, peRatio: 0 };
  }
}

// 🧮 Gordon Growth Model (คำนวณ Growth Rate จาก PE)
export function estimateGrowthRateFromGordonModel({
  dividendYield,
  peRatio,
}: {
  dividendYield: number;
  peRatio: number;
}): number {
  // g = r - D/P, where r = E/P = 1/PE
  if (peRatio <= 0 || dividendYield <= 0) return 0;
  const r = 1 / peRatio;
  return r - dividendYield;
}

// ✅ ใช้ใน DDM page:
// const g = estimateGrowthRateFromGordonModel({ dividendYield: dividend / price, peRatio })
