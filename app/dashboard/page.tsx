"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Target,
  Shield,
  Download,
  Share2,
  Plus,
  BarChart3,
  PieChart,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { InvestmentGoal, FundRecommendation, AssetAllocation } from "@/lib/types";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

// Mock data for demonstration
const mockGoals: InvestmentGoal[] = [
  {
    id: "1",
    name: "Retirement Fund",
    targetAmount: 5000000,
    timeHorizon: 20,
    priority: "high",
    currentSavings: 500000,
    monthlyContribution: 15000,
    projectedValue: 3200000,
    requiredMonthlyInvestment: 12000,
    assetAllocation: {
      equity: 60,
      debt: 25,
      hybrid: 10,
      gold: 3,
      international: 2
    },
    recommendedFunds: [
      {
        fundId: "1",
        fundName: "HDFC Mid-Cap Opportunities Fund",
        category: "Equity - Mid Cap",
        allocation: 30,
        reason: "High growth potential for long-term wealth creation",
        riskLevel: "high",
        expenseRatio: 1.85,
        returns: { oneYear: 18.5, threeYear: 22.3, fiveYear: 19.8 },
        nav: 45.67,
        fundSize: 15000,
        minInvestment: 5000
      },
      {
        fundId: "2",
        fundName: "ICICI Prudential Bluechip Fund",
        category: "Equity - Large Cap",
        allocation: 30,
        reason: "Stable large-cap companies with consistent returns",
        riskLevel: "moderate",
        expenseRatio: 1.75,
        returns: { oneYear: 15.2, threeYear: 18.9, fiveYear: 16.5 },
        nav: 67.89,
        fundSize: 25000,
        minInvestment: 5000
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "2",
    name: "Child's Education",
    targetAmount: 2000000,
    timeHorizon: 12,
    priority: "medium",
    currentSavings: 200000,
    monthlyContribution: 8000,
    projectedValue: 1400000,
    requiredMonthlyInvestment: 6000,
    assetAllocation: {
      equity: 40,
      debt: 45,
      hybrid: 10,
      gold: 3,
      international: 2
    },
    recommendedFunds: [
      {
        fundId: "3",
        fundName: "Axis Bluechip Fund",
        category: "Equity - Large Cap",
        allocation: 40,
        reason: "Balanced approach for education goal",
        riskLevel: "moderate",
        expenseRatio: 1.65,
        returns: { oneYear: 16.8, threeYear: 19.2, fiveYear: 17.1 },
        nav: 52.34,
        fundSize: 18000,
        minInvestment: 5000
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

export default function DashboardPage() {
  const [goals, setGoals] = useState<InvestmentGoal[]>(mockGoals);
  const [selectedGoal, setSelectedGoal] = useState<InvestmentGoal | null>(null);

  const totalPortfolioValue = goals.reduce((sum, goal) => sum + goal.currentSavings, 0);
  const totalTargetValue = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const overallProgress = (totalPortfolioValue / totalTargetValue) * 100;

  const chartData = goals.map((goal) => ({
    name: goal.name,
    current: goal.currentSavings,
    target: goal.targetAmount,
    projected: goal.projectedValue
  }));

  const assetAllocationData = goals.reduce(
    (acc, goal) => {
      Object.entries(goal.assetAllocation).forEach(([key, value]) => {
        acc[key] = (acc[key] || 0) + value;
      });
      return acc;
    },
    {} as Record<string, number>
  );

  const pieData = Object.entries(assetAllocationData).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: value / goals.length
  }));

  const renderFundCard = (fund: FundRecommendation) => (
    <Card key={fund.fundId} className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h4 className="font-semibold text-sm">{fund.fundName}</h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">{fund.category}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">{fund.allocation}%</p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">Allocation</p>
          </div>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex justify-between text-xs">
            <span>1Y Return:</span>
            <span className={fund.returns.oneYear > 0 ? "text-green-600" : "text-red-600"}>
              {fund.returns.oneYear > 0 ? "+" : ""}
              {fund.returns.oneYear}%
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span>3Y Return:</span>
            <span className={fund.returns.threeYear > 0 ? "text-green-600" : "text-red-600"}>
              {fund.returns.threeYear > 0 ? "+" : ""}
              {fund.returns.threeYear}%
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span>Expense Ratio:</span>
            <span>{fund.expenseRatio}%</span>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            <strong>Why this fund?</strong> {fund.reason}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              Your Investment Dashboard
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Track your goals and fund performance
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Portfolio</p>
                    <p className="text-2xl font-bold">₹{totalPortfolioValue.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Target Value</p>
                    <p className="text-2xl font-bold">₹{totalTargetValue.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <Target className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Progress</p>
                    <p className="text-2xl font-bold">{overallProgress.toFixed(1)}%</p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <Progress value={overallProgress} className="mt-3" />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Active Goals</p>
                    <p className="text-2xl font-bold">{goals.length}</p>
                  </div>
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                    <Shield className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Goals List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Your Investment Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {goals.map((goal, index) => (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedGoal?.id === goal.id ? "ring-2 ring-blue-500" : ""
                        }`}
                        onClick={() => setSelectedGoal(goal)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold">{goal.name}</h4>
                              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                Target: ₹{goal.targetAmount.toLocaleString()} • {goal.timeHorizon}{" "}
                                years
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                ₹{goal.currentSavings.toLocaleString()}
                              </p>
                              <p className="text-xs text-zinc-600 dark:text-zinc-400">Current</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>
                                {((goal.currentSavings / goal.targetAmount) * 100).toFixed(1)}%
                              </span>
                            </div>
                            <Progress value={(goal.currentSavings / goal.targetAmount) * 100} />
                          </div>

                          <div className="mt-3 flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
                            <span>Monthly SIP: ₹{goal.monthlyContribution.toLocaleString()}</span>
                            <span
                              className={`flex items-center ${
                                goal.projectedValue >= goal.targetAmount
                                  ? "text-green-600"
                                  : "text-orange-600"
                              }`}
                            >
                              {goal.projectedValue >= goal.targetAmount ? (
                                <ArrowUpRight className="w-3 h-3 mr-1" />
                              ) : (
                                <ArrowDownRight className="w-3 h-3 mr-1" />
                              )}
                              ₹{goal.projectedValue.toLocaleString()}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Asset Allocation */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="w-5 h-5 mr-2" />
                  Asset Allocation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Fund Recommendations */}
        {selectedGoal && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Fund Recommendations for {selectedGoal.name}
                  </div>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Fund
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedGoal.recommendedFunds.map(renderFundCard)}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Performance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Portfolio Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="current"
                      stackId="1"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.6}
                      name="Current Value"
                    />
                    <Area
                      type="monotone"
                      dataKey="projected"
                      stackId="1"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.6}
                      name="Projected Value"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
