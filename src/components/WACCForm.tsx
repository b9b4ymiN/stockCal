"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { WACCInput } from "@/lib/dcf";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { formatCurrency } from "@/lib/utils";

type Props = {
  data: WACCInput | undefined;
  onChange: (wacc: number) => void;
};

export default function WACCForm({ data, onChange }: Props) {
  /*
  สัญลักษณ์    | ความหมาย                                                  | ค่าที่ใช้ในสูตรของคุณ
  Rf          | อัตราผลตอบแทนของสินทรัพย์ปลอดความเสี่ยง (Risk-free rate)      | 0.04 (หรือ 4%)
  β (Beta)    | ความเสี่ยงของหุ้นเทียบกับตลาด                                  | ดึงจาก yahoo-finance2
  Rm          | อัตราผลตอบแทนคาดหวังของตลาด (Expected Market Return)      | 0.10 (หรือ 10%)
  */
  const init_costOfEquity = 0.04 + (data ? data?.beta : 1) * (0.1 - 0.04);
  const totalCapital = data ? data.stockholdersEquity + data.totalDebt : 0;
  const init_costOfDebt = data
    ? (data.interestExpense / data.totalDebt) * 100
    : 0.05;
  const init_equityWeight = data ? data.stockholdersEquity / totalCapital : 0.7;
  const init_debtWeight = data ? data.totalDebt / totalCapital : 0.3;

  const [costOfEquity, setCostOfEquity] = useState(init_costOfEquity);
  const [costOfDebt, setCostOfDebt] = useState(init_costOfDebt);
  const [equityWeight, setEquityWeight] = useState(init_equityWeight);
  const [debtWeight, setDebtWeight] = useState(init_debtWeight);
  const [taxRate, setTaxRate] = useState(0.2);
  const [wacc, setWacc] = useState(0);

  const calculateWACC = () => {
    const wacc =
      costOfEquity * equityWeight + costOfDebt * (1 - taxRate) * debtWeight;
    onChange(wacc);
    setWacc(wacc);
  };

  // autofill จาก props เมื่อ data เปลี่ยน
  useEffect(() => {
    const totalCapital = data ? data.stockholdersEquity + data.totalDebt : 0;
    setCostOfEquity(0.04 + (data ? data?.beta : 1) * (0.1 - 0.04));
    setCostOfDebt(data ? (data.interestExpense / data.totalDebt) * 100 : 0.05);
    setEquityWeight(data ? data.stockholdersEquity / totalCapital : 0.7);
    setDebtWeight(data ? data.totalDebt / totalCapital : 0.3);
  }, [data]);

  // คำนวณแบบ reactive เมื่อมีการเปลี่ยน data
  const result = useMemo(() => {
    const riskFreeRate = 0.04;
    const marketReturn = 0.1;

    setCostOfEquity(
      riskFreeRate + (data ? data?.beta : 1) * (marketReturn - riskFreeRate)
    );
    setCostOfDebt(data ? (data.interestExpense / data.totalDebt) * 100 : 0.05);

    const wacc =
      totalCapital > 0
        ? (data ? data.stockholdersEquity / totalCapital : 0.7 / totalCapital) *
            costOfEquity +
          (data ? data.totalDebt / totalCapital : 0.3 / totalCapital) *
            costOfDebt *
            (1 - taxRate)
        : 0;

    return {
      costOfEquity,
      costOfDebt,
      taxRate,
      wacc,
    };
  }, [data]);

  const Info = ({ text }: { text: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="text-blue-500 underline cursor-help ml-1 text-xs">
          คำอธิบาย ?
        </TooltipTrigger>
        <TooltipContent>{text}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h3>WACC Calculation</h3>
          <br />
          <p className="text-gray-600 text-xs">
            WACC (Weighted Average Cost of Capital) คือ
            อัตราผลตอบแทนเฉลี่ยถ่วงน้ำหนักของทุนทั้งหมดที่บริษัทใช้
            ใช้ประเมินว่าบริษัทควรได้ผลตอบแทนเท่าไรจากโครงการหรือลงทุน
            เพื่อไม่ให้ขาดทุน
          </p>{" "}
          <p className="italic text-gray-500 text-xs">
            WACC ต่ำ = บริษัทสามารถหาเงินทุนได้ในต้นทุนต่ำ → มีโอกาสแข่งขันสูง
          </p>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Label>
          Cost of Equity
          <Info text="ต้นทุนของเงินทุนจากผู้ถือหุ้น คำนวณจาก Capital Asset Pricing Model (CAPM) >> Rf + β × (Rm - Rf)" />{" "}
          <p className="text-xs italic text-gray-600">
            Beta (5Y-monthly) : {data?.beta || 0}
          </p>
        </Label>
        <Input
          type="number"
          step="0.01"
          value={costOfEquity}
          onChange={(e) => setCostOfEquity(Number(e.target.value))}
        />
        <Label>
          Cost of Debt (%)
          <Info text="ต้นทุนของหนี้สินที่บริษัทต้องจ่าย เช่น ดอกเบี้ยเงินกู้" />
        </Label>{" "}
        <p className="text-xs italic text-gray-600">
          Total debt : {formatCurrency(data?.totalDebt || 0)} | Interest Expense
          : {formatCurrency(data?.interestExpense || 0)}
        </p>
        <Input
          type="number"
          step="0.01"
          value={costOfDebt}
          onChange={(e) => setCostOfDebt(Number(e.target.value))}
        />
        <Label>
          Equity Weight{" "}
          <Info text="มูลค่าตลาดของหุ้นที่บริษัทออก (Market Cap)" />{" "}
          <p className="text-xs italic text-gray-600">
            Equity: {formatCurrency(data?.stockholdersEquity || 0)}
          </p>
        </Label>
        <Input
          type="number"
          step="0.01"
          value={equityWeight}
          onChange={(e) => setEquityWeight(Number(e.target.value))}
        />
        <Label>
          Debt Weight
          <Info text="หนี้สินระยะยาวที่บริษัทถืออยู่" />{" "}
          <p className="text-xs italic text-gray-600">
            Total Debt: {formatCurrency(data?.totalDebt || 0)}
          </p>
        </Label>
        <Input
          type="number"
          step="0.01"
          value={debtWeight}
          onChange={(e) => setDebtWeight(Number(e.target.value))}
        />
        <Label>
          Tax Rate
          <Info text="อัตราภาษีของบริษัท ใช้ลดหย่อนต้นทุนดอกเบี้ยได้" />
        </Label>
        <Input
          type="number"
          step="0.01"
          value={taxRate}
          onChange={(e) => setTaxRate(Number(e.target.value))}
        />
        <span>
          {"      Result : "}
          <b className="text-chart-3">{wacc.toFixed(2) + " or " + (wacc * 100).toFixed(2) + "%"}</b>
        </span>
        <div className="flex justify-end">
          <Button onClick={calculateWACC} className="align-right">
            Apply WACC
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
