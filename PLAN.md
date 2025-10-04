# Quiz App Backend - Comprehensive Improvement Plan

*Implementation roadmap based on technical debt analysis and codebase review*

## 🎯 Plan Overview

This plan addresses critical technical debt while maintaining development velocity. The approach prioritizes security and performance fixes before quality-of-life improvements.

**Timeline**: 4 weeks
**Resources**: Development team (2-3 developers)
**Risk Level**: Low (incremental improvements)

---

## 📅 Phase 1: Critical Security & Performance Fixes (Week 1)

### 🚨 Day 1-2: Security Vulnerabilities

#### **Fix Error Information Leakage**
```typescript
// Target: src/utils/error.ts
// Replace detailed error messages with generic ones in production
export const handleError = (error: Error, reply: FastifyReply) => {
  if (process.env.NODE_ENV === 'production') {
    reply.status(500).send({ message: 'Internal server error' });
  } else {
    reply.status(500).send({ message: error.message });
  }
};
```

#### **Secure CORS Configuration**
```typescript
// Target: src/server.ts
const corsOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
await fastify.register(cors, {
  origin: corsOrigins,
  credentials: true
});
```

#### **Add Authentication to User Endpoints**
```typescript
// Target: src/routes/api/users/index.ts
// Add requireAuth preHandler to user creation
fastify.post('/', {
  preHandler: [fastify.requireAuth],
  ...createUserOpt()
});
```

### ⚡ Day 3-4: Performance Critical Issues

#### **Resolve N+1 Query Problems**
```typescript
// Target: src/routes/api/questions/handler.ts
// Create optimized authorization check
async function requireQuizOwnershipForQuestion(user: User, questionId: string) {
  const result = await prisma.$queryRaw`
    SELECT q.author_id
    FROM question qu
    JOIN quiz_round r ON qu.round_id = r.id
    JOIN quiz q ON r.quiz_id = q.id
    WHERE qu.id = ${questionId}
    LIMIT 1
  `;

  if (!result[0] || result[0].author_id !== user.id) {
    throw new AccessForbiddenError('Unauthorized');
  }
}
```

#### **Implement Redis Session Storage**
```typescript
// Target: src/services/play.ts
import { Redis } from 'ioredis';

class RedisSessionService {
  private static redis = new Redis(process.env.REDIS_URL);

  static async createSession(sessionData: GameSession): Promise<string> {
    const sessionId = generateSessionId();
    await this.redis.setex(
      `session:${sessionId}`,
      3600, // 1 hour TTL
      JSON.stringify(sessionData)
    );
    return sessionId;
  }

  static async getSession(sessionId: string): Promise<GameSession | null> {
    const data = await this.redis.get(`session:${sessionId}`);
    return data ? JSON.parse(data) : null;
  }
}
```

### 🔧 Day 5: Code Quality Fixes

#### **Fix ESLint Violations**
- Run `npm run lint --fix` for auto-fixable issues
- Manually fix unused error variables in catch blocks
- Add missing return type annotations
- Remove console.log statements

---

## 📅 Phase 2: Database & Performance Optimization (Week 2)

### 🗄️ Day 1-2: Database Indexes

#### **Add Missing Indexes**
```sql
-- Create new migration: add_performance_indexes
CREATE INDEX CONCURRENTLY idx_quiz_plays ON quiz(num_of_plays DESC);
CREATE INDEX CONCURRENTLY idx_quiz_composite ON quiz(category, quiz_status, quiz_visibility);
CREATE INDEX CONCURRENTLY idx_rating_lookup ON rating(quiz_id, author_id);
CREATE INDEX CONCURRENTLY idx_quiz_play_analytics ON quiz_play(user_id, quiz_id, created_at DESC);
CREATE INDEX CONCURRENTLY idx_answer_option_question ON answer_option(question_id);
```

#### **Optimize Discover Service Queries**
```typescript
// Target: src/services/discover.ts
// Replace inefficient random selection
static async getRandomQuizzes(limit: number = 10) {
  return await prisma.$queryRaw`
    SELECT * FROM quiz
    WHERE quiz_status = 'PUBLISHED'
    ORDER BY RANDOM()
    LIMIT ${limit}
  `;
}
```

### 📊 Day 3-4: Caching Implementation

#### **Add Redis Caching for Expensive Queries**
```typescript
// Target: src/services/discover.ts
class CachedDiscoverService {
  private static redis = new Redis(process.env.REDIS_URL);
  private static CACHE_TTL = 300; // 5 minutes

  static async getFeaturedQuizzes(limit = 10) {
    const cacheKey = `featured:${limit}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) return JSON.parse(cached);

    const quizzes = await DiscoverService.getFeaturedQuizzes(limit);
    await this.redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(quizzes));

    return quizzes;
  }
}
```

### 🔄 Day 5: Query Optimization

#### **Optimize Bulk Operations**
```typescript
// Target: Service files
// Use transactions for bulk operations
static async createQuizWithContent(quizData: QuizInput) {
  return await prisma.$transaction(async (tx) => {
    const quiz = await tx.quiz.create({ data: quizData.quiz });

    const rounds = await tx.quizRound.createMany({
      data: quizData.rounds.map(r => ({ ...r, quizId: quiz.id }))
    });

    return { quiz, rounds };
  });
}
```

---

## 📅 Phase 3: Code Quality & Testing Improvements (Week 3)

### 🧪 Day 1-2: Testing Enhancement

#### **Fix Test Data Pollution**
```typescript
// Target: src/routes/api/discover/discover.test.ts
// Implement proper test isolation
beforeEach(async () => {
  // Clean slate for each test
  await server.prisma.quiz.deleteMany({ where: { author: { id: testUser.id } } });
});

afterEach(async () => {
  // Cleanup test data
  await cleanupTestData(testUser.id);
});
```

#### **Add Service Layer Unit Tests**
```typescript
// Create: src/services/__tests__/quiz.service.test.ts
describe('QuizService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create quiz with valid data', async () => {
    // Mock Prisma calls
    prismaMock.quiz.create.mockResolvedValue(mockQuiz);

    const result = await QuizService.createQuiz(validQuizData);
    expect(result).toEqual(mockQuiz);
  });
});
```

#### **Create Test Utilities**
```typescript
// Create: src/utils/test-helpers.ts
export class TestDataFactory {
  static createUser(overrides = {}) {
    return {
      id: `user_${randomId()}`,
      firebaseId: `firebase_${randomId()}`,
      username: `testuser_${randomId()}`,
      ...overrides
    };
  }

  static createQuiz(authorId: string, overrides = {}) {
    return {
      id: `quiz_${randomId()}`,
      title: `Test Quiz ${randomId()}`,
      authorId,
      ...overrides
    };
  }
}

export async function cleanupTestData(userId: string) {
  await prisma.quiz.deleteMany({ where: { authorId: userId } });
  await prisma.user.delete({ where: { id: userId } });
}
```

### 🔄 Day 3-4: Code Deduplication

#### **Centralize Authorization Logic**
```typescript
// Target: src/utils/authorize.ts
export class AuthorizationService {
  static async requireQuizOwnership(user: User, quizId: string) {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      select: { authorId: true }
    });

    if (!quiz || quiz.authorId !== user.id) {
      throw new AccessForbiddenError('Quiz access denied');
    }
  }

  static async requireQuestionOwnership(user: User, questionId: string) {
    const result = await prisma.$queryRaw`
      SELECT q.author_id
      FROM question qu
      JOIN quiz_round r ON qu.round_id = r.id
      JOIN quiz q ON r.quiz_id = q.id
      WHERE qu.id = ${questionId}
    `;

    if (!result[0] || result[0].author_id !== user.id) {
      throw new AccessForbiddenError('Question access denied');
    }
  }
}
```

#### **Create Reusable Schema Components**
```typescript
// Target: src/schemas/common.ts
export const CommonSchemas = {
  ID: Type.String({
    minLength: 1,
    maxLength: 50,
    pattern: '^[a-zA-Z0-9_-]+$'
  }),

  Pagination: Type.Object({
    page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
    limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100, default: 10 }))
  }),

  Params: {
    WithID: Type.Object({
      id: CommonSchemas.ID
    })
  }
};
```

### 🏗️ Day 5: Architecture Improvements

#### **Standardize Error Handling**
```typescript
// Target: src/utils/error.ts
export class ErrorHandler {
  static handle(error: unknown, reply: FastifyReply) {
    if (error instanceof CustomError) {
      return reply.status(error.statusCode).send({
        error: error.name,
        message: error.message
      });
    }

    // Log unexpected errors
    console.error('Unexpected error:', error);

    return reply.status(500).send({
      error: 'InternalServerError',
      message: 'An unexpected error occurred'
    });
  }
}
```

---

## 📅 Phase 4: Enhancement & Future-Proofing (Week 4)

### 📊 Day 1-2: Monitoring & Observability

#### **Add Structured Logging**
```typescript
// Add: src/utils/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/app.log' })
  ]
});
```

#### **Implement Performance Monitoring**
```typescript
// Add: src/plugins/metrics.ts
import promClient from 'prom-client';

const requestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status']
});

export async function metricsPlugin(fastify: FastifyInstance) {
  fastify.addHook('onRequest', async (request) => {
    request.startTime = Date.now();
  });

  fastify.addHook('onResponse', async (request, reply) => {
    const duration = (Date.now() - request.startTime) / 1000;
    requestDuration.observe(
      { method: request.method, route: request.url, status: reply.statusCode },
      duration
    );
  });
}
```

### 📚 Day 3-4: Documentation & Developer Experience

#### **Enhance API Documentation**
```typescript
// Target: src/server.ts
await fastify.register(swagger, {
  routePrefix: '/docs',
  swagger: {
    info: {
      title: 'Quiz App API',
      description: 'Comprehensive quiz application backend API',
      version: '1.0.0'
    },
    externalDocs: {
      url: 'https://swagger.io',
      description: 'Find more info here'
    },
    host: 'localhost:3000',
    schemes: ['http', 'https'],
    consumes: ['application/json'],
    produces: ['application/json']
  },
  exposeRoute: true
});
```

#### **Add Development Environment Setup**
```dockerfile
# Add: docker-compose.dev.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://user:pass@postgres:5432/quiz_dev
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    volumes:
      - .:/app

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: quiz_dev
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    ports:
      - "5432:5432"

  redis:
    image: redis:7
    ports:
      - "6379:6379"
```

### 🔧 Day 5: Quality Gates & CI/CD

#### **Add Pre-commit Hooks**
```json
// Target: package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,js}": [
      "eslint --fix",
      "prettier --write",
      "git add"
    ]
  }
}
```

#### **Enhance Test Performance**
```typescript
// Target: jest.config.js
module.exports = {
  // Enable parallel test execution
  maxWorkers: "50%",

  // Optimize test discovery
  testMatch: ["**/__tests__/**/*.test.ts"],

  // Cache test results
  cache: true,
  cacheDirectory: "<rootDir>/.jest/cache",

  // Setup test environment optimization
  setupFilesAfterEnv: ["<rootDir>/src/test-setup.js"],

  // Coverage optimization
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.test.ts",
    "!src/**/__tests__/**"
  ]
};
```

---

## 📊 Success Metrics

### Performance Targets
- **API Response Time**: < 100ms (from 200ms)
- **Database Query Time**: < 50ms (from 150ms)
- **Test Suite Runtime**: < 1.5s (from 2.3s)

### Quality Targets
- **ESLint Violations**: 0 (from 27)
- **Test Coverage**: > 90% (from 87.5%)
- **TypeScript Coverage**: 100% (remove all `any` types)

### Security Targets
- **Security Issues**: 0 high/medium (from 12)
- **OWASP Compliance**: 95%
- **Error Leakage**: 0 incidents

---

## 🚀 Implementation Strategy

### Risk Mitigation
1. **Feature Flags**: Use environment variables for new features
2. **Gradual Rollout**: Test changes in development thoroughly
3. **Rollback Plan**: Keep previous implementations until verified
4. **Monitoring**: Track performance metrics during rollout

### Team Coordination
1. **Daily Standups**: Review progress on critical fixes
2. **Code Reviews**: Mandatory for all security-related changes
3. **Testing Strategy**: All changes require test coverage
4. **Documentation**: Update as changes are implemented

### Success Validation
1. **Automated Testing**: All tests must pass
2. **Performance Benchmarks**: Meet defined targets
3. **Security Audit**: External security review
4. **Load Testing**: Verify performance under load

This comprehensive plan transforms the codebase from good to excellent while maintaining development velocity and system stability. Each phase builds upon the previous, ensuring a stable and scalable foundation for future growth.