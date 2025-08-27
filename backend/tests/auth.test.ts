import request from "supertest";
import { createApp } from "../src/app";
import { prisma } from "../src/prisma";
import bcrypt from "bcryptjs";

describe("auth flow", () => {
  beforeAll(async () => {
    // ensure a test user exists
    const hash = await bcrypt.hash("pass1234", 8);
    await prisma.user.upsert({
      where: { email: "authtest@lumpsum.in" },
      update: { password: hash, role: "USER" },
      create: { email: "authtest@lumpsum.in", password: hash, role: "USER" }
    });
  });

  it("login and refresh", async () => {
    const app = createApp();
    const login = await request(app)
      .post("/auth/login")
      .send({ email: "authtest@lumpsum.in", password: "pass1234" })
      .expect(200);
    expect(login.body.access).toBeTruthy();
    expect(login.body.refresh).toBeTruthy();

    const refresh = await request(app)
      .post("/auth/refresh")
      .send({ refresh: login.body.refresh })
      .expect(200);
    expect(refresh.body.access).toBeTruthy();
    expect(refresh.body.refresh).toBeTruthy();
  });
});
