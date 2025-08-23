import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Users
  const [adminPass, subPass, userPass] = await Promise.all([
    bcrypt.hash("admin123", 10),
    bcrypt.hash("subadmin123", 10),
    bcrypt.hash("user123", 10)
  ]);

  const admin = await prisma.user.upsert({
    where: { email: "admin@lumpsum.in" },
    update: {},
    create: { email: "admin@lumpsum.in", name: "Admin", password: adminPass, role: "ADMIN" }
  });
  const subadmin = await prisma.user.upsert({
    where: { email: "subadmin@lumpsum.in" },
    update: {},
    create: { email: "subadmin@lumpsum.in", name: "Sub Admin", password: subPass, role: "SUBADMIN" }
  });
  const user = await prisma.user.upsert({
    where: { email: "user@lumpsum.in" },
    update: {},
    create: { email: "user@lumpsum.in", name: "Normal User", password: userPass, role: "USER" }
  });

  // Mutual Funds (simplified for current schema)
  const fundsData = [
    {
      name: "ICICI Prudential Bluechip Fund",
      category: "Equity",
      subCategory: "Large Cap",
      nav: 67.89,
      navDate: new Date(),
      isActive: true
    },
    {
      name: "HDFC Mid-Cap Opportunities Fund",
      category: "Equity",
      subCategory: "Mid Cap",
      nav: 45.67,
      navDate: new Date(),
      isActive: true
    },
    {
      name: "Axis Bluechip Fund",
      category: "Equity",
      subCategory: "Large Cap",
      nav: 52.34,
      navDate: new Date(),
      isActive: true
    },
    {
      name: "SBI Magnum Gilt Fund",
      category: "Debt",
      subCategory: "Gilt",
      nav: 32.1,
      navDate: new Date(),
      isActive: true
    },
    {
      name: "Mirae Asset Hybrid Equity Fund",
      category: "Hybrid",
      subCategory: "Aggressive Hybrid",
      nav: 28.45,
      navDate: new Date(),
      isActive: true
    }
  ];

  await prisma.mutualFund.deleteMany({});
  await prisma.mutualFund.createMany({ data: fundsData });

  // Sample holdings for user
  const firstFund = await prisma.mutualFund.findFirst({ where: { subCategory: "Large Cap" } });
  if (firstFund) {
    await prisma.portfolioHolding.create({
      data: {
        userId: user.id,
        fundId: firstFund.id,
        fundName: firstFund.name,
        fundCategory: firstFund.category,
        fundSubCategory: firstFund.subCategory,
        units: 120.5,
        nav: firstFund.nav,
        currentValue: 120.5 * firstFund.nav,
        purchaseDate: new Date()
      }
    });
  }

  // Sample goal
  await prisma.investmentGoal.create({
    data: {
      userId: user.id,
      name: "Retirement",
      targetAmount: 5000000,
      timeHorizon: 20,
      priority: "high",
      currentSavings: 250000,
      monthlyContribution: 15000,
      projectedValue: 3200000,
      requiredMonthlyInvestment: 12000,
      deadline: new Date(new Date().getFullYear() + 20, 0, 1)
    }
  });

  console.log(
    "Seed completed.\nAccounts:\n- admin@lumpsum.in / admin123\n- subadmin@lumpsum.in / subadmin123\n- user@lumpsum.in / user123"
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
