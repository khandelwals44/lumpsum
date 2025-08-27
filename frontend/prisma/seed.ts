import { PrismaClient, Level } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Level mapping for dynamic level handling
const levelMap: Record<string, Level> = {
  BEGINNER: Level.BEGINNER,
  INTERMEDIATE: Level.INTERMEDIATE,
  ADVANCED: Level.ADVANCED,
};

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

  // Learning Chapters
  const learningChapters = [
    {
      title: "What are Mutual Funds?",
      slug: "what-are-mutual-funds",
      description: "Introduction to mutual funds and their basic concepts",
      content: `
# What are Mutual Funds?

A mutual fund is a type of investment vehicle that pools money from multiple investors to purchase a diversified portfolio of stocks, bonds, or other securities.

## Key Concepts

### 1. Professional Management
Mutual funds are managed by professional fund managers who make investment decisions on behalf of investors.

### 2. Diversification
By investing in a mutual fund, you get exposure to a wide range of securities, reducing individual stock risk.

### 3. NAV (Net Asset Value)
The price per unit of a mutual fund, calculated daily based on the total value of the fund's assets minus liabilities.

## Example
If you invest ₹10,000 in a fund with NAV ₹100, you get 100 units. If NAV increases to ₹110, your investment becomes ₹11,000.
      `,
      level: "BEGINNER",
      order: 1,
      estimatedTime: 10,
      category: "Basics",
      tags: JSON.stringify(["mutual funds", "basics", "introduction"])
    },
    {
      title: "Types of Mutual Funds",
      slug: "types-of-mutual-funds",
      description: "Understanding different categories of mutual funds",
      content: `
# Types of Mutual Funds

## 1. Equity Funds
Invest primarily in stocks and equity-related instruments.

### Large Cap Funds
- Invest in large, established companies
- Lower risk, stable returns
- Examples: HDFC Top 100, ICICI Prudential Bluechip

### Mid Cap Funds
- Invest in medium-sized companies
- Moderate risk and return potential
- Examples: HDFC Mid-Cap Opportunities, Axis Midcap

### Small Cap Funds
- Invest in small companies
- Higher risk, higher return potential
- Examples: Nippon India Small Cap, HDFC Small Cap

## 2. Debt Funds
Invest in fixed-income securities like bonds and government securities.

### Liquid Funds
- Ultra-short term investments
- High liquidity, low risk
- Examples: HDFC Liquid Fund, ICICI Prudential Liquid

### Corporate Bond Funds
- Invest in corporate bonds
- Moderate risk, better returns than liquid funds

## 3. Hybrid Funds
Mix of equity and debt instruments.

### Balanced Funds
- 60-70% equity, 30-40% debt
- Moderate risk and returns

### Conservative Hybrid
- 10-25% equity, 75-90% debt
- Lower risk than balanced funds
      `,
      level: "BEGINNER",
      order: 2,
      estimatedTime: 15,
      category: "Basics",
      tags: JSON.stringify(["equity", "debt", "hybrid", "fund types"])
    },
    {
      title: "SIP vs Lumpsum Investment",
      slug: "sip-vs-lumpsum",
      description: "Understanding Systematic Investment Plan vs one-time investment",
      content: `
# SIP vs Lumpsum Investment

## Systematic Investment Plan (SIP)

### What is SIP?
SIP is a method of investing a fixed amount regularly (monthly, quarterly) in a mutual fund.

### Advantages
1. **Rupee Cost Averaging**: Buy more units when prices are low
2. **Discipline**: Forces regular saving habit
3. **Lower Entry Barrier**: Start with as little as ₹500
4. **Reduces Timing Risk**: Don't need to time the market

### Example
Monthly SIP of ₹5,000 for 12 months:
- Month 1: NAV ₹100 → 50 units
- Month 6: NAV ₹80 → 62.5 units (more units at lower price)
- Month 12: NAV ₹120 → 41.67 units

## Lumpsum Investment

### What is Lumpsum?
Investing a large amount at once in a mutual fund.

### Advantages
1. **Higher Potential Returns**: If market timing is right
2. **Immediate Full Exposure**: Get complete market exposure
3. **Less Transaction Costs**: Single transaction

### When to Choose Lumpsum?
- Large windfall (bonus, inheritance)
- Market correction providing good entry point
- Short-term investment horizon

## Which is Better?

### For Beginners: SIP
- Start with SIP to build discipline
- Learn market behavior over time
- Lower risk of poor timing

### For Experienced Investors: Both
- Use lumpsum for market corrections
- Continue SIP for regular investments
      `,
      level: "INTERMEDIATE",
      order: 3,
      estimatedTime: 12,
      category: "Investment Strategies",
      tags: JSON.stringify(["SIP", "lumpsum", "investment strategy", "rupee cost averaging"])
    }
  ];

  // Create learning chapters
  for (const chapter of learningChapters) {
    await prisma.learningChapter.upsert({
      where: { slug: chapter.slug },
      update: {},
      create: {
        ...chapter,
        level: levelMap[chapter.level] ?? Level.BEGINNER
      }
    });
  }

  console.log(
    "Seed completed.\nAccounts created:\n- admin@lumpsum.in\n- subadmin@lumpsum.in\n- user@lumpsum.in\n\nLearning chapters created:",
    learningChapters.length
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
