import request from "supertest";
import { createApp } from "../src/app";
import { signAccessToken } from "../src/auth";

describe("/me and /calc-history endpoints", () => {
  it("rejects /me without auth", async () => {
    const app = createApp();
    await request(app).get("/me").expect(401);
  });

  it("returns user on /me with auth", async () => {
    const app = createApp();
    const token = signAccessToken("u1");
    const res = await request(app).get("/me").set("Authorization", `Bearer ${token}`).expect(200);
    expect(res.body).toHaveProperty("role");
  });

  it("saves and lists calc-history with auth", async () => {
    const app = createApp();
    const token = signAccessToken("u1");
    await request(app)
      .post("/calc-history")
      .set("Authorization", `Bearer ${token}`)
      .send({ calcType: "sip", inputJson: "{}", outputJson: "{}" })
      .expect(200);

    const list = await request(app)
      .get("/calc-history")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    expect(Array.isArray(list.body)).toBe(true);
  });
});
