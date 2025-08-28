import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Forgot Password | Lumpsum.in",
  description: "Reset your password for your Lumpsum.in account",
};

export default function ForgotPasswordPage() {
  return (
    <div className="max-w-md mx-auto p-4">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
          <p className="text-gray-600">Enter your email to reset your password</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Send Reset Link
            </Button>

            <div className="text-center">
              <Link 
                href="/auth/signin" 
                className="flex items-center justify-center gap-2 text-sm text-blue-600 hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
