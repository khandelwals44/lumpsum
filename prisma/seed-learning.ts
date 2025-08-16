import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const chapters = [
  // BEGINNER - BASICS
  {
    title: "What is a Mutual Fund?",
    slug: "what-is-mutual-fund",
    description:
      "Learn the fundamental concept of mutual funds and how they work as investment vehicles.",
    content: JSON.stringify({
      sections: [
        {
          id: "intro",
          title: "Introduction to Mutual Funds",
          content:
            "A mutual fund is a type of investment vehicle that pools money from multiple investors to purchase a diversified portfolio of stocks, bonds, or other securities. This allows individual investors to access a professionally managed, diversified portfolio that would be difficult to create on their own.",
          type: "text"
        },
        {
          id: "structure",
          title: "How Mutual Funds Work",
          content:
            "Mutual funds are managed by professional fund managers who make investment decisions on behalf of the fund's shareholders. The fund's portfolio is structured according to its investment objective, which could be growth, income, or a combination of both.",
          type: "text"
        },
        {
          id: "example",
          title: "Real-World Example",
          content:
            "Imagine you want to invest in the stock market but don't have enough money to buy shares of multiple companies. A mutual fund allows you to invest ₹5,000 and own a small piece of a portfolio that might contain 50-100 different stocks.",
          type: "example"
        }
      ]
    }),
    level: "BEGINNER",
    category: "BASICS",
    order: 1,
    estimatedTime: 15
  },
  {
    title: "SIP vs Lumpsum Investment",
    slug: "sip-vs-lumpsum",
    description:
      "Understand the differences between Systematic Investment Plans (SIP) and lumpsum investments.",
    content: JSON.stringify({
      sections: [
        {
          id: "sip",
          title: "Systematic Investment Plan (SIP)",
          content:
            "SIP allows you to invest a fixed amount regularly (monthly, quarterly) in a mutual fund. This approach helps in rupee cost averaging and reduces the impact of market volatility.",
          type: "text"
        },
        {
          id: "lumpsum",
          title: "Lumpsum Investment",
          content:
            "Lumpsum investment involves investing a large amount at once. This approach is suitable when you have a significant amount of money available and want to invest it immediately.",
          type: "text"
        },
        {
          id: "comparison",
          title: "SIP vs Lumpsum Comparison",
          content:
            "SIP is better for regular income earners who want to invest systematically, while lumpsum is suitable for those with large amounts to invest at once.",
          type: "comparison"
        }
      ]
    }),
    level: "BEGINNER",
    category: "BASICS",
    order: 2,
    estimatedTime: 20
  },
  {
    title: "Understanding NAV (Net Asset Value)",
    slug: "understanding-nav",
    description:
      "Learn what NAV is, how it's calculated, and why it's important for mutual fund investors.",
    content: JSON.stringify({
      sections: [
        {
          id: "definition",
          title: "What is NAV?",
          content:
            "NAV (Net Asset Value) is the price per unit of a mutual fund. It represents the total value of the fund's assets minus its liabilities, divided by the number of outstanding units.",
          type: "text"
        },
        {
          id: "calculation",
          title: "NAV Calculation",
          content:
            "NAV = (Total Assets - Total Liabilities) / Number of Outstanding Units. NAV is calculated at the end of each trading day.",
          type: "formula"
        },
        {
          id: "importance",
          title: "Why NAV Matters",
          content:
            "NAV helps investors understand the current value of their investment and compare different mutual funds. However, NAV alone shouldn't be the only factor in investment decisions.",
          type: "text"
        }
      ]
    }),
    level: "BEGINNER",
    category: "BASICS",
    order: 3,
    estimatedTime: 18
  },
  // INTERMEDIATE - INVESTMENT
  {
    title: "Expense Ratio and Fund Costs",
    slug: "expense-ratio-fund-costs",
    description:
      "Understand the various costs associated with mutual fund investments and how they impact returns.",
    content: JSON.stringify({
      sections: [
        {
          id: "expense-ratio",
          title: "What is Expense Ratio?",
          content:
            "Expense ratio is the annual fee charged by mutual funds to cover operating expenses. It's expressed as a percentage of the fund's average net assets.",
          type: "text"
        },
        {
          id: "components",
          title: "Components of Expense Ratio",
          content:
            "Expense ratio includes management fees, administrative costs, marketing expenses, and other operational costs. Lower expense ratios generally mean higher returns for investors.",
          type: "text"
        },
        {
          id: "impact",
          title: "Impact on Returns",
          content:
            "A 1% expense ratio means ₹1,000 is deducted from every ₹1,00,000 invested annually. Over time, this can significantly impact your total returns.",
          type: "example"
        }
      ]
    }),
    level: "INTERMEDIATE",
    category: "INVESTMENT",
    order: 4,
    estimatedTime: 25
  },
  {
    title: "Taxation of Mutual Funds",
    slug: "taxation-mutual-funds",
    description:
      "Learn about the tax implications of mutual fund investments including capital gains and dividend taxation.",
    content: JSON.stringify({
      sections: [
        {
          id: "capital-gains",
          title: "Capital Gains Tax",
          content:
            "Capital gains from mutual funds are taxed based on the holding period. Short-term gains (less than 1 year for equity funds) are taxed at 15%, while long-term gains have different rates.",
          type: "text"
        },
        {
          id: "dividend-tax",
          title: "Dividend Distribution Tax",
          content:
            "Dividends from mutual funds are now taxed in the hands of investors according to their income tax slab rates.",
          type: "text"
        },
        {
          id: "tax-saving",
          title: "Tax-Saving Options",
          content:
            "ELSS (Equity Linked Saving Scheme) funds offer tax benefits under Section 80C of the Income Tax Act.",
          type: "text"
        }
      ]
    }),
    level: "INTERMEDIATE",
    category: "INVESTMENT",
    order: 5,
    estimatedTime: 30
  },
  // ADVANCED - RESEARCH
  {
    title: "Portfolio Construction and Asset Allocation",
    slug: "portfolio-construction-asset-allocation",
    description: "Learn advanced concepts of building a diversified investment portfolio.",
    content: JSON.stringify({
      sections: [
        {
          id: "asset-allocation",
          title: "Asset Allocation Strategy",
          content:
            "Asset allocation involves dividing your investment portfolio among different asset categories such as stocks, bonds, and cash. The allocation should be based on your risk tolerance, time horizon, and financial goals.",
          type: "text"
        },
        {
          id: "diversification",
          title: "Diversification Benefits",
          content:
            "Diversification reduces risk by spreading investments across different assets, sectors, and geographies. It helps minimize the impact of poor performance in any single investment.",
          type: "text"
        },
        {
          id: "rebalancing",
          title: "Portfolio Rebalancing",
          content:
            "Regular rebalancing ensures your portfolio maintains the desired asset allocation. This involves buying and selling assets to restore the original allocation percentages.",
          type: "text"
        }
      ]
    }),
    level: "ADVANCED",
    category: "RESEARCH",
    order: 6,
    estimatedTime: 35
  }
];

const quizzes = [
  {
    chapterId: "what-is-mutual-fund",
    question: "What is the primary purpose of a mutual fund?",
    options: JSON.stringify([
      "To provide loans to individuals",
      "To pool money from multiple investors for diversified investments",
      "To offer insurance products",
      "To provide banking services"
    ]),
    correctAnswer: 1,
    explanation:
      "Mutual funds pool money from multiple investors to create a diversified portfolio of investments, allowing individual investors to access professional management and diversification.",
    order: 1
  },
  {
    chapterId: "what-is-mutual-fund",
    question: "Who manages a mutual fund's investments?",
    options: JSON.stringify([
      "Individual investors",
      "Professional fund managers",
      "Bank officials",
      "Insurance agents"
    ]),
    correctAnswer: 1,
    explanation:
      "Professional fund managers with expertise in financial markets manage mutual fund investments on behalf of the fund's shareholders.",
    order: 2
  },
  {
    chapterId: "sip-vs-lumpsum",
    question: "Which investment approach is better for regular income earners?",
    options: JSON.stringify([
      "Lumpsum investment",
      "Systematic Investment Plan (SIP)",
      "Both are equally good",
      "Neither approach is suitable"
    ]),
    correctAnswer: 1,
    explanation:
      "SIP is better for regular income earners as it allows them to invest small amounts regularly and benefit from rupee cost averaging.",
    order: 1
  },
  {
    chapterId: "understanding-nav",
    question: "How is NAV calculated?",
    options: JSON.stringify([
      "Total Assets / Number of Units",
      "(Total Assets - Total Liabilities) / Number of Units",
      "Total Liabilities / Number of Units",
      "Market Price × Number of Units"
    ]),
    correctAnswer: 1,
    explanation:
      "NAV = (Total Assets - Total Liabilities) / Number of Outstanding Units. This gives the per-unit value of the fund.",
    order: 1
  }
];

async function main() {
  console.log("🌱 Seeding learning content...");

  // Create chapters
  for (const chapter of chapters) {
    const createdChapter = await prisma.learningChapter.upsert({
      where: { slug: chapter.slug },
      update: chapter,
      create: chapter
    });
    console.log(`✅ Created chapter: ${createdChapter.title}`);
  }

  // Create quizzes
  for (const quiz of quizzes) {
    // Find the chapter by slug to get the ID
    const chapter = await prisma.learningChapter.findUnique({
      where: { slug: quiz.chapterId }
    });

    if (chapter) {
      await prisma.chapterQuiz.upsert({
        where: {
          chapterId_order: {
            chapterId: chapter.id,
            order: quiz.order
          }
        },
        update: {
          question: quiz.question,
          options: quiz.options,
          correctAnswer: quiz.correctAnswer,
          explanation: quiz.explanation
        },
        create: {
          chapterId: chapter.id,
          question: quiz.question,
          options: quiz.options,
          correctAnswer: quiz.correctAnswer,
          explanation: quiz.explanation,
          order: quiz.order
        }
      });
      console.log(`✅ Created quiz for chapter: ${chapter.title}`);
    }
  }

  // Create sample badges
  const sampleBadges = [
    {
      badgeType: "FIRST_CHAPTER",
      badgeName: "First Steps",
      badgeDescription: "Completed your first learning chapter"
    },
    {
      badgeType: "QUIZ_MASTER",
      badgeName: "Quiz Master",
      badgeDescription: "Answered 10 quiz questions correctly"
    },
    {
      badgeType: "STREAK_7_DAYS",
      badgeName: "Consistent Learner",
      badgeDescription: "Learned for 7 consecutive days"
    }
  ];

  console.log("✅ Learning content seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding learning content:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
