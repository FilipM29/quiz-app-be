import { prisma } from '~/utils';
import type { QuizStatus, QuizVisibility, Prisma } from '@prisma/client';

interface SearchFilters {
  query?: string;
  authorId?: string;
  quizType?: 'SLIDES' | 'JEOPARDY';
  category?: string;
  minRating?: number;
  minPlays?: number;
  maxRounds?: number;
  minRounds?: number;
  tags?: string[];
}

interface SearchOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'popular' | 'recent' | 'rating' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export class DiscoverService {
  private static _buildSearchFilters(
    filters: SearchFilters
  ): Prisma.QuizWhereInput {
    const where: Prisma.QuizWhereInput = {
      quizStatus: 'PUBLISHED' as QuizStatus,
      quizVisibility: 'PUBLIC' as QuizVisibility
    };

    if (filters.query) {
      where.OR = [
        {
          title: { contains: filters.query, mode: 'insensitive' }
        },
        {
          description: { contains: filters.query, mode: 'insensitive' }
        }
      ];
    }

    if (filters.authorId) where.authorId = filters.authorId;
    if (filters.quizType) where.quizType = filters.quizType;
    if (filters.category) where.category = filters.category;
    if (filters.minRating !== undefined)
      where.rating = { gte: filters.minRating };
    if (filters.minPlays !== undefined)
      where.numOfPlays = { gte: filters.minPlays };

    if (filters.minRounds !== undefined || filters.maxRounds !== undefined) {
      where.numOfRounds = {
        ...(filters.minRounds !== undefined && { gte: filters.minRounds }),
        ...(filters.maxRounds !== undefined && { lte: filters.maxRounds })
      };
    }

    return where;
  }

  private static _buildSortOptions(
    sortBy: string,
    sortOrder: string
  ): Prisma.QuizOrderByWithRelationInput {
    const sortMap: Record<string, Prisma.QuizOrderByWithRelationInput> = {
      popular: { numOfPlays: sortOrder as 'asc' | 'desc' },
      recent: { createdAt: sortOrder as 'asc' | 'desc' },
      rating: { rating: sortOrder as 'asc' | 'desc' },
      title: { title: sortOrder as 'asc' | 'desc' }
    };

    return sortMap[sortBy] || { numOfPlays: 'desc' };
  }
  static async getRecommendedForUser(userId: string, limit = 10) {
    // Get user's played quizzes with their categories
    const playedQuizzes = await prisma.quizPlay.findMany({
      where: {
        userId
      },
      include: {
        quiz: {
          select: {
            category: true
          }
        }
      }
    });

    // If user has no play history, return featured quizzes (high rating + plays)
    if (playedQuizzes.length === 0) {
      const result = await this.searchQuizzes(
        { minRating: 4, minPlays: 10 },
        { limit, sortBy: 'rating', sortOrder: 'desc' }
      );
      return result.quizzes;
    }

    // Count plays by category
    const categoryCount = playedQuizzes.reduce(
      (acc, play) => {
        const category = play.quiz.category;
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Get top 3 categories
    const topCategories = Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);

    // Get popular quizzes from top categories
    return prisma.quiz.findMany({
      where: {
        quizStatus: 'PUBLISHED' as QuizStatus,
        quizVisibility: 'PUBLIC' as QuizVisibility,
        category: {
          in: topCategories
        }
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        _count: {
          select: {
            ratings: true
          }
        }
      },
      orderBy: [{ numOfPlays: 'desc' }, { rating: 'desc' }],
      take: limit
    });
  }

  static async searchQuizzes(
    filters: SearchFilters,
    options: SearchOptions = {}
  ) {
    const {
      limit = 20,
      offset = 0,
      sortBy = 'popular',
      sortOrder = 'desc'
    } = options;

    const where = this._buildSearchFilters(filters);
    const orderBy = this._buildSortOptions(sortBy, sortOrder);

    const [quizzes, total] = await Promise.all([
      prisma.quiz.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          _count: {
            select: {
              ratings: true,
              rounds: true
            }
          }
        },
        orderBy,
        take: limit,
        skip: offset
      }),
      prisma.quiz.count({ where })
    ]);

    return {
      quizzes,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    };
  }

  static async getRandomQuizzes(limit = 5) {
    // Get total count first
    const totalCount = await prisma.quiz.count({
      where: {
        quizStatus: 'PUBLISHED' as QuizStatus,
        quizVisibility: 'PUBLIC' as QuizVisibility
      }
    });

    if (totalCount === 0) return [];

    // Generate random offset
    const randomOffset = Math.floor(
      Math.random() * Math.max(0, totalCount - limit)
    );

    return prisma.quiz.findMany({
      where: {
        quizStatus: 'PUBLISHED' as QuizStatus,
        quizVisibility: 'PUBLIC' as QuizVisibility
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        _count: {
          select: {
            ratings: true
          }
        }
      },
      skip: randomOffset,
      take: limit
    });
  }

  static async getSimilarQuizzes(quizId: string, limit = 5) {
    // Get the reference quiz
    const referenceQuiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      select: {
        quizType: true,
        numOfRounds: true,
        authorId: true
      }
    });

    if (!referenceQuiz) return [];

    // Find similar quizzes based on type, rounds, and author
    return prisma.quiz.findMany({
      where: {
        id: {
          not: quizId
        },
        quizStatus: 'PUBLISHED' as QuizStatus,
        quizVisibility: 'PUBLIC' as QuizVisibility,
        OR: [
          {
            quizType: referenceQuiz.quizType,
            numOfRounds: {
              gte: referenceQuiz.numOfRounds - 2,
              lte: referenceQuiz.numOfRounds + 2
            }
          },
          {
            authorId: referenceQuiz.authorId
          }
        ]
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        _count: {
          select: {
            ratings: true
          }
        }
      },
      orderBy: [{ rating: 'desc' }, { numOfPlays: 'desc' }],
      take: limit
    });
  }

  static async getQuizStats() {
    const [totalQuizzes, totalPlays, avgRating, topAuthors] = await Promise.all(
      [
        prisma.quiz.count({
          where: {
            quizStatus: 'PUBLISHED' as QuizStatus,
            quizVisibility: 'PUBLIC' as QuizVisibility
          }
        }),
        prisma.quiz.aggregate({
          where: {
            quizStatus: 'PUBLISHED' as QuizStatus,
            quizVisibility: 'PUBLIC' as QuizVisibility
          },
          _sum: {
            numOfPlays: true
          }
        }),
        prisma.quiz.aggregate({
          where: {
            quizStatus: 'PUBLISHED' as QuizStatus,
            quizVisibility: 'PUBLIC' as QuizVisibility,
            rating: {
              gt: 0
            }
          },
          _avg: {
            rating: true
          }
        }),
        prisma.user.findMany({
          select: {
            id: true,
            firstName: true,
            lastName: true,
            _count: {
              select: {
                quizes: {
                  where: {
                    quizStatus: 'PUBLISHED' as QuizStatus,
                    quizVisibility: 'PUBLIC' as QuizVisibility
                  }
                }
              }
            }
          },
          orderBy: {
            quizes: {
              _count: 'desc'
            }
          },
          take: 5
        })
      ]
    );

    return {
      totalQuizzes,
      totalPlays: totalPlays._sum.numOfPlays || 0,
      avgRating: avgRating._avg.rating || 0,
      topAuthors
    };
  }

}
