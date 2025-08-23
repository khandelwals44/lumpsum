"use client";

import { useEffect, useMemo, useState } from "react";
import { Api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

function useDebouncedCallback<T extends any[]>(fn: (...args: T) => void, delay = 500) {
  const [timer, setTimer] = useState<any>(null);
  return (...args: T) => {
    if (timer) clearTimeout(timer);
    const t = setTimeout(() => fn(...args), delay);
    setTimer(t);
  };
}

export default function OnboardingClient() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>({
    name: "",
    age: 25,
    gender: "other",
    phone: "",
    income: 0,
    expenses: 0,
    currentInvestments: 0,
    location: "",
    riskAppetite: "moderate",
    currentPortfolioValue: 0,
    monthlySIPCapacity: 0
  });

  const debouncedSave = useDebouncedCallback(async (next: any) => {
    try {
      await Api.updateProfile(next);
    } catch (e: any) {
      // silently ignore for UX; could show toast
      console.warn("Autosave failed", e?.message);
    }
  }, 600);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const p = await Api.getProfile();
        if (p) setProfile((prev: any) => ({ ...prev, ...p }));
      } catch (e: any) {
        setError(null); // unauth OK; onboarding still visible for UI preview
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const progress = useMemo(() => (step / 4) * 100, [step]);

  function update(next: Partial<typeof profile>) {
    const merged = { ...profile, ...next };
    setProfile(merged);
    debouncedSave(merged);
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Onboarding</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Progress value={progress} />
          </div>
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="text-sm font-medium">
                  Full name
                </label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => update({ name: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="age" className="text-sm font-medium">
                  Age
                </label>
                <Input
                  id="age"
                  type="number"
                  value={profile.age}
                  onChange={(e) => update({ age: Number(e.target.value || 0) })}
                />
              </div>
              <div>
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone
                </label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => update({ phone: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="location" className="text-sm font-medium">
                  Location
                </label>
                <Input
                  id="location"
                  value={profile.location}
                  onChange={(e) => update({ location: e.target.value })}
                />
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="income" className="text-sm font-medium">
                  Annual Income (₹)
                </label>
                <Input
                  id="income"
                  type="number"
                  value={profile.income}
                  onChange={(e) => update({ income: Number(e.target.value || 0) })}
                />
              </div>
              <div>
                <label htmlFor="expenses" className="text-sm font-medium">
                  Monthly Expenses (₹)
                </label>
                <Input
                  id="expenses"
                  type="number"
                  value={profile.expenses}
                  onChange={(e) => update({ expenses: Number(e.target.value || 0) })}
                />
              </div>
              <div>
                <label htmlFor="currentInvestments" className="text-sm font-medium">
                  Current Investments (₹)
                </label>
                <Input
                  id="currentInvestments"
                  type="number"
                  value={profile.currentInvestments}
                  onChange={(e) => update({ currentInvestments: Number(e.target.value || 0) })}
                />
              </div>
              <div>
                <label htmlFor="monthlySIPCapacity" className="text-sm font-medium">
                  Monthly SIP Capacity (₹)
                </label>
                <Input
                  id="monthlySIPCapacity"
                  type="number"
                  value={profile.monthlySIPCapacity}
                  onChange={(e) => update({ monthlySIPCapacity: Number(e.target.value || 0) })}
                />
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="riskAppetite" className="text-sm font-medium">
                  Risk Appetite
                </label>
                <select
                  id="riskAppetite"
                  value={profile.riskAppetite}
                  onChange={(e) => update({ riskAppetite: e.target.value })}
                  className="flex h-12 w-full rounded-xl border-2 border-zinc-200 bg-white/80 px-4 py-3 text-sm"
                >
                  <option value="low">Conservative</option>
                  <option value="moderate">Balanced</option>
                  <option value="high">Aggressive</option>
                </select>
              </div>
              <div>
                <label htmlFor="currentPortfolioValue" className="text-sm font-medium">
                  Current Portfolio Value (₹)
                </label>
                <Input
                  id="currentPortfolioValue"
                  type="number"
                  value={profile.currentPortfolioValue}
                  onChange={(e) => update({ currentPortfolioValue: Number(e.target.value || 0) })}
                />
              </div>
            </div>
          )}
          {step === 4 && (
            <div>
              <p className="text-sm text-zinc-600">You can adjust goals in the dashboard later.</p>
            </div>
          )}

          <div className="mt-6 flex justify-between">
            <Button
              variant="outline"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
            >
              Previous
            </Button>
            <Button onClick={() => setStep((s) => Math.min(4, s + 1))} disabled={step === 4}>
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
