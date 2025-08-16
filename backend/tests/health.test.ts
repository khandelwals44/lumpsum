import request from "supertest";
import { createApp } from "../src/app";

describe("health endpoint", () => {
  it("returns ok", async () => {
    const app = createApp();
    const res = await request(app).get("/health").expect(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});
