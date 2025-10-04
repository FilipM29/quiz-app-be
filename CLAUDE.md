# Claude Instructions for Quiz App Backend

## Project Overview

This is a quiz application backend built with:
- **Fastify** - Web framework
- **Prisma** - Database ORM with PostgreSQL
- **Firebase Admin** - Authentication
- **TypeBox** - Schema validation
- **Jest** - Testing framework
- **TypeScript** - Language with strict configuration

The application manages quizzes, rounds, questions, users, and quiz plays with comprehensive authentication and authorization.

## Architecture Patterns

### Route Structure
Each API endpoint follows a consistent 4-file pattern:
- `index.ts` - Route definitions and middleware setup
- `handler.ts` - Business logic and request handling
- `schema.ts` - TypeBox schemas and validation
- `{endpoint}.test.ts` - Jest test suite

Example structure:
```
src/routes/api/quiz/
├── index.ts      # Route registration
├── handler.ts    # Business logic
├── schema.ts     # Validation schemas
└── quiz.test.ts  # Tests
```

### Authentication Flow
- Firebase authentication with `requireAuth` preHandler
- User context available via `req.user!` in authenticated routes
- Ownership validation with `requireOwnership()` and `requireQuizOwnership()`
- Mock authentication in tests using `createAuthHeaders()`

### Database Schema Relationships
- **Quiz** → **QuizRound** → **Question** → **AnswerOption**
- **User** ↔ **Quiz** (author/follower relationships)
- **User** ↔ **QuizPlay** (play history)
- **User** ↔ **Rating** (quiz ratings)

## Development Guidelines

### When Creating New Endpoints

1. **Follow the 4-file pattern**:
   ```typescript
   // index.ts - Route registration
   fastify.get('/', getAllItemsOpt());
   fastify.post('/', { preHandler: [fastify.requireAuth], ...createItemOpt() });

   // handler.ts - Business logic
   export const createItem = async (req: FastifyRequest, reply: FastifyReply) => {
     // Implementation
   };

   // schema.ts - Validation
   const ItemSchema = Type.Object({
     // TypeBox schema definition
   });

   // item.test.ts - Tests
   describe('item endpoints', () => {
     // Test cases
   });
   ```

2. **Use TypeBox for validation**:
   - Import Prisma enums: `import { EnumName } from '@prisma/client'`
   - Use `Type.Enum(EnumName)` for enum validation
   - Apply validation constraints (minLength, maxLength, format, etc.)

3. **Implement proper authorization**:
   - Use `preHandler: [fastify.requireAuth]` for protected routes
   - Call `requireOwnership()` or similar for resource ownership checks
   - Handle authorization errors with proper HTTP status codes

### Testing Standards

1. **Setup and Teardown**:
   ```typescript
   // Mock Firebase at the top
   jest.mock('firebase-admin');

   // Create test users in beforeAll
   beforeAll(async () => {
     server = await createServer();
     user = await server.prisma.user.create({ /* test data */ });
   });

   // Clean up in afterAll
   afterAll(async () => {
     await server.prisma.user.delete({ where: { id: user.id } });
   });
   ```

2. **Authentication Testing**:
   ```typescript
   // Authenticated request
   headers: createAuthHeaders(user.firebaseId)

   // Test unauthorized access
   expect(response.statusCode).toEqual(401);

   // Test forbidden access (wrong user)
   expect(response.statusCode).toEqual(403);
   ```

3. **Test Coverage Requirements**:
   - CRUD operations (Create, Read, Update, Delete)
   - Authentication and authorization scenarios
   - Error handling (404, 401, 403)
   - Data validation
   - Business logic edge cases

### Test Data Management

1. **Test Isolation**:
   - Be aware that seed data may exist in the test database
   - Tests should either clean up after themselves or handle existing data gracefully
   - When testing for empty results, use categories/values unlikely to exist in seed data

2. **Flexible Test Assertions**:
   - Instead of hard-coding expectations for empty results, consider:
     - Testing that results match the expected criteria (if any exist)
     - Using conditional logic to handle both empty and populated states

### Database Operations

1. **Migrations**:
   ```bash
   npm run db:migrate    # Create and apply migration
   npm run db:generate   # Generate Prisma client
   npm run db:deploy     # Deploy to production
   npm run db:seed       # Run seed script
   npm run db:reset      # Reset database
   ```

2. **Service Layer Pattern**:
   - Create services in `src/services/` for database operations
   - Keep handlers thin, delegate to services
   - Use consistent error handling and return types

### Service Layer Complexity Management

1. **Method Complexity**:
   - Keep cyclomatic complexity below 15 (as per ESLint rules)
   - Extract filter building logic into private helper methods
   - Extract sorting/ordering logic into separate methods
   - Use early returns to reduce nesting

2. **Type Safety in Services**:
   - Always use proper Prisma types (e.g., Prisma.QuizWhereInput)
   - Avoid using 'any' type - import and use specific Prisma types
   - Create interfaces for complex parameter objects

3. **Prisma Best Practices**:
   - Use `include` for related data fetching
   - Apply `@@index` for performance-critical queries
   - Use `@@map` for table/column naming conventions
   - Leverage Prisma's type safety throughout the application

### Code Quality Standards

1. **TypeScript Configuration**:
   - Strict mode enabled with comprehensive checks
   - Path mapping configured (`~/*` → `./src/*`)
   - All unused variables/parameters flagged as errors

2. **ESLint and Prettier**:
   ```bash
   npm run lint     # Check code style
   npm run format   # Format code
   ```

### Common Linting Patterns to Follow

1. **TypeScript Declaration Files**:
   - Use eslint-disable comments for unused parameters in .d.ts files
   - Properly type all function parameters and return values

2. **Async/Await Patterns**:
   - Always use `await` when returning promises in async functions
   - Avoid `return await` in try blocks unless necessary for error handling

3. **Unused Variables**:
   - Remove unused error variables in catch blocks or use catch without parameter
   - Prefix intentionally unused parameters with underscore (_param)

4. **Complexity Management**:
   - Extract helper methods when functions exceed complexity limits
   - Use early returns to reduce nesting levels

3. **Error Handling**:
   ```typescript
   // Use consistent error patterns
   try {
     const result = await service.findItem(id);
     reply.status(200).send(result);
   } catch (error) {
     if (error instanceof CustomError) {
       throw error; // Let error handler deal with it
     }
     reply.status(404).send({ message: messages.notFound('Item', id) });
   }
   ```

### Firebase Integration

1. **Authentication Setup**:
   - Firebase Admin SDK configured in `src/config/firebase.ts`
   - Auth plugin in `src/plugins/auth.ts`
   - Mock Firebase in tests using `jest.mock('firebase-admin')`

2. **User Management**:
   - Firebase ID stored as `firebaseId` in User model
   - User creation handled automatically via auth middleware
   - Test users created with mock Firebase IDs

### Dependency Management

1. **Runtime vs Development Dependencies**:
   - Packages used in production code go in `dependencies`
   - Packages only used for development/testing go in `devDependencies`
   - Plugins and middleware packages are runtime dependencies

2. **Common Runtime Dependencies**:
   - fastify-plugin (used in auth and prisma plugins)
   - All @fastify/* packages used in the application
   - Database and authentication SDKs

## Development Workflow

### Before Making Changes
1. Read existing patterns in similar endpoints
2. Check database schema relationships
3. Review existing tests for similar functionality
4. Understand authentication requirements

### Quality Checks
Always run before committing:
```bash
npm run lint      # ESLint checks
npm run test      # Run test suite
npm run build     # TypeScript compilation
```

## Post-Work Quality Checks

After completing any work on the codebase, ALWAYS:
1. Run `npm run lint` to ensure code style compliance
2. Run `npm test` to verify all tests pass
3. If either command fails, fix the issues before considering the work complete
4. Run both commands again after fixes to ensure everything passes

Never consider a task complete without clean lint and passing tests.

### Common Commands
```bash
npm run dev       # Development server
npm run db:migrate # Database migrations
npm run db:seed   # Seed database
npm test         # Run tests
npm run lint     # Code linting
npm run format   # Code formatting
```

## Key Files and Directories

- `src/server.ts` - Fastify server setup
- `src/routes/` - API route definitions
- `src/services/` - Business logic layer
- `src/utils/` - Utility functions (auth, error handling, test helpers)
- `src/plugins/` - Fastify plugins
- `src/config/` - Configuration files
- `prisma/` - Database schema and migrations
- `src/__mocks__/` - Jest mocks

## Error Handling Patterns

- Use `messages` from `~/resources` for consistent error messages
- Implement custom error classes for specific scenarios
- Return appropriate HTTP status codes (200, 201, 400, 401, 403, 404, 500)
- Handle Prisma errors gracefully with proper user-facing messages

When implementing new features, always follow these established patterns to maintain consistency and code quality across the application.