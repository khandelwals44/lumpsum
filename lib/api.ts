/**
 * Lightweight API client for the frontend.
 *
 * - If `NEXT_PUBLIC_API_BASE_URL` is set, requests are routed to that host (future external backend)
 * - Otherwise, requests are sent to local Next.js API routes (e.g. `/api/xxx`).
 */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

/** Resolve a path to an absolute URL if a base is provided. */
function resolveUrl(path: string) {
  try {
    return API_BASE ? new URL(path, API_BASE).toString() : path;
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
  const res = await fetch(resolveUrl(path), { cache: "no-store" });
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
  const res = await fetch(resolveUrl(path), {
    method,
    headers: { "Content-Type": "application/json" },
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
  }
};
