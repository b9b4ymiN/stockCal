'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { fetchQuoteSummary, estimateGrowthRateFromGordonModel } from '@/lib/finance';
import { formatCurrency } from '@/lib/utils';
import { Header } from '@/components/ui/header';

export default function DdmPage() {
    const [symbol, setSymbol] = useState('AAPL');
    const [dividend, setDividend] = useState(0);
    const [growthRate, setGrowthRate] = useState(0.05);
    const [costOfEquity, setCostOfEquity] = useState(0.08);
    const [peRatio, setPeRatio] = useState(0);
    const [eps, setEps] = useState(0);
    const [currentPrice, setCurrentPrice] = useState(0);

    const intrinsicValue = dividend > 0 && costOfEquity > growthRate
        ? dividend * (1 + growthRate) / (costOfEquity - growthRate)
        : 0;

    const upside = currentPrice > 0 ? ((intrinsicValue - currentPrice) / currentPrice) * 100 : 0;

    const fetchData = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch(`/api/stock-data?symbol=${symbol}`);
        const json = await res.json();

        setDividend(json.data.defaultKeyStatistics.lastDividendValue);
        setPeRatio(json.data.defaultKeyStatistics.forwardPE);
        setEps(json.data.defaultKeyStatistics.forwardEps);
        setCurrentPrice(json.data.financialData.currentPrice);
    };

 

    return (
        <main className="max-w-3xl mx-auto py-10 px-4 space-y-6">
            <Header />
            <Card>
                <CardHeader>
                    <CardTitle>
                        <b>Dividend Discount Model (DDM) Valuation</b>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={fetchData} className="space-y-4">
                        <Label>🔍 Stock Symbol</Label>
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
            <Card >
                <CardHeader>
                    <CardTitle>Assumptions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">

                    <div>
                        <Label>💸 Forward Dividend (USD)</Label>
                        <p className="text-sm text-muted-foreground">เงินปันผลต่อหุ้นที่คาดว่าจะได้รับในปีหน้า</p>
                        <Input type="number" value={dividend} onChange={(e) => setDividend(Number(e.target.value))} />
                    </div>

                    <div>
                        <Label>📈 PE Ratio</Label>
                        <p className="text-sm text-muted-foreground">อัตราส่วนราคาต่อกำไร ใช้ในการประเมินความคาดหวังของตลาด</p>
                        <Input type="number" value={peRatio} onChange={(e) => setPeRatio(Number(e.target.value))} />
                    </div>

                    <div>
                        <Label>📊 EPS (Earnings Per Share)</Label>
                        <p className="text-sm text-muted-foreground">กำไรต่อหุ้น ใช้ประกอบในการคำนวณ Cost of Equity</p>
                        <Input type="number" value={eps} onChange={(e) => setEps(Number(e.target.value))} />
                    </div>

                    <div>
                        <Label>⚙️ Cost of Equity (%)</Label>
                        <p className="text-sm text-muted-foreground">ต้นทุนเงินทุนของผู้ถือหุ้น คำนวณจาก 1 / PE หรือกำหนดเอง</p>
                        <div className="flex gap-2">
                            <Input type="number" step="0.01" value={costOfEquity} onChange={(e) => setCostOfEquity(Number(e.target.value))} />
                            <Button variant="outline" onClick={() => setCostOfEquity(Number((1 / peRatio).toFixed(4)))}>Estimate from PE</Button>
                        </div>
                    </div>

                    <div>
                        <Label>📉 Growth Rate (%)</Label>
                        <p className="text-sm text-muted-foreground">อัตราการเติบโตของเงินปันผล</p>
                        <div className="flex gap-2">
                            <Input type="number" step="0.01" value={growthRate} onChange={(e) => setGrowthRate(Number(e.target.value))} />
                            <Button variant="outline" onClick={() => {
                                const g = estimateGrowthRateFromGordonModel({
                                    dividendYield: dividend / currentPrice,
                                    peRatio,
                                });
                                setGrowthRate(Number(g.toFixed(4)));
                            }}>Estimate from Gordon Model</Button>
                        </div>
                    </div>

                    <div>
                        <Label>📌 Intrinsic Value (DDM)</Label>
                        <div className="text-xl font-semibold">{formatCurrency(intrinsicValue)}</div>
                    </div>

                    <div>
                        <Label>📍 Current Market Price</Label>
                        <div>{formatCurrency(currentPrice)}</div>
                    </div>

                    <div>
                        <Label>📈 Upside Potential</Label>
                        <div className={upside >= 0 ? 'text-green-600' : 'text-red-600'}>{upside.toFixed(2)}%</div>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
