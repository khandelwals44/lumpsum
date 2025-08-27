"use client";

import { useEffect, useMemo, useState } from "react";
import { Api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { exportJSON, exportPDF } from "@/lib/export";
import { downloadICS, generateICS, googleCalendarLink } from "@/lib/calendar";

export default function DashboardClient() {
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<any[]>([]);
  const [holdings, setHoldings] = useState<any[]>([]);
  const [funds, setFunds] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [g, h, f] = await Promise.all([
          Api.getGoals().catch(() => []),
          Api.getHoldings().catch(() => []),
          Api.getFunds({ category: "Equity" }).catch(() => [])
        ]);
        setGoals(g);
        setHoldings(h);
        setFunds(f);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const nextSipDate = useMemo(() => {
    const anySip = holdings.find((h) => (h.sipAmount || 0) > 0);
    if (!anySip) return null;
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth() + 1, 1, 9, 0, 0);
    return next;
  }, [holdings]);

  function handleExportJSON() {
    exportJSON("dashboard.json", { goals, holdings, funds });
  }

  function handleExportPDF() {
    const lines: string[] = [];
    lines.push("Goals:");
    for (const g of goals) lines.push(`- ${g.name} • Target ₹${g.targetAmount}`);
    lines.push("");
    lines.push("Holdings:");
    for (const h of holdings)
      lines.push(`- Fund ${h.fundId} • Units ${h.units} • Avg ₹${h.avgCost}`);
    exportPDF("dashboard.pdf", "Investment Summary", lines);
  }

  async function handleShare() {
    try {
      const url = typeof window !== "undefined" ? window.location.href : "";
      if (navigator.share && url) {
        await navigator.share({ title: "My Investment Dashboard", url });
      } else if (navigator.clipboard && url) {
        await navigator.clipboard.writeText(url);
        alert("Link copied to clipboard");
      }
    } catch {}
  }

  function handleCalendar() {
    if (!nextSipDate) return;
    const end = new Date(nextSipDate.getTime() + 60 * 60 * 1000);
    const ics = generateICS({
      title: "SIP Reminder",
      description: "Monthly SIP contribution",
      start: nextSipDate,
      end
    });
    downloadICS("sip-reminder.ics", ics);
  }

  if (loading) return <div className="container">Loading dashboard…</div>;

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button onClick={handleExportJSON} variant="outline">
          Export JSON
        </Button>
        <Button onClick={handleExportPDF} variant="outline">
          Download PDF
        </Button>
        <Button onClick={handleShare} variant="outline">
          Share
        </Button>
        <Button onClick={handleCalendar} variant="outline" disabled={!nextSipDate}>
          Add SIP to Calendar
        </Button>
        {nextSipDate && (
          <a
            className="text-sm underline ml-2"
            href={googleCalendarLink({
              title: "SIP Reminder",
              start: nextSipDate,
              end: new Date(nextSipDate.getTime() + 60 * 60 * 1000)
            })}
            target="_blank"
            rel="noreferrer"
          >
            Google Calendar
          </a>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Goals</CardTitle>
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            <p className="text-sm text-zinc-600">No goals yet.</p>
          ) : (
            <ul className="text-sm">
              {goals.map((g) => (
                <li key={g.id} className="py-1">
                  {g.name} • Target ₹{g.targetAmount.toLocaleString()} • {g.timeHorizon}y
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          {holdings.length === 0 ? (
            <p className="text-sm text-zinc-600">No holdings yet.</p>
          ) : (
            <ul className="text-sm">
              {holdings.map((h) => (
                <li key={h.id} className="py-1">
                  Fund {h.fundId} • Units {h.units} • Avg ₹{h.avgCost}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Suggested Funds (Equity)</CardTitle>
        </CardHeader>
        <CardContent>
          {funds.length === 0 ? (
            <p className="text-sm text-zinc-600">No funds found.</p>
          ) : (
            <ul className="text-sm">
              {funds.slice(0, 5).map((f) => (
                <li key={f.id} className="py-1">
                  {f.name} — {f.subCategory} • 1Y {f.oneYearReturn}% • ER {f.expenseRatio}%
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
