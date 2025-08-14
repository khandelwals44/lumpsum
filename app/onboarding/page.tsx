"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { OnboardingFormData } from "@/lib/types";
import { ChevronLeft, ChevronRight, User, Target, TrendingUp, Shield } from "lucide-react";

const steps = [
  {
    id: 1,
    title: "Personal Information",
    description: "Tell us about yourself",
    icon: User
  },
  {
    id: 2,
    title: "Financial Profile",
    description: "Your current financial situation",
    icon: TrendingUp
  },
  {
    id: 3,
    title: "Risk Assessment",
    description: "Understanding your risk tolerance",
    icon: Shield
  },
  {
    id: 4,
    title: "Investment Goals",
    description: "What are you investing for?",
    icon: Target
  }
];

const riskQuestions = [
  {
    id: "experience",
    question: "What&apos;s your experience with investments?",
    options: [
      { id: "none", text: "No experience", score: 1 },
      { id: "basic", text: "Basic knowledge", score: 2 },
      { id: "moderate", text: "Moderate experience", score: 3 },
      { id: "advanced", text: "Advanced investor", score: 4 }
    ]
  },
  {
    id: "time_horizon",
    question: "How long do you plan to invest?",
    options: [
      { id: "short", text: "1-3 years", score: 1 },
      { id: "medium", text: "3-7 years", score: 2 },
      { id: "long", text: "7-15 years", score: 3 },
      { id: "very_long", text: "15+ years", score: 4 }
    ]
  },
  {
    id: "risk_tolerance",
    question: "How would you react to a 20% drop in your investment?",
    options: [
      { id: "panic", text: "Sell immediately", score: 1 },
      { id: "worry", text: "Worry but hold", score: 2 },
      { id: "calm", text: "Stay calm", score: 3 },
      { id: "opportunity", text: "Buy more", score: 4 }
    ]
  },
  {
    id: "financial_situation",
    question: "What percentage of your income can you invest monthly?",
    options: [
      { id: "low", text: "5-10%", score: 1 },
      { id: "medium", text: "10-20%", score: 2 },
      { id: "high", text: "20-30%", score: 3 },
      { id: "very_high", text: "30%+", score: 4 }
    ]
  }
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingFormData>({
    step: 1,
    personalInfo: {
      name: "",
      email: "",
      age: 25,
      gender: "male",
      income: 500000,
      location: ""
    },
    financialInfo: {
      currentPortfolioValue: 0,
      monthlySIPCapacity: 10000
    },
    riskAssessment: {
      answers: {},
      score: 0,
      riskAppetite: "moderate"
    },
    goals: []
  });

  const progress = (currentStep / steps.length) * 100;
  const currentStepData = steps[currentStep - 1];

  const updateFormData = (field: keyof OnboardingFormData, value: any) => {
    setFormData((prev) => {
      const currentField = prev[field];
      if (typeof currentField === "object" && currentField !== null) {
        return {
          ...prev,
          [field]: { ...currentField, ...value }
        };
      }
      return prev;
    });
  };

  const handleRiskAnswer = (questionId: string, answerId: string) => {
    const newAnswers = { ...formData.riskAssessment.answers, [questionId]: answerId };
    const totalScore = Object.values(newAnswers).reduce((sum, answerId) => {
      const question = riskQuestions.find((q) => q.id === questionId);
      const option = question?.options.find((o) => o.id === answerId);
      return sum + (option?.score || 0);
    }, 0);

    const riskAppetite = totalScore <= 8 ? "low" : totalScore <= 12 ? "moderate" : "high";

    updateFormData("riskAssessment", {
      answers: newAnswers,
      score: totalScore,
      riskAppetite
    });
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Full Name
                </label>
                <Input
                  id="name"
                  value={formData.personalInfo.name}
                  onChange={(e) => updateFormData("personalInfo", { name: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={formData.personalInfo.email}
                  onChange={(e) => updateFormData("personalInfo", { email: e.target.value })}
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label htmlFor="age" className="block text-sm font-medium mb-2">
                  Age
                </label>
                <Input
                  id="age"
                  type="number"
                  value={formData.personalInfo.age}
                  onChange={(e) =>
                    updateFormData("personalInfo", { age: parseInt(e.target.value) })
                  }
                  min="18"
                  max="100"
                />
              </div>
              <div>
                <label htmlFor="gender" className="block text-sm font-medium mb-2">
                  Gender
                </label>
                <select
                  id="gender"
                  value={formData.personalInfo.gender}
                  onChange={(e) => updateFormData("personalInfo", { gender: e.target.value })}
                  className="flex h-12 w-full rounded-xl border-2 border-zinc-200 bg-white/80 px-4 py-3 text-sm backdrop-blur-sm transition-all duration-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900/80 dark:focus:border-blue-400 dark:focus:bg-zinc-900 dark:focus:ring-blue-400/20"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="income" className="block text-sm font-medium mb-2">
                  Annual Income (₹)
                </label>
                <Input
                  id="income"
                  type="number"
                  value={formData.personalInfo.income}
                  onChange={(e) =>
                    updateFormData("personalInfo", { income: parseInt(e.target.value) })
                  }
                  placeholder="500000"
                />
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium mb-2">
                  Location
                </label>
                <Input
                  id="location"
                  value={formData.personalInfo.location}
                  onChange={(e) => updateFormData("personalInfo", { location: e.target.value })}
                  placeholder="City, State"
                />
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="portfolio" className="block text-sm font-medium mb-2">
                  Current Portfolio Value (₹)
                </label>
                <Input
                  id="portfolio"
                  type="number"
                  value={formData.financialInfo.currentPortfolioValue}
                  onChange={(e) =>
                    updateFormData("financialInfo", {
                      currentPortfolioValue: parseInt(e.target.value)
                    })
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <label htmlFor="sip" className="block text-sm font-medium mb-2">
                  Monthly SIP Capacity (₹)
                </label>
                <Input
                  id="sip"
                  type="number"
                  value={formData.financialInfo.monthlySIPCapacity}
                  onChange={(e) =>
                    updateFormData("financialInfo", {
                      monthlySIPCapacity: parseInt(e.target.value)
                    })
                  }
                  placeholder="10000"
                />
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            {riskQuestions.map((question, index) => (
              <div key={question.id} className="space-y-4">
                <h3 className="text-lg font-semibold">{question.question}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {question.options.map((option) => (
                    <Button
                      key={option.id}
                      variant={
                        formData.riskAssessment.answers[question.id] === option.id
                          ? "default"
                          : "outline"
                      }
                      onClick={() => handleRiskAnswer(question.id, option.id)}
                      className="justify-start h-auto p-4"
                    >
                      {option.text}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
            {formData.riskAssessment.score > 0 && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Based on your answers, your risk appetite is:{" "}
                  <span className="font-semibold capitalize">
                    {formData.riskAssessment.riskAppetite}
                  </span>
                </p>
              </div>
            )}
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Ready to create your investment plan!</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                We&apos;ll analyze your profile and create personalized recommendations.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">Your Profile Summary</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Name:</span> {formData.personalInfo.name}
                    </p>
                    <p>
                      <span className="font-medium">Age:</span> {formData.personalInfo.age}
                    </p>
                    <p>
                      <span className="font-medium">Income:</span> ₹
                      {formData.personalInfo.income.toLocaleString()}
                    </p>
                    <p>
                      <span className="font-medium">Risk Appetite:</span>{" "}
                      <span className="capitalize">{formData.riskAssessment.riskAppetite}</span>
                    </p>
                    <p>
                      <span className="font-medium">Monthly SIP:</span> ₹
                      {formData.financialInfo.monthlySIPCapacity.toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  if (!currentStepData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              Welcome to lumpsum.in
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Let&apos;s create your personalized investment plan
            </p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center space-x-2 ${
                    currentStep >= step.id ? "text-blue-600" : "text-zinc-400"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= step.id
                        ? "bg-blue-600 text-white"
                        : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    {currentStep > step.id ? "✓" : step.id}
                  </div>
                  <span className="hidden md:block text-sm font-medium">{step.title}</span>
                </div>
              ))}
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Content */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <currentStepData.icon className="w-6 h-6" />
                <span>{currentStepData.title}</span>
              </CardTitle>
              <p className="text-zinc-600 dark:text-zinc-400">{currentStepData.description}</p>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            <Button
              onClick={nextStep}
              disabled={currentStep === steps.length}
              className="flex items-center space-x-2"
            >
              <span>{currentStep === steps.length ? "Complete" : "Next"}</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
