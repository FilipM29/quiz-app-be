# MF Quiz APP backend

MF Quiz App backend API.

## Development

Project is based on following technologies:

- [NodeJS](https://nodejs.org/en/)
- [TypeScript](https://www.typescriptlang.org/)
- [Fastify](https://www.fastify.io/)
- [Prisma](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)

Make sure you're familiar with these technologies before you start contributing to this project.

### Prepare

Install dependencies with `npm ci` _(always use `npm` to run any node script)_. Do not use `npm install` since it
changes `package-lock.json` file.

You need to create `.env` file in the project root with following variables _(for local development)_:

```shell
# Fastify
PORT="8080"
NODE_ENVIROMENT="development"

# PostgreSQL
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
```

### Build and run

To start local development server you need to run these commands:

- `npm start` to start backend server.

To start local database use existing docker-compose.yml, you will need to populate POSTGRES variables in `.env` file.
- `docker compose up -d`

Other available npm scripts:

- `build` to create a production build,
- `serve` to run a production build,
- `clean` to clean build folders,
- `test` to run all tests,
- `lint` to check code quality.

Database related scripts:

- `db:seed` to load example data to the database,
- `db:migrate` to create and run migrations,
- `db:generate` to regenerate typescript definitions from schema,
- `db:deploy` to run migrations on production environment,
- `db:reset` to reset all data and tables.

### Database

Database is managed with [Prisma](https://www.prisma.io/). Do not forget to run `npm run db:migrate -- --name <migration_name>` to generate migration SQL and update schema in PostgreSQL database.

You can view and edit data with `npx prisma studio`.

To reset your database you can use `npx prisma migrate reset` _(it will delete all data and re-apply migrations)_.

### Elasticsearch

To reset all indices you can use `npm run es:reset`.

#### Naming conventions

Always use singular to name database tables and snake case to name database fields. Prisma tends to use pascalCase for
database objects, so `@map` and `@@map` from prisma are your friends.

Example prisma schema with correct naming scheme:

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  offers Offer[]

  @@map("user_account")
}

model Offer {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  owner       User     @relation(fields: [ownerId], references: [id], onDelete: Cascade, map: "offer_owner_fkey")
  ownerId     Int      @map("owner_id")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("offer")
}
```

#### Example data

There is a file with example data useful for development in `prisma/seed.ts`. You can load the data _(for newly created
database)_ with `npm run db:seed`.

### Commit messages

Commit messages should follow [conventional messages](https://www.conventionalcommits.org/) style. The format is:

```text
type(optional scope): commit message
```

Example messages:

- feat(backend): add api endpoint to manage offers
- fix: update data type for user_id field
- test(backend): cover offer creation with tests
- docs(admin): add documentation for offero-admin app

This style is checked before every commit.

### Branching strategy

Always use separate branches for feature and bug fixes. You should prefix branch name with `feature/` or `bugfix/`
depending on the type of the commit.

For example `feature/add-api-endpoint` or `bugfix/fix-data-type`.

### Pre commit checks

These scripts run before every commit:

- `eslint` to find and try to fix code issues,
- `commitlint` to check correctness of your commit message.
