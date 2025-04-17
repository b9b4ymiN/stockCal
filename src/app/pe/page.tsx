"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/ui/header";

export default function PEValuation() {
  const [eps, setEps] = useState(0);
  const [pe, setPe] = useState(15);
  const [valuation, setValuation] = useState<number | null>(null);

  const calculate = () => setValuation(eps * pe);

  return (
    <main className="max-w-xl mx-auto py-10 px-4 space-y-6">
      <Header />
      <Card>
        <CardHeader>
          <CardTitle>PE-Based Valuation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Label>EPS</Label>
          <Input
            type="number"
            value={eps}
            onChange={(e) => setEps(Number(e.target.value))}
          />

          <Label>PE Ratio</Label>
          <Input
            type="number"
            value={pe}
            onChange={(e) => setPe(Number(e.target.value))}
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
