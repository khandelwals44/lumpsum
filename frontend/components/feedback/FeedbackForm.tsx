"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Send, Loader2, CheckCircle } from "lucide-react";

interface FeedbackData {
  name: string;
  email: string;
  type: string;
  subject: string;
  message: string;
  priority: string;
  includeSystemInfo: boolean;
  allowContact: boolean;
}

export function FeedbackForm() {
  const [formData, setFormData] = useState<FeedbackData>({
    name: "",
    email: "",
    type: "",
    subject: "",
    message: "",
    priority: "medium",
    includeSystemInfo: true,
    allowContact: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (field: keyof FeedbackData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast.error("Please enter your name");
      return false;
    }
    if (!formData.email.trim()) {
      toast.error("Please enter your email");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (!formData.type) {
      toast.error("Please select a feedback type");
      return false;
    }
    if (!formData.subject.trim()) {
      toast.error("Please enter a subject");
      return false;
    }
    if (!formData.message.trim()) {
      toast.error("Please enter your message");
      return false;
    }
    if (formData.message.length < 10) {
      toast.error("Message must be at least 10 characters long");
      return false;
    }
    return true;
  };

  const getSystemInfo = () => {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${screen.width}x${screen.height}`,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const systemInfo = formData.includeSystemInfo ? getSystemInfo() : null;
      
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          systemInfo,
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        toast.success("Thank you for your feedback! We'll get back to you soon.");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to send feedback. Please try again.");
      }
    } catch (error) {
      console.error("Feedback submission error:", error);
      toast.error("Failed to send feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Thank You!
        </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
            Your feedback has been submitted successfully. We&apos;ll review it and get back to you at{" "}
            <span className="font-medium">{formData.email}</span> within 24 hours.
          </p>
        <Button
          onClick={() => {
            setIsSubmitted(false);
            setFormData({
              name: "",
              email: "",
              type: "",
              subject: "",
              message: "",
              priority: "medium",
              includeSystemInfo: true,
              allowContact: true,
            });
          }}
          variant="outline"
        >
          Submit Another Feedback
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Send Feedback
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Help us improve Lumpsum.in by sharing your thoughts and experiences.
        </p>
      </div>

      {/* Name and Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name" className="text-sm font-medium">
            Name *
          </Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Your name"
            className="mt-1"
            required
          />
        </div>
        <div>
          <Label htmlFor="email" className="text-sm font-medium">
            Email *
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="your.email@example.com"
            className="mt-1"
            required
          />
        </div>
      </div>

      {/* Feedback Type and Priority */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type" className="text-sm font-medium">
            Feedback Type *
          </Label>
          <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select feedback type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bug">Bug Report</SelectItem>
              <SelectItem value="feature">Feature Request</SelectItem>
              <SelectItem value="improvement">Improvement Suggestion</SelectItem>
              <SelectItem value="question">Question</SelectItem>
              <SelectItem value="compliment">Compliment</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="priority" className="text-sm font-medium">
            Priority
          </Label>
          <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Subject */}
      <div>
        <Label htmlFor="subject" className="text-sm font-medium">
          Subject *
        </Label>
        <Input
          id="subject"
          type="text"
          value={formData.subject}
          onChange={(e) => handleInputChange("subject", e.target.value)}
          placeholder="Brief description of your feedback"
          className="mt-1"
          required
        />
      </div>

      {/* Message */}
      <div>
        <Label htmlFor="message" className="text-sm font-medium">
          Message *
        </Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => handleInputChange("message", e.target.value)}
          placeholder="Please provide detailed information about your feedback..."
          className="mt-1 min-h-[120px]"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Minimum 10 characters. Be as detailed as possible to help us understand your feedback.
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="includeSystemInfo"
            checked={formData.includeSystemInfo}
            onCheckedChange={(checked) => handleInputChange("includeSystemInfo", checked as boolean)}
          />
          <Label htmlFor="includeSystemInfo" className="text-sm">
            Include system information (browser, device, etc.) to help us debug issues
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="allowContact"
            checked={formData.allowContact}
            onCheckedChange={(checked) => handleInputChange("allowContact", checked as boolean)}
          />
          <Label htmlFor="allowContact" className="text-sm">
            Allow us to contact you for follow-up questions
          </Label>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
        size="lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Send Feedback
          </>
        )}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        By submitting this form, you agree to our{" "}
        <a href="/privacy" className="text-blue-600 hover:underline">
          Privacy Policy
        </a>{" "}
        and{" "}
        <a href="/terms" className="text-blue-600 hover:underline">
          Terms of Service
        </a>
        .
      </p>
    </form>
  );
}
