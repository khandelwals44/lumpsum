import { describe, it, expect } from "vitest";

// This is a trivial sanity test of filtering logic, not full integration
import { GET as fundsGET } from "@/app/api/funds/route";

function req(url: string): Request {
  return new Request(url);
}

describe("/api/funds GET", () => {
  it("builds filters from query string without crashing", async () => {
    const res = await fundsGET(req("http://localhost/api/funds?q=blue&category=Equity"));
    // We cannot assert DB state here, but we can assert shape of NextResponse
    expect(res).toBeTruthy();
    expect(typeof (res as any).json).toBe("function");
  });
});
