import { PrismaClient, LearningLevel, LearningCategory } from '@prisma/client';

const prisma = new PrismaClient();

const learningChapters = [
  // Mutual Fund Basics (5 chapters)
  {
    title: "What are Mutual Funds?",
    slug: "what-are-mutual-funds",
    description: "Introduction to mutual funds and their basic concepts",
    content: `
# What are Mutual Funds?

Mutual funds are investment vehicles that pool money from multiple investors to purchase a diversified portfolio of stocks, bonds, or other securities. They are managed by professional fund managers who make investment decisions on behalf of the investors.

## Key Features:
- **Diversification**: Reduces risk by investing in multiple securities
- **Professional Management**: Expert fund managers handle investments
- **Liquidity**: Easy to buy and sell units
- **Affordability**: Start with small amounts (as low as ₹500)
- **Transparency**: Regular updates on portfolio and performance

## How Mutual Funds Work:
1. **Collection**: Fund house collects money from investors
2. **Investment**: Professional managers invest in various securities
3. **Units**: Investors receive units based on their investment
4. **Returns**: Profits/losses are distributed proportionally
5. **NAV**: Net Asset Value reflects the current value per unit

## Example:
If you invest ₹10,000 in a fund with NAV ₹100, you get 100 units. If NAV increases to ₹110, your investment becomes ₹11,000.
    `,
    level: LearningLevel.BEGINNER,
    order: 1,
    estimatedTime: 10,
    category: LearningCategory.BASICS,
    tags: JSON.stringify(["basics", "introduction", "fundamentals"])
  },
  {
    title: "Types of Mutual Funds",
    slug: "types-of-mutual-funds",
    description: "Different categories and classifications of mutual funds",
    content: `
# Types of Mutual Funds

Mutual funds can be classified based on various criteria:

## By Asset Class:
### 1. Equity Funds
- Invest primarily in stocks
- Higher risk, higher potential returns
- Suitable for long-term goals (5+ years)

### 2. Debt Funds
- Invest in bonds and fixed-income securities
- Lower risk, moderate returns
- Suitable for short to medium-term goals

### 3. Hybrid Funds
- Mix of equity and debt instruments
- Balanced risk and returns
- Good for moderate risk tolerance

## By Market Cap (Equity Funds):
### Large Cap Funds
- Invest in top 100 companies by market cap
- Stable, established companies
- Lower volatility

### Mid Cap Funds
- Invest in companies ranked 101-250
- Growth potential with moderate risk
- Higher volatility than large cap

### Small Cap Funds
- Invest in companies beyond top 250
- High growth potential
- Highest volatility and risk

## By Investment Style:
### Growth Funds
- Focus on companies with high growth potential
- Higher risk, higher returns

### Value Funds
- Invest in undervalued companies
- Lower risk, steady returns

### Index Funds
- Track specific market indices (Nifty 50, Sensex)
- Low expense ratio
- Passive management
    `,
    level: LearningLevel.BEGINNER,
    order: 2,
    estimatedTime: 15,
    category: LearningCategory.BASICS,
    tags: JSON.stringify(["types", "classification", "equity", "debt", "hybrid"])
  },
  {
    title: "Understanding NAV and Returns",
    slug: "understanding-nav-and-returns",
    description: "Learn about NAV calculation and different types of returns",
    content: `
# Understanding NAV and Returns

## What is NAV?
Net Asset Value (NAV) is the price per unit of a mutual fund. It represents the current market value of the fund's portfolio minus expenses, divided by the number of outstanding units.

## NAV Calculation:
NAV = (Total Assets - Total Liabilities) / Number of Outstanding Units

## Example:
- Fund's total assets: ₹100 crore
- Fund's liabilities: ₹2 crore
- Outstanding units: 10 crore
- NAV = (100 - 2) / 10 = ₹9.8 per unit

## Types of Returns:

### 1. Absolute Returns
- Simple percentage gain/loss
- Formula: ((Current NAV - Initial NAV) / Initial NAV) × 100

### 2. Annualized Returns
- Returns calculated on a yearly basis
- Accounts for time period
- More accurate for comparison

### 3. CAGR (Compound Annual Growth Rate)
- Average annual growth rate over a period
- Accounts for compounding effect
- Best measure for long-term performance

## Example Calculation:
- Investment: ₹10,000
- Initial NAV: ₹100
- Current NAV: ₹150
- Time period: 3 years

**Absolute Return**: ((150 - 100) / 100) × 100 = 50%
**CAGR**: ((150/100)^(1/3) - 1) × 100 = 14.47%

## Important Points:
- NAV changes daily based on market performance
- Past performance doesn't guarantee future returns
- Compare funds within the same category
- Consider expense ratio impact on returns
    `,
    level: LearningLevel.BEGINNER,
    order: 3,
    estimatedTime: 12,
    category: LearningCategory.BASICS,
    tags: JSON.stringify(["nav", "returns", "cagr", "calculation"])
  },
  {
    title: "Expense Ratio and Charges",
    slug: "expense-ratio-and-charges",
    description: "Understanding mutual fund fees and their impact on returns",
    content: `
# Expense Ratio and Charges

## What is Expense Ratio?
Expense ratio is the annual fee charged by the fund house to manage your investments. It's expressed as a percentage of the fund's average net assets.

## Components of Expense Ratio:

### 1. Management Fee
- Paid to fund managers
- Usually 0.5% to 2% of assets

### 2. Administrative Costs
- Office expenses, legal fees
- Technology and operational costs

### 3. Marketing and Distribution
- Advertising and promotional expenses
- Commission to distributors

## Impact on Returns:
A 1% expense ratio means ₹1 is deducted for every ₹100 invested annually.

**Example:**
- Investment: ₹1,00,000
- Expense ratio: 1.5%
- Annual cost: ₹1,500
- Over 10 years: ₹15,000 (excluding compounding)

## Other Charges:

### 1. Entry Load (Currently 0%)
- Previously charged when buying units
- Now banned by SEBI

### 2. Exit Load
- Charged when selling units within specified period
- Usually 1% if redeemed within 1 year
- Reduces to 0% after holding period

### 3. Transaction Charges
- ₹150 for investments above ₹10,000
- ₹100 for investments below ₹10,000

## How to Choose:
- Lower expense ratio = Higher net returns
- Index funds have lowest expense ratios (0.1-0.5%)
- Actively managed funds have higher ratios (1-2%)
- Compare within same category
    `,
    level: LearningLevel.BEGINNER,
    order: 4,
    estimatedTime: 10,
    category: LearningCategory.BASICS,
    tags: JSON.stringify(["expense ratio", "charges", "fees", "costs"])
  },
  {
    title: "Risk and Volatility",
    slug: "risk-and-volatility",
    description: "Understanding risk factors and volatility in mutual funds",
    content: `
# Risk and Volatility in Mutual Funds

## Understanding Risk:
Risk is the possibility of losing money or not achieving expected returns. All investments carry some level of risk.

## Types of Risk:

### 1. Market Risk
- Risk of losing money due to market fluctuations
- Affects all equity investments
- Cannot be eliminated completely

### 2. Credit Risk
- Risk of issuer defaulting on payments
- Higher in debt funds
- Lower in government securities

### 3. Interest Rate Risk
- Risk of bond prices falling when interest rates rise
- Affects debt funds
- Longer duration = Higher risk

### 4. Liquidity Risk
- Risk of not being able to sell quickly
- Lower in large cap funds
- Higher in small cap funds

## Measuring Risk:

### 1. Standard Deviation
- Measures volatility of returns
- Higher SD = Higher risk
- Compare within same category

### 2. Beta
- Measures sensitivity to market movements
- Beta > 1: More volatile than market
- Beta < 1: Less volatile than market

### 3. Sharpe Ratio
- Risk-adjusted returns
- Higher ratio = Better risk-adjusted performance

## Risk-Return Relationship:
- Higher risk = Higher potential returns
- Lower risk = Lower potential returns
- Choose based on:
  - Investment horizon
  - Risk tolerance
  - Financial goals

## Risk Management:
- Diversification across asset classes
- Regular rebalancing
- Long-term investment approach
- Avoid timing the market
    `,
    level: LearningLevel.BEGINNER,
    order: 5,
    estimatedTime: 12,
    category: LearningCategory.BASICS,
    tags: JSON.stringify(["risk", "volatility", "standard deviation", "beta"])
  }
];

async function main() {
  console.log('🌱 Seeding learning content...');

  // Create learning chapters
  for (const chapter of learningChapters) {
    await prisma.learningChapter.upsert({
      where: { slug: chapter.slug },
      update: chapter,
      create: chapter
    });
  }

  console.log('✅ Learning content seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding learning content:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
