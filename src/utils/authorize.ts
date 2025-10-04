import type { User } from '@prisma/client';
import { AccessForbiddenError } from '~/models/error';

export function requireOwnership(user: User, resourceUserId: string) {
  if (user.id !== resourceUserId) {
    throw new AccessForbiddenError('You can only access your own resources');
  }
}

export function requireQuizOwnership(user: User, authorId: string) {
  if (user.id !== authorId) {
    throw new AccessForbiddenError('You can only modify your own quizzes');
  }
}

export function canAccessUser(user: User, targetUserId: string): boolean {
  return user.id === targetUserId;
}

export function canModifyQuiz(user: User, authorId: string): boolean {
  return user.id === authorId;
}
