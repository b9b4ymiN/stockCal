import type { NextApiRequest, NextApiResponse } from "next";
import yahooFinance from "yahoo-finance2";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { symbol } = req.query;
  if (typeof symbol !== "string")
    return res.status(400).json({ error: "Invalid symbol" });

  try {
    const quoteSummary = await yahooFinance.quoteSummary(symbol, {
      modules: ["financialData", "defaultKeyStatistics"],
    });

    res.status(200).json({ data: quoteSummary });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stock data" });
  }
}
