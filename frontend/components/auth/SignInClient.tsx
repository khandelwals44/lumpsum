"use client";

import { useEffect, useMemo, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { signInSchema, type SignInInput } from "@/lib/validations/auth";
import ReCaptcha from "./ReCaptcha";
import { getNextAuthConfig } from '@/lib/env.client';
import { logAuthFlow, logFormData, logError } from '@/lib/logSafe';

export default function SignInClient() {
  const sp = useSearchParams();
  const router = useRouter();
  const { status } = useSession();
  
  const [formData, setFormData] = useState<SignInInput>({
    email: "",
    password: "",
    rememberMe: false,
    recaptchaToken: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);

  const target = sp?.get("callbackUrl") || "/dashboard";
  const message = sp?.get("message");
  
  const callbackUrl = useMemo(() => {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    try {
      new URL(target);
      return target;
    } catch {
      return base ? `${base}${target}` : target;
    }
  }, [target]);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  const handleInputChange = (field: keyof SignInInput, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    try {
      signInSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const newErrors: Record<string, string> = {};
      error.errors?.forEach((err: any) => {
        newErrors[err.path[0]] = err.message;
      });
      setErrors(newErrors);
      return false;
    }
  };

  const handleRecaptchaVerify = (token: string) => {
    setFormData(prev => ({ ...prev, recaptchaToken: token }));
    setRecaptchaVerified(true);
  };

  const handleRecaptchaError = (error: string) => {
    setErrors(prev => ({ ...prev, recaptcha: error }));
    setRecaptchaVerified(false);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setErrors({});
    
    logAuthFlow('Sign in attempt', { email: formData.email });

    // Execute reCAPTCHA verification
    try {
      if (typeof window !== 'undefined' && (window as any).executeRecaptcha) {
        await (window as any).executeRecaptcha();
      } else {
        setErrors(prev => ({ ...prev, recaptcha: "reCAPTCHA not available" }));
        setLoading(false);
        return;
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, recaptcha: "reCAPTCHA verification failed" }));
      setLoading(false);
      return;
    }

    const res = await signIn("credentials", {
      email: formData.email,
      password: formData.password,
      callbackUrl,
      redirect: false
    });

    setLoading(false);

    if (res?.error) {
      logError('Sign in failed', { error: res.error });
      setErrors({ general: "Invalid email or password" });
    } else {
      logAuthFlow('Sign in successful', { email: formData.email });
    }
  };

  const onGoogle = async () => {
    setErrors({});
    setLoading(true);
    await signIn("google", { callbackUrl, redirect: true });
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <p className="text-gray-600">Sign in to your lumpsum.in account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4" aria-label="sign-in-form">
            {message && (
              <div className="rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700">
                {message}
              </div>
            )}
            
            {errors.general && (
              <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                {errors.general}
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter your email"
                className={errors.email ? "border-red-500" : ""}
                disabled={loading}
                required
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="Enter your password"
                  className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) => handleInputChange("rememberMe", checked as boolean)}
                  disabled={loading}
                />
                <Label htmlFor="rememberMe" className="text-sm">
                  Remember me
                </Label>
              </div>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* reCAPTCHA */}
            <ReCaptcha
              onVerify={handleRecaptchaVerify}
              onError={handleRecaptchaError}
              action="signin"
            />
            {errors.recaptcha && (
              <p className="text-sm text-red-600">{errors.recaptcha}</p>
            )}

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={loading || !recaptchaVerified}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            {/* Social Login */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={onGoogle}
              disabled={loading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="text-blue-600 hover:underline font-medium">
                Create one
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
