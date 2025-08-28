"use client";

import { useState, useEffect, useMemo } from "react";
import { Check, X } from "lucide-react";

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

interface Requirement {
  label: string;
  test: (password: string) => boolean;
  met: boolean;
}

export default function PasswordStrengthIndicator({ 
  password, 
  className = "" 
}: PasswordStrengthIndicatorProps) {
  // Define requirements statically to avoid recreation on every render
  const requirementDefinitions = useMemo(() => [
    { label: "At least 8 characters", test: (pwd: string) => pwd.length >= 8 },
    { label: "At least one lowercase letter", test: (pwd: string) => /[a-z]/.test(pwd) },
    { label: "At least one uppercase letter", test: (pwd: string) => /[A-Z]/.test(pwd) },
    { label: "At least one number", test: (pwd: string) => /\d/.test(pwd) },
    { label: "At least one special character (@$!%*?&)", test: (pwd: string) => /[@$!%*?&]/.test(pwd) }
  ], []);

  const [strength, setStrength] = useState<{
    score: number;
    label: string;
    color: string;
  }>({ score: 0, label: "Very Weak", color: "bg-red-500" });

  // Calculate requirements and strength based on password
  const requirements = useMemo(() => {
    return requirementDefinitions.map(req => ({
      ...req,
      met: req.test(password)
    }));
  }, [password, requirementDefinitions]);

  useEffect(() => {
    // Calculate strength
    const metCount = requirements.filter(req => req.met).length;
    const totalRequirements = requirements.length;
    const score = Math.round((metCount / totalRequirements) * 100);

    let label = "Very Weak";
    let color = "bg-red-500";

    if (score >= 80) {
      label = "Strong";
      color = "bg-green-500";
    } else if (score >= 60) {
      label = "Good";
      color = "bg-yellow-500";
    } else if (score >= 40) {
      label = "Fair";
      color = "bg-orange-500";
    } else if (score >= 20) {
      label = "Weak";
      color = "bg-red-400";
    }

    setStrength({ score, label, color });
  }, [requirements]);

  if (!password) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Password strength:</span>
          <span className="font-medium">{strength.label}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${strength.color}`}
            style={{ width: `${strength.score}%` }}
          />
        </div>
      </div>

      {/* Requirements List */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Requirements:</p>
        <ul className="space-y-1">
          {requirements.map((req, index) => (
            <li key={index} className="flex items-center gap-2 text-sm">
              {req.met ? (
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
              ) : (
                <X className="w-4 h-4 text-red-500 flex-shrink-0" />
              )}
              <span className={req.met ? "text-green-700" : "text-red-700"}>
                {req.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
