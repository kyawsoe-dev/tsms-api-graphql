# tsm-api-graphql

Task Management System — GraphQL API (backend).

NestJS (Code-First GraphQL) + Prisma + PostgreSQL. Part of a full-stack task
management app; the frontend lives in a separate repo.

## Features

- GraphQL API (code-first) with Apollo Server
- JWT authentication (register / login) with bcrypt password hashing
- Projects, tasks, subtasks, comments, tags, attachments
- Realtime updates via GraphQL subscriptions (`taskUpdated`, `taskAdded`, `taskDeleted`)
- DataLoader-based N+1 resolution for relations
- Rate limiting (throttler), input validation (`class-validator`), Swagger docs
- Owner-scoped queries: users only see their own projects/tasks

## Tech Stack

- [NestJS](https://nestjs.com/) + `@nestjs/graphql` (code-first)
- [Apollo Server](https://www.apollographql.com/docs/apollo-server/) (Express integration)
- [Prisma](https://www.prisma.io/) ORM + PostgreSQL
- JSON Web Tokens via `@nestjs/jwt`
- `graphql-ws` for subscriptions

## Requirements

- Node.js 20+
- PostgreSQL 14+

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
#    edit DATABASE_URL and JWT_SECRET in .env

# 3. Create the database schema
npx prisma migrate dev

# 4. (Optional) seed demo data
npm run prisma:seed

# 5. Start the API (watch mode)
npm run start:dev
```

The server runs at:

- GraphQL endpoint: `http://localhost:3000/graphql`
- GraphQL Playground: open the same URL in a browser
- Subscriptions: `ws://localhost:3000/graphql`
- Swagger docs: `http://localhost:3000/docs`
- Health check: `http://localhost:3000/health`

## Environment Variables

| Variable | Description | Default |
| --- | --- | --- |
| `PORT` | HTTP port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | required |
| `JWT_SECRET` | Secret used to sign JWTs | required |
| `JWT_EXPIRES_IN` | Token lifetime (e.g. `7d`) | `7d` |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:4000` |
| `GRAPHQL_PLAYGROUND` | Set to `false` to disable the playground | enabled |

## Common Scripts

| Command | Description |
| --- | --- |
| `npm run start:dev` | Start with watch mode |
| `npm run build` | Compile to `dist/` |
| `npm run start:prod` | Run the compiled output |
| `npm run prisma:migrate` | Create/apply migrations |
| `npm run prisma:generate` | Regenerate the Prisma client |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run prisma:seed` | Seed demo data |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## Authentication

Register or log in to obtain a JWT, then send it as an `Authorization` header:

```http
Authorization: Bearer <token>
```

GraphQL subscriptions authenticate through the WebSocket `connectionParams.authToken`.

## Project Structure

```
src/
├── main.ts                # Bootstrap + global ValidationPipe
├── app.module.ts          # Root module + GraphQL config
├── auth/                  # JWT auth, guards, decorators
├── users/                 # User model + resolvers
├── projects/              # Project CRUD (owner-scoped)
├── tasks/                 # Task CRUD, filters, subscriptions
├── subtasks/              # Subtask mutations
├── comments/              # Comment mutations
├── tags/                  # Tag queries
├── attachments/           # Attachment mutations
├── common/                # DTOs, enums, pagination
├── graphql/               # Context, dataloaders, pubsub
├── health/                # /health endpoint
├── swagger/               # Swagger setup
└── schema.graphql         # Generated (code-first) schema
```

## Example Queries

```graphql
mutation {
  register(input: { name: "Ada", email: "ada@example.com", password: "secret123" }) {
    token
  }
}
```

```graphql
query {
  projects {
    id
    name
    color
    tasks {
      id
      title
      status
    }
  }
}
```

```graphql
query {
  tasks(projectId: "…", status: IN_PROGRESS, search: "api", take: 20) {
    id
    title
    priority
    assignees { id name }
  }
}
```
