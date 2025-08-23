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
    }),
    deleteMany: fn(async () => ({ count: 0 })),
    create: fn(async ({ data }: any) => ({ id: "u1", ...data })),
    update: fn(async ({ data }: any) => ({ id: "u1", ...data }))
  };
  refreshToken = {
    create: fn(async ({ data }: any) => ({ ...data })),
    findUnique: fn(async () => ({
      userId: "u1",
      token: "r1",
      expiresAt: new Date(Date.now() + 10000)
    })),
    update: fn(async () => ({})),
    deleteMany: fn(async () => ({ count: 0 }))
  };
  calculationHistory = {
    findMany: fn(async () => []),
    create: fn(async ({ data }: any) => ({ id: "ch1", ...data })),
    deleteMany: fn(async () => ({ count: 0 }))
  };
  learningChapter = {
    findMany: fn(async () => [
      {
        id: "lc1",
        title: "Test Chapter",
        slug: "test-chapter",
        description: "Test description",
        level: "BEGINNER",
        category: "BASICS",
        order: 1,
        estimatedTime: 10
      }
    ]),
    findUnique: fn(async ({ where }: any) => ({
      id: where.id,
      title: "Test Chapter",
      content: { sections: [] },
      quizzes: []
    })),
    deleteMany: fn(async () => ({ count: 0 }))
  };
  chapterQuiz = {
    deleteMany: fn(async () => ({ count: 0 }))
  };
  userLearningProgress = {
    findMany: fn(async () => []),
    upsert: fn(async ({ create }: any) => ({ id: "ulp1", ...create })),
    deleteMany: fn(async () => ({ count: 0 }))
  };
  userBookmark = {
    findMany: fn(async () => []),
    create: fn(async ({ data }: any) => ({ id: "ub1", ...data })),
    delete: fn(async () => ({ id: "ub1" })),
    deleteMany: fn(async () => ({ count: 0 }))
  };
  userQuizAnswer = {
    upsert: fn(async ({ create }: any) => ({ id: "uqa1", ...create })),
    deleteMany: fn(async () => ({ count: 0 }))
  };
  userBadge = {
    findMany: fn(async () => []),
    deleteMany: fn(async () => ({ count: 0 }))
  };
  investorGuide = {
    findMany: fn(async () => []),
    create: fn(async ({ data }: any) => ({ id: "ig1", ...data })),
    deleteMany: fn(async () => ({ count: 0 }))
  };
  investmentGoal = {
    findMany: fn(async () => []),
    create: fn(async ({ data }: any) => ({ id: "igl1", ...data })),
    deleteMany: fn(async () => ({ count: 0 }))
  };
  userProfile = {
    findUnique: fn(async () => null),
    upsert: fn(async ({ create }: any) => ({ id: "up1", ...create })),
    deleteMany: fn(async () => ({ count: 0 }))
  };
  
  $disconnect = fn(async () => {});
}

export default { PrismaClient };
