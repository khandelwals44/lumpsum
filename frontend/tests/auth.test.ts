import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signUpSchema, signInSchema } from '@/lib/validations/auth';

// Mock environment variables
vi.mock('@/lib/env', () => ({
  Env: {
    NODE_ENV: 'test',
    NEXTAUTH_URL: 'http://localhost:3000',
    NEXTAUTH_SECRET: 'test-secret',
    DATABASE_URL: 'file:./test.db',
    GOOGLE_CLIENT_ID: 'test-google-client-id',
    GOOGLE_CLIENT_SECRET: 'test-google-client-secret',
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY: 'test-recaptcha-site-key',
    RECAPTCHA_SECRET_KEY: 'test-recaptcha-secret-key'
  }
}));

describe('Authentication Validation', () => {
  describe('Sign Up Schema', () => {
    it('should validate correct signup data', () => {
      const validData = {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'StrongPass123!',
        confirmPassword: 'StrongPass123!',
        acceptTerms: true,
        recaptchaToken: 'test-token'
      };

      const result = signUpSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject weak password', () => {
      const invalidData = {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'weak',
        confirmPassword: 'weak',
        acceptTerms: true,
        recaptchaToken: 'test-token'
      };

      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.path.includes('password'))).toBe(true);
      }
    });

    it('should reject mismatched passwords', () => {
      const invalidData = {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'StrongPass123!',
        confirmPassword: 'DifferentPass123!',
        acceptTerms: true,
        recaptchaToken: 'test-token'
      };

      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.path.includes('confirmPassword'))).toBe(true);
      }
    });

    it('should reject invalid email', () => {
      const invalidData = {
        fullName: 'John Doe',
        email: 'invalid-email',
        password: 'StrongPass123!',
        confirmPassword: 'StrongPass123!',
        acceptTerms: true,
        recaptchaToken: 'test-token'
      };

      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.path.includes('email'))).toBe(true);
      }
    });

    it('should reject unchecked terms', () => {
      const invalidData = {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'StrongPass123!',
        confirmPassword: 'StrongPass123!',
        acceptTerms: false,
        recaptchaToken: 'test-token'
      };

      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.path.includes('acceptTerms'))).toBe(true);
      }
    });
  });

  describe('Sign In Schema', () => {
    it('should validate correct signin data', () => {
      const validData = {
        email: 'john@example.com',
        password: 'password123',
        rememberMe: true,
        recaptchaToken: 'test-token'
      };

      const result = signInSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty email', () => {
      const invalidData = {
        email: '',
        password: 'password123',
        recaptchaToken: 'test-token'
      };

      const result = signInSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.path.includes('email'))).toBe(true);
      }
    });

    it('should reject empty password', () => {
      const invalidData = {
        email: 'john@example.com',
        password: '',
        recaptchaToken: 'test-token'
      };

      const result = signInSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.path.includes('password'))).toBe(true);
      }
    });
  });
});

describe('Password Strength Validation', () => {
  it('should require minimum 8 characters', () => {
    const shortPassword = 'Abc1!';
    const result = signUpSchema.safeParse({
      fullName: 'John Doe',
      email: 'john@example.com',
      password: shortPassword,
      confirmPassword: shortPassword,
      acceptTerms: true,
      recaptchaToken: 'test-token'
    });
    expect(result.success).toBe(false);
  });

  it('should require uppercase letter', () => {
    const noUppercase = 'lowercase123!';
    const result = signUpSchema.safeParse({
      fullName: 'John Doe',
      email: 'john@example.com',
      password: noUppercase,
      confirmPassword: noUppercase,
      acceptTerms: true,
      recaptchaToken: 'test-token'
    });
    expect(result.success).toBe(false);
  });

  it('should require lowercase letter', () => {
    const noLowercase = 'UPPERCASE123!';
    const result = signUpSchema.safeParse({
      fullName: 'John Doe',
      email: 'john@example.com',
      password: noLowercase,
      confirmPassword: noLowercase,
      acceptTerms: true,
      recaptchaToken: 'test-token'
    });
    expect(result.success).toBe(false);
  });

  it('should require number', () => {
    const noNumber = 'NoNumbers!';
    const result = signUpSchema.safeParse({
      fullName: 'John Doe',
      email: 'john@example.com',
      password: noNumber,
      confirmPassword: noNumber,
      acceptTerms: true,
      recaptchaToken: 'test-token'
    });
    expect(result.success).toBe(false);
  });

  it('should require special character', () => {
    const noSpecial = 'NoSpecial123';
    const result = signUpSchema.safeParse({
      fullName: 'John Doe',
      email: 'john@example.com',
      password: noSpecial,
      confirmPassword: noSpecial,
      acceptTerms: true,
      recaptchaToken: 'test-token'
    });
    expect(result.success).toBe(false);
  });
});


