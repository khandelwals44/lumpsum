"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { getRecaptchaConfig } from '@/lib/env.client';

interface ReCaptchaProps {
  onVerify: (token: string) => void;
  onError: (error: string) => void;
  action: string;
  className?: string;
}

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

export default function ReCaptcha({ 
  onVerify, 
  onError, 
  action, 
  className = "" 
}: ReCaptchaProps) {
  const isLoaded = useRef(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const siteKey = getRecaptchaConfig().siteKey;

  const executeRecaptcha = useCallback(async () => {
    if (!siteKey || siteKey === '6Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
      setError("reCAPTCHA not configured - please set NEXT_PUBLIC_RECAPTCHA_SITE_KEY in .env.local");
      onError("reCAPTCHA not configured");
      return;
    }

    if (!window.grecaptcha) {
      setError("reCAPTCHA not loaded");
      onError("reCAPTCHA not loaded");
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      await new Promise<void>((resolve, reject) => {
        window.grecaptcha.ready(() => {
          resolve();
        });
      });

      const token = await window.grecaptcha.execute(siteKey, { action });
      setIsVerifying(false);
      onVerify(token);
    } catch (error) {
      console.error("reCAPTCHA error:", error);
      setIsVerifying(false);
      const errorMessage = "reCAPTCHA verification failed";
      setError(errorMessage);
      onError(errorMessage);
    }
  }, [siteKey, action, onVerify, onError]);

  useEffect(() => {
    if (!siteKey || siteKey === '6Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
      setError("reCAPTCHA not configured - please set NEXT_PUBLIC_RECAPTCHA_SITE_KEY in .env.local");
      onError("reCAPTCHA not configured");
      return;
    }

    // Load reCAPTCHA script if not already loaded
    if (!window.grecaptcha && !isLoaded.current) {
      const script = document.createElement("script");
      script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        isLoaded.current = true;
        setIsReady(true);
      };
      script.onerror = () => {
        setError("Failed to load reCAPTCHA");
        onError("Failed to load reCAPTCHA");
      };
      document.head.appendChild(script);
    } else if (window.grecaptcha && !isLoaded.current) {
      isLoaded.current = true;
      setIsReady(true);
    }
  }, [siteKey, onError]);

  // Expose execute function to parent component
  useEffect(() => {
    if (isReady) {
      // Store the execute function globally so parent can call it
      (window as any).executeRecaptcha = executeRecaptcha;
    }
  }, [isReady, executeRecaptcha]);

  // Retry mechanism
  const handleRetry = () => {
    executeRecaptcha();
  };

  if (error) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
          <button
            onClick={handleRetry}
            className="text-blue-600 hover:underline ml-2"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading reCAPTCHA...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        {isVerifying ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Verifying...</span>
          </>
        ) : (
          <span>reCAPTCHA ready</span>
        )}
      </div>
    </div>
  );
}
