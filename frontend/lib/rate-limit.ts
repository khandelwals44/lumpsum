interface RateLimitConfig {
  interval: number;
  uniqueTokenPerInterval: number;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// Simple in-memory rate limiter (for production, use Redis)
const tokens = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(config: RateLimitConfig) {
  return {
    async check(limit: number, identifier: string): Promise<RateLimitResult> {
      const now = Date.now();
      const key = `${identifier}:${Math.floor(now / config.interval)}`;
      
      const current = tokens.get(key);
      
      if (!current || now > current.resetTime) {
        tokens.set(key, { count: 1, resetTime: now + config.interval });
        return {
          success: true,
          limit,
          remaining: limit - 1,
          reset: now + config.interval
        };
      }
      
      if (current.count >= limit) {
        return {
          success: false,
          limit,
          remaining: 0,
          reset: current.resetTime
        };
      }
      
      current.count++;
      return {
        success: true,
        limit,
        remaining: limit - current.count,
        reset: current.resetTime
      };
    }
  };
}

