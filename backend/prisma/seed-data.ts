import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  await prisma.user.deleteMany();
  await prisma.mutualFund.deleteMany();
  await prisma.learningChapter.deleteMany();

  // Create sample users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'demo@lumpsum.in',
        name: 'Demo User',
        password: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1m', // password: demo123
        role: 'USER',
        profile: {
          create: {
            age: 28,
            gender: 'Male',
            phone: '+91-9876543210',
            income: 800000,
            expenses: 400000,
            currentInvestments: 500000,
            location: 'Mumbai',
            riskAppetite: 'MODERATE',
            currentPortfolioValue: 500000,
            monthlySIPCapacity: 25000
          }
        }
      }
    }),
    prisma.user.create({
      data: {
        email: 'admin@lumpsum.in',
        name: 'Admin User',
        password: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1m',
        role: 'ADMIN'
      }
    })
  ]);

  console.log('✅ Created users:', users.length);

  // Create mutual funds data
  const mutualFunds = [
    {
      name: 'HDFC Mid-Cap Opportunities Fund',
      category: 'Equity',
      subCategory: 'Mid Cap',
      isin: 'INF179K01BE2',
      nav: 45.67,
      navDate: new Date(),
      expenseRatio: 1.85,
      fundSize: 25000,
      rating: 4,
      riskLevel: 'HIGH',
      minInvestment: 5000,
      exitLoad: '1% for redemption within 1 year'
    },
    {
      name: 'Axis Bluechip Fund',
      category: 'Equity',
      subCategory: 'Large Cap',
      isin: 'INF846K01E32',
      nav: 32.45,
      navDate: new Date(),
      expenseRatio: 1.75,
      fundSize: 18000,
      rating: 5,
      riskLevel: 'MODERATE',
      minInvestment: 5000,
      exitLoad: '1% for redemption within 1 year'
    },
    {
      name: 'SBI Small Cap Fund',
      category: 'Equity',
      subCategory: 'Small Cap',
      isin: 'INF200K01CP3',
      nav: 28.90,
      navDate: new Date(),
      expenseRatio: 1.95,
      fundSize: 12000,
      rating: 4,
      riskLevel: 'VERY_HIGH',
      minInvestment: 5000,
      exitLoad: '1% for redemption within 1 year'
    },
    {
      name: 'ICICI Prudential Balanced Advantage Fund',
      category: 'Hybrid',
      subCategory: 'Balanced',
      isin: 'INF109K01BG1',
      nav: 15.23,
      navDate: new Date(),
      expenseRatio: 1.65,
      fundSize: 35000,
      rating: 4,
      riskLevel: 'MODERATE',
      minInvestment: 5000,
      exitLoad: '1% for redemption within 1 year'
    },
    {
      name: 'Kotak Emerging Equity Fund',
      category: 'Equity',
      subCategory: 'Multi Cap',
      isin: 'INF109K01BG2',
      nav: 38.76,
      navDate: new Date(),
      expenseRatio: 1.80,
      fundSize: 22000,
      rating: 4,
      riskLevel: 'HIGH',
      minInvestment: 5000,
      exitLoad: '1% for redemption within 1 year'
    }
  ];

  const createdFunds = await Promise.all(
    mutualFunds.map(fund => prisma.mutualFund.create({ data: fund }))
  );

  console.log('✅ Created mutual funds:', createdFunds.length);

  // Create learning chapters
  const chapters = [
    {
      title: 'Introduction to Mutual Funds',
      content: `
# Introduction to Mutual Funds

## What are Mutual Funds?

A mutual fund is a type of investment vehicle consisting of a portfolio of stocks, bonds, or other securities. Mutual funds give small or individual investors access to diversified, professionally managed portfolios.

## Key Benefits

1. **Diversification**: Spread your risk across multiple investments
2. **Professional Management**: Expert fund managers handle your investments
3. **Liquidity**: Easy to buy and sell units
4. **Affordability**: Start with small amounts (₹500-₹1000)

## Types of Mutual Funds

### By Asset Class
- **Equity Funds**: Invest primarily in stocks
- **Debt Funds**: Invest in bonds and fixed income securities
- **Hybrid Funds**: Mix of equity and debt

### By Market Cap
- **Large Cap**: Large, established companies
- **Mid Cap**: Medium-sized companies
- **Small Cap**: Small, growing companies

## How to Choose a Fund

1. **Investment Goal**: Define your financial objectives
2. **Risk Appetite**: Assess your comfort with market volatility
3. **Time Horizon**: Consider your investment duration
4. **Fund Performance**: Review historical returns
5. **Expense Ratio**: Lower is generally better

## Getting Started

1. Complete KYC process
2. Choose your investment platform
3. Select suitable funds
4. Start with SIP (Systematic Investment Plan)
5. Monitor and review periodically
      `,
      order: 1,
      difficulty: 'BEGINNER',
      estimatedTime: 15,
      category: 'BASICS'
    },
    {
      title: 'Understanding Risk and Returns',
      content: `
# Understanding Risk and Returns

## Risk-Return Relationship

The fundamental principle of investing: **Higher potential returns come with higher risk**.

## Types of Risk

### 1. Market Risk
- Fluctuations in market prices
- Affects all investments
- Cannot be eliminated completely

### 2. Credit Risk
- Risk of issuer defaulting
- Higher in debt instruments
- Can be mitigated through diversification

### 3. Liquidity Risk
- Difficulty in selling quickly
- May result in lower prices
- Important for emergency funds

### 4. Inflation Risk
- Purchasing power erosion
- Affects long-term goals
- Equity investments help combat this

## Measuring Risk

### Standard Deviation
- Measures price volatility
- Higher value = more volatile
- Compare within same category

### Beta
- Measures market sensitivity
- Beta > 1: More volatile than market
- Beta < 1: Less volatile than market

## Expected Returns

### Historical Returns
- Past performance data
- Not guaranteed for future
- Use as reference only

### Risk-Adjusted Returns
- Returns per unit of risk
- Sharpe Ratio, Sortino Ratio
- Better comparison metric

## Risk Management Strategies

1. **Diversification**: Spread across different assets
2. **Asset Allocation**: Mix of equity, debt, gold
3. **Regular Rebalancing**: Maintain target allocation
4. **Systematic Investing**: Average out market cycles
5. **Long-term Perspective**: Ride out short-term volatility
      `,
      order: 2,
      difficulty: 'BEGINNER',
      estimatedTime: 20,
      category: 'BASICS'
    },
    {
      title: 'Systematic Investment Plan (SIP)',
      content: `
# Systematic Investment Plan (SIP)

## What is SIP?

SIP is a disciplined approach to investing where you invest a fixed amount regularly (monthly/weekly) in mutual funds.

## Benefits of SIP

### 1. Rupee Cost Averaging
- Buy more units when prices are low
- Buy fewer units when prices are high
- Reduces average cost per unit

### 2. Disciplined Investing
- Automatic investment process
- Reduces emotional decisions
- Builds wealth systematically

### 3. Power of Compounding
- Reinvestment of returns
- Exponential growth over time
- Start early for maximum benefit

### 4. Flexibility
- Start with small amounts (₹500)
- Increase/decrease as needed
- Pause/resume anytime

## SIP vs Lump Sum

| Aspect | SIP | Lump Sum |
|--------|-----|----------|
| Risk | Lower | Higher |
| Returns | Moderate | Potentially Higher |
| Discipline | High | Requires self-control |
| Market Timing | Not critical | Critical |

## SIP Calculator Example

**Monthly Investment**: ₹10,000
**Expected Return**: 12% p.a.
**Time Period**: 10 years

**Total Investment**: ₹12,00,000
**Expected Value**: ₹23,00,000
**Wealth Gained**: ₹11,00,000

## Best Practices

1. **Start Early**: Time is your biggest ally
2. **Be Consistent**: Don't stop during market falls
3. **Increase Regularly**: Step-up your SIP amount
4. **Choose Right Funds**: Based on goals and risk
5. **Review Periodically**: Adjust as needed

## Common Mistakes

- Stopping SIP during market downturns
- Not increasing SIP with income growth
- Choosing funds without research
- Expecting immediate returns
- Not having clear goals
      `,
      order: 3,
      difficulty: 'INTERMEDIATE',
      estimatedTime: 25,
      category: 'INVESTMENT_STRATEGIES'
    }
  ];

  const createdChapters = await Promise.all(
    chapters.map(chapter => prisma.learningChapter.create({ data: chapter }))
  );

  console.log('✅ Created learning chapters:', createdChapters.length);

  // Create sample investment goals for demo user
  const demoUser = users[0];
  const goals = await Promise.all([
    prisma.investmentGoal.create({
      data: {
        userId: demoUser.id,
        name: 'Child Education Fund',
        targetAmount: 5000000,
        timeHorizon: 15,
        priority: 'HIGH',
        currentSavings: 500000,
        monthlyContribution: 15000,
        goalType: 'EDUCATION',
        riskProfile: 'MODERATE'
      }
    }),
    prisma.investmentGoal.create({
      data: {
        userId: demoUser.id,
        name: 'Retirement Corpus',
        targetAmount: 20000000,
        timeHorizon: 25,
        priority: 'HIGH',
        currentSavings: 1000000,
        monthlyContribution: 25000,
        goalType: 'RETIREMENT',
        riskProfile: 'MODERATE'
      }
    }),
    prisma.investmentGoal.create({
      data: {
        userId: demoUser.id,
        name: 'House Down Payment',
        targetAmount: 2000000,
        timeHorizon: 5,
        priority: 'MEDIUM',
        currentSavings: 300000,
        monthlyContribution: 20000,
        goalType: 'HOUSE',
        riskProfile: 'LOW'
      }
    })
  ]);

  console.log('✅ Created investment goals:', goals.length);

  // Create sample portfolio holdings
  const holdings = await Promise.all([
    prisma.portfolioHolding.create({
      data: {
        userId: demoUser.id,
        fundId: createdFunds[0].id,
        units: 1000,
        avgCost: 42.50,
        currentValue: 45670,
        sipAmount: 5000,
        sipDate: 5, // 5th of every month
        purchaseDate: new Date('2023-01-15')
      }
    }),
    prisma.portfolioHolding.create({
      data: {
        userId: demoUser.id,
        fundId: createdFunds[1].id,
        units: 1500,
        avgCost: 30.00,
        currentValue: 48675,
        sipAmount: 7500,
        sipDate: 10, // 10th of every month
        purchaseDate: new Date('2023-02-20')
      }
    }),
    prisma.portfolioHolding.create({
      data: {
        userId: demoUser.id,
        fundId: createdFunds[3].id,
        units: 2000,
        avgCost: 14.50,
        currentValue: 30460,
        sipAmount: 0, // No SIP, lump sum investment
        purchaseDate: new Date('2023-03-10')
      }
    })
  ]);

  console.log('✅ Created portfolio holdings:', holdings.length);

  // Create sample calculation history
  const calculations = await Promise.all([
    prisma.calculationHistory.create({
      data: {
        userId: demoUser.id,
        calcType: 'SIP',
        inputJson: JSON.stringify({
          monthlyInvestment: 10000,
          expectedReturn: 12,
          timePeriod: 10
        }),
        outputJson: JSON.stringify({
          totalInvestment: 1200000,
          expectedValue: 2300000,
          wealthGained: 1100000
        })
      }
    }),
    prisma.calculationHistory.create({
      data: {
        userId: demoUser.id,
        calcType: 'GOAL_PLANNER',
        inputJson: JSON.stringify({
          targetAmount: 5000000,
          timeHorizon: 15,
          currentSavings: 500000
        }),
        outputJson: JSON.stringify({
          monthlyContribution: 15000,
          expectedReturn: 12,
          totalContribution: 2700000
        })
      }
    })
  ]);

  console.log('✅ Created calculation history:', calculations.length);

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`- Users: ${users.length}`);
  console.log(`- Mutual Funds: ${createdFunds.length}`);
  console.log(`- Learning Chapters: ${createdChapters.length}`);
  console.log(`- Investment Goals: ${goals.length}`);
  console.log(`- Portfolio Holdings: ${holdings.length}`);
  console.log(`- Calculations: ${calculations.length}`);

  console.log('\n🔑 Demo Login Credentials:');
  console.log('Email: demo@lumpsum.in');
  console.log('Password: demo123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });