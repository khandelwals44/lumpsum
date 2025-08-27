/**
 * Lightweight API client for the frontend.
 *
 * - If `NEXT_PUBLIC_API_BASE_URL` is set, requests are routed to that host (future external backend)
 * - Otherwise, requests are sent to local Next.js API routes (e.g. `/api/xxx`).
 *
 * Includes optional JWT Bearer support for calling the separate backend.
 */
import { getApiBaseUrl } from "./env.client";

/** In-memory auth token; persisted to localStorage in browsers. */
let AUTH_TOKEN: string | null = null;

/** Load token from localStorage (browser only). */
function initTokenFromStorage() {
  if (typeof window === "undefined") return;
  try {
    const t = window.localStorage.getItem("authToken");
    AUTH_TOKEN = t || null;
  } catch {}
}
initTokenFromStorage();

/**
 * Set a JWT bearer token for backend requests and persist it in localStorage.
 */
export function setAuthToken(token: string | null) {
  AUTH_TOKEN = token;
  if (typeof window !== "undefined") {
    if (token) window.localStorage.setItem("authToken", token);
    else window.localStorage.removeItem("authToken");
  }
}

/**
 * Get current JWT bearer token (if any).
 */
export function getAuthToken(): string | null {
  return AUTH_TOKEN;
}

/** Resolve a path to an absolute URL if a base is provided. */
function resolveUrl(path: string) {
  try {
    const apiBase = getApiBaseUrl();
    return apiBase ? new URL(path, apiBase).toString() : path;
  } catch {
    return path;
  }
}

/**
 * Perform a GET request.
 * @param path relative route (e.g. `/api/profile`)
 * @returns parsed JSON response
 * @example
 * const profile = await apiGet('/api/profile');
 */
export async function apiGet<T>(path: string): Promise<T> {
  const headers: Record<string, string> = {};
  if (AUTH_TOKEN) headers["Authorization"] = `Bearer ${AUTH_TOKEN}`;
  const res = await fetch(resolveUrl(path), { cache: "no-store", headers });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

/**
 * Send JSON body to an endpoint using a method.
 * @param path relative route
 * @param method HTTP verb
 * @param body arbitrary JSON
 * @returns parsed JSON response
 * @example
 * await apiSend('/api/goals','POST',{ name:'Retirement' })
 */
export async function apiSend<T>(
  path: string,
  method: "POST" | "PUT" | "DELETE",
  body?: any
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (AUTH_TOKEN) headers["Authorization"] = `Bearer ${AUTH_TOKEN}`;
  const res = await fetch(resolveUrl(path), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) throw new Error(`${method} ${path} failed: ${res.status}`);
  return res.json();
}

/** Domain-specific typed wrappers used by the app UI. */
export const Api = {
  /** Fetch the current user's profile. */
  getProfile: () => apiGet<any>("/api/profile"),
  /** Upsert the current user's profile. */
  updateProfile: (data: any) => apiSend<any>("/api/profile", "PUT", data),
  /** Retrieve goals. */
  getGoals: () => apiGet<any[]>("/api/goals"),
  /** Create a new goal. */
  createGoal: (data: any) => apiSend<any>("/api/goals", "POST", data),
  /** Update an existing goal. */
  updateGoal: (data: any) => apiSend<any>("/api/goals", "PUT", data),
  /** Delete a goal by id. */
  deleteGoal: (id: string) => apiSend<any>("/api/goals", "DELETE", { id }),
  /** List holdings. */
  getHoldings: () => apiGet<any[]>("/api/holdings"),
  /** Create a holding. */
  createHolding: (data: any) => apiSend<any>("/api/holdings", "POST", data),
  /** Update a holding. */
  updateHolding: (data: any) => apiSend<any>("/api/holdings", "PUT", data),
  /** Delete a holding. */
  deleteHolding: (id: string) => apiSend<any>("/api/holdings", "DELETE", { id }),
  /** Search funds with optional filters. */
  getFunds: (params?: { q?: string; category?: string; subCategory?: string }) => {
    const sp = new URLSearchParams();
    if (params?.q) sp.set("q", params.q);
    if (params?.category) sp.set("category", params.category);
    if (params?.subCategory) sp.set("subCategory", params.subCategory);
    const qs = sp.toString();
    return apiGet<any[]>(`/api/funds${qs ? `?${qs}` : ""}`);
  },
  /**
   * Persist a calculation to backend when `NEXT_PUBLIC_API_BASE_URL` and token are present.
   * Falls back to throwing if not available; caller may handle local storage fallback.
   */
  saveCalculation: (calcType: string, inputJson: any, outputJson: any) =>
    apiSend<any>("/calc-history", "POST", {
      calcType,
      inputJson: JSON.stringify(inputJson),
      outputJson: JSON.stringify(outputJson)
    }),
  /**
   * List previously saved calculations for the current user (requires auth token).
   */
  listCalculations: () => apiGet<any[]>("/calc-history")
};
