import type { FastifyRequest, FastifyReply } from 'fastify';
import { Category } from '@prisma/client';
import { prisma } from '~/utils';
import { CATEGORY_CONFIG } from '~/config/categories';
import { messages } from '~/resources';

export const getAllCategories = async (
  _req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const categoryCounts = await prisma.quiz.groupBy({
      by: ['category'],
      where: {
        quizStatus: 'PUBLISHED',
        quizVisibility: 'PUBLIC'
      },
      _count: {
        category: true
      }
    });

    const countMap = new Map(
      categoryCounts.map((item) => [item.category, item._count.category])
    );

    const categories = Object.values(Category).map((category) => ({
      value: category,
      label: category
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase()),
      quizCount: countMap.get(category) || 0,
      icon: CATEGORY_CONFIG[category].icon,
      color: CATEGORY_CONFIG[category].color
    }));

    reply.status(200).send(categories);
  } catch {
    reply.status(500).send({ message: 'Failed to fetch categories' });
  }
};

export const getCategoryById = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = req.params as { id: string };

  // Validate that the ID is a valid category
  const categoryValue = id.toUpperCase().replace(/-/g, '_');
  if (!Object.values(Category).includes(categoryValue as Category)) {
    return reply
      .status(404)
      .send({ message: messages.notFound('Category', id) });
  }

  try {
    const category = categoryValue as Category;
    const quizCount = await prisma.quiz.count({
      where: {
        category,
        quizStatus: 'PUBLISHED',
        quizVisibility: 'PUBLIC'
      }
    });

    reply.status(200).send({
      value: category,
      label: category
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase()),
      quizCount,
      icon: CATEGORY_CONFIG[category].icon,
      color: CATEGORY_CONFIG[category].color
    });
  } catch {
    reply.status(500).send({ message: 'Failed to fetch category' });
  }
};

export const getQuizzesByCategory = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = req.params as { id: string };

  // Validate that the ID is a valid category
  const categoryValue = id.toUpperCase().replace(/-/g, '_');
  if (!Object.values(Category).includes(categoryValue as Category)) {
    return reply
      .status(404)
      .send({ message: messages.notFound('Category', id) });
  }

  try {
    const category = categoryValue as Category;
    const quizzes = await prisma.quiz.findMany({
      where: {
        category,
        quizStatus: 'PUBLISHED',
        quizVisibility: 'PUBLIC'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    reply.status(200).send(quizzes);
  } catch {
    reply.status(500).send({ message: 'Failed to fetch quizzes for category' });
  }
};
