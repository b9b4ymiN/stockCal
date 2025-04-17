// app/api/stock-data/route.ts
import { NextRequest, NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");
  if (!symbol)
    return NextResponse.json({ error: "Invalid symbol" }, { status: 400 });

  try {
    const quoteSummary = await yahooFinance.quoteSummary(symbol, {
      modules: ["financialData", "defaultKeyStatistics"],
    });

    const queryOptions = {
      period1: "2024-11-01",
      module: "all",
      type: "quarterly",
    };
    const fundamentals = await yahooFinance.fundamentalsTimeSeries(
      symbol,
      queryOptions
    );
    const last_fundamentals: any = fundamentals
      ? (fundamentals as unknown as any[])[0]
      : null;
    //console.log("fundamentals : ", fundamentals);

    const equityValue = quoteSummary.defaultKeyStatistics?.enterpriseValue || 0;
    //longTermDebt

    const stockholdersEquity = last_fundamentals.stockholdersEquity
      ? last_fundamentals.stockholdersEquity
      : 0;

    const totalDebt = last_fundamentals.longTermDebt
      ? last_fundamentals.longTermDebt
      : 0;

    const interestExpense = last_fundamentals.interestExpense
      ? last_fundamentals.interestExpense
      : 0;

    const incomeBeforeTax = last_fundamentals.pretaxIncome
      ? last_fundamentals.pretaxIncome
      : 0;
    const incomeTax = 0.2;
    const beta = quoteSummary.defaultKeyStatistics?.beta || 1;

    //pretaxIncome

    return NextResponse.json({
      data: quoteSummary,
      data4WACC: {
        equityValue,
        totalDebt,
        interestExpense,
        incomeBeforeTax,
        incomeTax,
        beta,
        stockholdersEquity,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch stock data" },
      { status: 500 }
    );
  }
}
