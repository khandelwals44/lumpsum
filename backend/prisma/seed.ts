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

  // Mutual Funds (sample realistic set)
  const fundsData = [
    {
      name: "ICICI Prudential Bluechip Fund",
      category: "Equity",
      subCategory: "Large Cap",
      assetClass: "equity",
      riskLevel: "moderate",
      expenseRatio: 1.75,
      nav: 67.89,
      fundSize: 25000,
      minInvestment: 100,
      benchmark: "NIFTY 100 TRI",
      fundManager: "Team ICICI",
      inceptionDate: new Date("2015-05-01"),
      oneYearReturn: 15.2,
      threeYearReturn: 18.9,
      fiveYearReturn: 16.5
    },
    {
      name: "HDFC Mid-Cap Opportunities Fund",
      category: "Equity",
      subCategory: "Mid Cap",
      assetClass: "equity",
      riskLevel: "high",
      expenseRatio: 1.85,
      nav: 45.67,
      fundSize: 15000,
      minInvestment: 100,
      benchmark: "NIFTY Midcap 150 TRI",
      fundManager: "Team HDFC",
      inceptionDate: new Date("2014-04-01"),
      oneYearReturn: 18.5,
      threeYearReturn: 22.3,
      fiveYearReturn: 19.8
    },
    {
      name: "Axis Bluechip Fund",
      category: "Equity",
      subCategory: "Large Cap",
      assetClass: "equity",
      riskLevel: "moderate",
      expenseRatio: 1.65,
      nav: 52.34,
      fundSize: 18000,
      minInvestment: 100,
      benchmark: "S&P BSE 100 TRI",
      fundManager: "Team Axis",
      inceptionDate: new Date("2016-06-01"),
      oneYearReturn: 16.8,
      threeYearReturn: 19.2,
      fiveYearReturn: 17.1
    },
    {
      name: "SBI Magnum Gilt Fund",
      category: "Debt",
      subCategory: "Gilt",
      assetClass: "debt",
      riskLevel: "low",
      expenseRatio: 0.6,
      nav: 32.1,
      fundSize: 9000,
      minInvestment: 100,
      benchmark: "CRISIL Government Bond Index",
      fundManager: "Team SBI",
      inceptionDate: new Date("2012-01-01"),
      oneYearReturn: 7.1,
      threeYearReturn: 6.9,
      fiveYearReturn: 7.4
    },
    {
      name: "Mirae Asset Hybrid Equity Fund",
      category: "Hybrid",
      subCategory: "Aggressive Hybrid",
      assetClass: "hybrid",
      riskLevel: "moderate",
      expenseRatio: 1.2,
      nav: 28.45,
      fundSize: 6000,
      minInvestment: 100,
      benchmark: "CRISIL Hybrid 35+65 Aggressive Index",
      fundManager: "Team Mirae",
      inceptionDate: new Date("2017-08-01"),
      oneYearReturn: 12.4,
      threeYearReturn: 13.7,
      fiveYearReturn: 12.9
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
        units: 120.5,
        avgCost: 50,
        sipAmount: 5000
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
