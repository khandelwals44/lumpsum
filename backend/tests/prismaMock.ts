// Basic mock for @prisma/client to avoid ESM loader issues in Jest.
// Only the methods used in tests are implemented.
import bcrypt from "bcryptjs";
const fn = <T extends (...args: any[]) => any>(impl: T): T => impl as unknown as T;

export class PrismaClient {
  user = {
    upsert: fn(async ({ where }: any) => ({
      id: "u1",
      email: where.email,
      role: "USER",
      password: ""
    })),
    findUnique: fn(async ({ where }: any) => {
      const email = where.email ?? "user@lumpsum.in";
      const id = where.id ?? "u1";
      const hash = bcrypt.hashSync("pass1234", 8);
      return { id, email, role: "USER", password: hash };
    })
  };
  refreshToken = {
    create: fn(async ({ data }: any) => ({ ...data })),
    findUnique: fn(async () => ({
      userId: "u1",
      token: "r1",
      expiresAt: new Date(Date.now() + 10000)
    })),
    update: fn(async () => ({}))
  };
  calculationHistory = {
    findMany: fn(async () => []),
    create: fn(async ({ data }: any) => data)
  };
}

export default { PrismaClient };
