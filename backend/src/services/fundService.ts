import { prisma } from '../prisma.js';
import { logger } from '../logger.js';

export interface FundFilters {
  category?: string;
  subCategory?: string;
  riskLevel?: string;
  minRating?: number;
  search?: string;
}

export interface NAVUpdate {
  fundId: string;
  nav: number;
  date: Date;
  change: number;
  changePercent: number;
}

export class FundService {
  /**
   * Get all mutual funds with optional filters
   */
  async getFunds(filters: FundFilters = {}) {
    try {
      const where: any = {};

      if (filters.category) {
        where.category = filters.category;
      }

      if (filters.subCategory) {
        where.subCategory = filters.subCategory;
      }

      if (filters.riskLevel) {
        where.riskLevel = filters.riskLevel;
      }

      if (filters.minRating) {
        where.rating = {
          gte: filters.minRating
        };
      }

      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { isin: { contains: filters.search, mode: 'insensitive' } }
        ];
      }

      const funds = await prisma.mutualFund.findMany({
        where,
        orderBy: [
          { rating: 'desc' },
          { name: 'asc' }
        ],
        include: {
          navHistory: {
            orderBy: { date: 'desc' },
            take: 30 // Last 30 days
          }
        }
      });

      logger.info(`Retrieved ${funds.length} funds with filters:`, filters);
      return funds;
    } catch (error) {
      logger.error('Error fetching funds:', error);
      throw new Error('Failed to fetch mutual funds');
    }
  }

  /**
   * Get fund by ID with detailed information
   */
  async getFundById(fundId: string) {
    try {
      const fund = await prisma.mutualFund.findUnique({
        where: { id: fundId },
        include: {
          navHistory: {
            orderBy: { date: 'desc' },
            take: 365 // Last year
          },
          fundRatings: {
            orderBy: { date: 'desc' },
            take: 10
          }
        }
      });

      if (!fund) {
        throw new Error('Fund not found');
      }

      logger.info(`Retrieved fund details for: ${fund.name}`);
      return fund;
    } catch (error) {
      logger.error('Error fetching fund by ID:', error);
      throw error;
    }
  }

  /**
   * Update NAV for a fund
   */
  async updateNAV(fundId: string, nav: number, date: Date = new Date()) {
    try {
      // Get current NAV
      const currentFund = await prisma.mutualFund.findUnique({
        where: { id: fundId }
      });

      if (!currentFund) {
        throw new Error('Fund not found');
      }

      const change = nav - currentFund.nav;
      const changePercent = (change / currentFund.nav) * 100;

      // Update fund NAV
      await prisma.mutualFund.update({
        where: { id: fundId },
        data: {
          nav,
          navDate: date
        }
      });

      // Add to NAV history
      await prisma.navHistory.create({
        data: {
          fundId,
          nav,
          date,
          change,
          changePercent
        }
      });

      logger.info(`Updated NAV for fund ${fundId}: ${nav} (${changePercent.toFixed(2)}%)`);
      
      return {
        fundId,
        nav,
        date,
        change,
        changePercent
      };
    } catch (error) {
      logger.error('Error updating NAV:', error);
      throw new Error('Failed to update NAV');
    }
  }

  /**
   * Get fund performance metrics
   */
  async getFundPerformance(fundId: string, period: '1M' | '3M' | '6M' | '1Y' | '3Y' | '5Y' = '1Y') {
    try {
      const endDate = new Date();
      let startDate = new Date();

      switch (period) {
        case '1M':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case '3M':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case '6M':
          startDate.setMonth(endDate.getMonth() - 6);
          break;
        case '1Y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        case '3Y':
          startDate.setFullYear(endDate.getFullYear() - 3);
          break;
        case '5Y':
          startDate.setFullYear(endDate.getFullYear() - 5);
          break;
      }

      const navHistory = await prisma.navHistory.findMany({
        where: {
          fundId,
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: { date: 'asc' }
      });

      if (navHistory.length < 2) {
        throw new Error('Insufficient NAV history for performance calculation');
      }

      const startNAV = navHistory[0].nav;
      const endNAV = navHistory[navHistory.length - 1].nav;
      const totalReturn = ((endNAV - startNAV) / startNAV) * 100;

      // Calculate volatility (standard deviation of daily returns)
      const dailyReturns = [];
      for (let i = 1; i < navHistory.length; i++) {
        const dailyReturn = ((navHistory[i].nav - navHistory[i - 1].nav) / navHistory[i - 1].nav) * 100;
        dailyReturns.push(dailyReturn);
      }

      const avgReturn = dailyReturns.reduce((sum, ret) => sum + ret, 0) / dailyReturns.length;
      const variance = dailyReturns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / dailyReturns.length;
      const volatility = Math.sqrt(variance);

      // Calculate Sharpe ratio (assuming risk-free rate of 6%)
      const riskFreeRate = 6;
      const sharpeRatio = (totalReturn - riskFreeRate) / volatility;

      return {
        period,
        startDate,
        endDate,
        startNAV,
        endNAV,
        totalReturn: parseFloat(totalReturn.toFixed(2)),
        volatility: parseFloat(volatility.toFixed(2)),
        sharpeRatio: parseFloat(sharpeRatio.toFixed(2)),
        navHistory: navHistory.map(nav => ({
          date: nav.date,
          nav: nav.nav,
          change: nav.change,
          changePercent: nav.changePercent
        }))
      };
    } catch (error) {
      logger.error('Error calculating fund performance:', error);
      throw new Error('Failed to calculate fund performance');
    }
  }

  /**
   * Compare multiple funds
   */
  async compareFunds(fundIds: string[], period: '1M' | '3M' | '6M' | '1Y' | '3Y' | '5Y' = '1Y') {
    try {
      const comparison = await Promise.all(
        fundIds.map(async (fundId) => {
          const fund = await prisma.mutualFund.findUnique({
            where: { id: fundId }
          });

          if (!fund) {
            throw new Error(`Fund not found: ${fundId}`);
          }

          const performance = await this.getFundPerformance(fundId, period);

          return {
            fundId,
            name: fund.name,
            category: fund.category,
            subCategory: fund.subCategory,
            currentNAV: fund.nav,
            expenseRatio: fund.expenseRatio,
            rating: fund.rating,
            riskLevel: fund.riskLevel,
            performance
          };
        })
      );

      logger.info(`Compared ${comparison.length} funds for period: ${period}`);
      return comparison;
    } catch (error) {
      logger.error('Error comparing funds:', error);
      throw new Error('Failed to compare funds');
    }
  }

  /**
   * Get fund recommendations based on user profile
   */
  async getRecommendations(userId: string, limit: number = 5) {
    try {
      // Get user profile and goals
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
          goals: {
            orderBy: { priority: 'desc' }
          }
        }
      });

      if (!user?.profile) {
        throw new Error('User profile not found');
      }

      const { riskAppetite } = user.profile;
      const primaryGoal = user.goals[0];

      // Build recommendation criteria
      const where: any = {};

      // Filter by risk level based on user profile
      switch (riskAppetite) {
        case 'LOW':
          where.riskLevel = { in: ['LOW', 'MODERATE'] };
          break;
        case 'MODERATE':
          where.riskLevel = { in: ['MODERATE', 'HIGH'] };
          break;
        case 'HIGH':
          where.riskLevel = { in: ['HIGH', 'VERY_HIGH'] };
          break;
        default:
          where.riskLevel = 'MODERATE';
      }

      // Filter by fund category based on goal
      if (primaryGoal) {
        const { timeHorizon, goalType } = primaryGoal;
        
        if (timeHorizon <= 3) {
          // Short-term goals: prefer debt/hybrid funds
          where.category = { in: ['Debt', 'Hybrid'] };
        } else if (timeHorizon <= 7) {
          // Medium-term goals: prefer hybrid/balanced funds
          where.category = { in: ['Hybrid', 'Equity'] };
        } else {
          // Long-term goals: prefer equity funds
          where.category = 'Equity';
        }
      }

      // Get recommended funds
      const recommendations = await prisma.mutualFund.findMany({
        where,
        orderBy: [
          { rating: 'desc' },
          { expenseRatio: 'asc' }
        ],
        take: limit,
        include: {
          navHistory: {
            orderBy: { date: 'desc' },
            take: 30
          }
        }
      });

      logger.info(`Generated ${recommendations.length} recommendations for user: ${userId}`);
      return recommendations;
    } catch (error) {
      logger.error('Error generating fund recommendations:', error);
      throw new Error('Failed to generate recommendations');
    }
  }

  /**
   * Search funds with advanced filters
   */
  async searchFunds(query: string, filters: FundFilters = {}) {
    try {
      const where: any = {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { isin: { contains: query, mode: 'insensitive' } },
          { category: { contains: query, mode: 'insensitive' } },
          { subCategory: { contains: query, mode: 'insensitive' } }
        ]
      };

      // Apply additional filters
      Object.assign(where, this.buildWhereClause(filters));

      const funds = await prisma.mutualFund.findMany({
        where,
        orderBy: [
          { rating: 'desc' },
          { name: 'asc' }
        ],
        take: 20
      });

      logger.info(`Search results for "${query}": ${funds.length} funds`);
      return funds;
    } catch (error) {
      logger.error('Error searching funds:', error);
      throw new Error('Failed to search funds');
    }
  }

  /**
   * Get fund categories and subcategories
   */
  async getCategories() {
    try {
      const categories = await prisma.mutualFund.groupBy({
        by: ['category', 'subCategory'],
        _count: {
          id: true
        }
      });

      const result = categories.reduce((acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push({
          subCategory: item.subCategory,
          count: item._count.id
        });
        return acc;
      }, {} as Record<string, Array<{ subCategory: string; count: number }>>);

      return result;
    } catch (error) {
      logger.error('Error fetching categories:', error);
      throw new Error('Failed to fetch categories');
    }
  }

  private buildWhereClause(filters: FundFilters) {
    const where: any = {};

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.subCategory) {
      where.subCategory = filters.subCategory;
    }

    if (filters.riskLevel) {
      where.riskLevel = filters.riskLevel;
    }

    if (filters.minRating) {
      where.rating = {
        gte: filters.minRating
      };
    }

    return where;
  }
}

export const fundService = new FundService();