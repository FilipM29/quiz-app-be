import { Type } from '@sinclair/typebox';

export const SubmitRatingSchema = Type.Object({
  value: Type.Integer({ minimum: 0, maximum: 5 }),
  comment: Type.Optional(Type.String({ maxLength: 500 }))
});

export const RatingResponseSchema = Type.Object({
  id: Type.String(),
  value: Type.Integer(),
  comment: Type.Union([Type.String(), Type.Null()]),
  authorId: Type.String(),
  quizId: Type.String()
});

export const QuizIdParamSchema = Type.Object({
  quizId: Type.String()
});
