"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/ui/header";

export default function EVEBITDA() {
  const [ebitda, setEbitda] = useState(0);
  const [multiple, setMultiple] = useState(10);
  const [debt, setDebt] = useState(0);
  const [cash, setCash] = useState(0);
  const [shares, setShares] = useState(0);
  const [valuation, setValuation] = useState<number | null>(null);

  const calculate = () => {
    const enterpriseValue = ebitda * multiple;
    const equityValue = enterpriseValue - debt + cash;
    const perShare = equityValue / shares;
    setValuation(perShare);
  };

  return (
    <main className="max-w-xl mx-auto py-10 px-4 space-y-6">
      <Header />
      <Card>
        <CardHeader>
          <CardTitle>EV/EBITDA Valuation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Label>EBITDA</Label>
          <Input
            type="number"
            value={ebitda}
            onChange={(e) => setEbitda(Number(e.target.value))}
          />

          <Label>EV/EBITDA Multiple</Label>
          <Input
            type="number"
            value={multiple}
            onChange={(e) => setMultiple(Number(e.target.value))}
          />

          <Label>Total Debt</Label>
          <Input
            type="number"
            value={debt}
            onChange={(e) => setDebt(Number(e.target.value))}
          />

          <Label>Cash & Equivalents</Label>
          <Input
            type="number"
            value={cash}
            onChange={(e) => setCash(Number(e.target.value))}
          />

          <Label>Shares Outstanding</Label>
          <Input
            type="number"
            value={shares}
            onChange={(e) => setShares(Number(e.target.value))}
          />

          <Button onClick={calculate}>Calculate</Button>

          {valuation !== null && (
            <p>
              Estimated Price:{" "}
              <strong className="text-chart-2">${valuation.toFixed(2)}</strong>
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
