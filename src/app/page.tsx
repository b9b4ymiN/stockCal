"use client";
import { useState, useRef } from "react";
import { calculateDCF, DCFResult, WACCInput } from "../lib/dcf";
import { formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { Header } from "@/components/ui/header";
import WACCForm from "@/components/WACCForm";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, CartesianGrid, XAxis, LabelList } from "recharts";
import { json } from "stream/consumers";
import { toast } from "sonner";
import { CalculatorIcon } from "lucide-react";

export default function Home() {
  const [symbol, setSymbol] = useState("");
  const [fcf, setFcf] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [growthRate, setGrowthRate] = useState(0.1);
  const [wacc, setWacc] = useState(0.09);
  const [terminalGrowthRate, setTerminalGrowthRate] = useState(0.03);
  const [shares, setShares] = useState(0);
  const [result, setResult] = useState<DCFResult | null>(null);
  const [data4WACC, setData4WACC] = useState<WACCInput>();
  const ref = useRef(null);

  const fetchData = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/stock-data?symbol=${symbol}`);
    const json = await res.json();

    console.log("json data :", json);
    if ((json && json.error) || json.data.financialData.freeCashflow === 0) {
      setFcf(0);
      toast.error("Warning message", {
        description: `${symbol} : don't found informations.Please try again`,
      });
    } else if (json && json.data.financialData.freeCashflow < 0) {
      setFcf(json.data.financialData.freeCashflow);
      toast.warning("Warning message", {
        description: `${symbol} : free cash flow is negative. Can't calculate DCF`,
      });
    } else {
      setCurrentPrice(json.data.financialData.currentPrice);
      setFcf(json.data.financialData.freeCashflow);
      setShares(json.data.defaultKeyStatistics.sharesOutstanding);
      setData4WACC(json.data4WACC);
    }
  };

  const runDCF = () => {
    const dcf = calculateDCF({
      fcf,
      growthRate,
      wacc,
      terminalGrowthRate,
      sharesOutstanding: shares,
    });
    setResult(dcf);
  };

  const exportPDF = async () => {
    if (ref.current) {
      const canvas = await html2canvas(ref.current, {
        backgroundColor: "#ffffff", // Important to avoid "oklch" color error
        useCORS: true,
        scale: 2,
        logging: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${symbol}-dcf-report.pdf`);
    }
  };

  const chartConfig = {
    year: {
      label: "year",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  return (
    <main className="max-w-3xl mx-auto py-10 px-4 space-y-6">
      <Header />
      <Card>
        <CardHeader>
          <CardTitle>
            <b>DCF Valuation</b>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={fetchData} className="space-y-4">
            <Label>Stock Symbol</Label>
            <Input
              className="text-sm"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="e.g., AAPL or AP.BK (include .BK for thai stock)"
            />
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>

      {fcf > 0 && (
        <>
          <WACCForm onChange={(e) => setWacc(Number(e))} data={data4WACC} />
          <Card>
            <CardHeader>
              <CardTitle>Assumptions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label>Free Cash Flow</Label>
                <Input
                  type="number"
                  value={fcf}
                  onChange={(e) => setFcf(Number(e.target.value))}
                />
              </div>
              <div>
                <Label>Growth Rate</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={growthRate}
                  onChange={(e) => setGrowthRate(Number(e.target.value))}
                />
              </div>
              <div>
                <Label>WACC</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={wacc}
                  onChange={(e) => setWacc(Number(e.target.value))}
                />
              </div>
              <div>
                <Label>Terminal Growth Rate</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={terminalGrowthRate}
                  onChange={(e) =>
                    setTerminalGrowthRate(Number(e.target.value))
                  }
                />
              </div>
              <div className="col-span-2">
                <span className="text-xs text-gray-500">
                  Remark : Growth & WACC (%) must divide with 100.{" "}
                </span>
              </div>
              <Button onClick={runDCF} className="col-span-2">
                Run DCF
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {fcf > 0 && result && (
        <div ref={ref} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>DCF Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                <li>
                  NPV of 5-Year FCF:{" "}
                  <strong>{formatCurrency(result.npv)}</strong>
                </li>
                <li>
                  Terminal Value:{" "}
                  <strong>{formatCurrency(result.terminalValue)}</strong>
                </li>
                <li>
                  Discounted Terminal Value:{" "}
                  <strong>
                    {formatCurrency(result.discountedTerminalValue)}
                  </strong>
                </li>
                <li>
                  Enterprise Value:{" "}
                  <strong>{formatCurrency(result.enterpriseValue)}</strong>
                </li>
                <li className="mb-2">
                  Fair Value Per Share:{" "}
                  <strong className="text-chart-3">
                    {formatCurrency(result.equityValuePerShare)}
                  </strong>
                </li>
                <hr />
                <li className="mt-2">
                  Current Price:{" "}
                  <strong className="text-chart-1">
                    {formatCurrency(currentPrice)}
                  </strong>
                </li>

                <li>
                  Up/Down Side:{" "}
                  <strong
                    className={
                      currentPrice < result.equityValuePerShare
                        ? "text-chart-2"
                        : "text-destructive"
                    }
                  >
                    {(
                      ((result.equityValuePerShare - currentPrice) /
                        currentPrice) *
                      100
                    ).toFixed(2) + "%"}
                  </strong>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>FCF Projection</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <BarChart accessibilityLayer data={result.yearlyChartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="year"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar dataKey="data" fill="var(--chart-1)" radius={8}>
                    <LabelList
                      position="top"
                      offset={5}
                      className="fill-foreground"
                      fontSize={8}
                      formatter={(value: any) => formatCurrency(value)}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button onClick={exportPDF}>Export PDF</Button>
          </div>
        </div>
      )}
      {fcf <= 0 && (
        <div className="flex justify-center mt-6 align-middle">
          <div className="text-center">
            <CalculatorIcon height={256} width={256} />
            <span className="text-center mt-2">DCF Calculator</span>
          </div>
        </div>
      )}
    </main>
  );
}
