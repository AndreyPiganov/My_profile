# Digital Business Card API

Backend-приложение моей цифровой визитки. Мой API предоставляет профиль, профессиональные ссылки, навыки, опыт и проекты через GraphQL.

## Стек

- TypeScript и Node.js;
- NestJS;
- GraphQL и Apollo Server;
- Prisma ORM и PostgreSQL;
- Winston;
- Docker и Docker Compose.

## Быстрый запуск

Создайте локальный файл окружения:

```bash
cp .env.example .env
```

Запустите development-окружение:

```bash
docker compose up --build
```

При запуске Compose автоматически:

1. поднимает PostgreSQL и ждёт успешного healthcheck;
2. применяет Prisma migrations;
3. выполняет идемпотентный seed;
4. запускает NestJS-приложение.

После старта доступны:

- Apollo Sandbox: <http://localhost:3000/graphql>;
- healthcheck: <http://localhost:3000/health>;
- информация о приложении: <http://localhost:3000/>.

## Makefile

```bash
make up      # собрать и запустить development-окружение
make down    # остановить окружение
make logs    # показать логи приложения
make seed    # применить миграции и повторно заполнить базу
make test    # запустить unit- и e2e-тесты
make check   # проверить форматирование, lint, сборку и тесты
```

## GraphQL

Пример запроса:

```graphql
query GetProfile {
  profile {
    name
    description
    links {
      label
      url
    }
    skills {
      name
    }
    experience {
      company
      position
      period
      achievements
    }
    projects {
      name
      description
      url
    }
  }
}
```

Получение профиля по `slug`:

```graphql
query GetProfileBySlug($slug: String!) {
  profileBySlug(slug: $slug) {
    slug
    name
    description
  }
}
```

Variables:

```json
{
  "slug": "andrey-piganov"
}
```

## Локальный запуск без Docker

Требуются Node.js 22.12+ и PostgreSQL.

```bash
npm ci
cp .env.example .env
npm run prisma:migrate:deploy
npm run prisma:seed
npm run start:dev
```

## Проверки

```bash
make check
```

## Архитектура

```text
src/
├── common/interceptors/       # сквозное HTTP, GraphQL и RPC логирование
├── config/                    # конфигурация, environment validation, Winston
├── generated/prisma/          # генерируемый Prisma Client
└── modules/
    ├── app/                   # composition root и служебные HTTP endpoints
    ├── database/              # жизненный цикл Prisma Client
    └── profile/               # GraphQL resolver, бизнес-логика и API models

prisma/
├── migrations/                # версионируемая схема базы данных
├── schema.prisma
└── seed.ts
```
