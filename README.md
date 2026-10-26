# Digital Business Card API

Backend-приложение цифровой визитки Андрея Пиганова. GraphQL API предоставляет профиль, профессиональные ссылки, навыки, опыт работы и проекты. Интерактивная документация и выполнение запросов доступны через Apollo Sandbox.

**Задеплоенный проект:** [my-profile-puce-five.vercel.app/graphql](https://my-profile-puce-five.vercel.app/graphql)

**Исходный код:** [github.com/AndreyPiganov/My_profile](https://github.com/AndreyPiganov/My_profile)

**Актуальное резюме:** [HeadHunter](https://spb.hh.ru/resume/8a23c242ff11401f930039ed1f424774535077?hhtmFrom=profile)

## Технологии

- TypeScript, Node.js 22 и NestJS;
- GraphQL, Apollo Server и code-first schema;
- Prisma ORM и PostgreSQL;
- Docker и Docker Compose;
- Jest, Supertest, ESLint и Prettier;
- Winston для структурированного логирования.

## Быстрый запуск

Понадобятся Docker и Docker Compose. Создайте локальный файл окружения и запустите development-окружение:

```bash
cp .env.example .env
docker compose up --build
```

Первый запуск может занять несколько минут. Compose автоматически:

1. запускает PostgreSQL и дожидается успешного healthcheck;
2. применяет версионируемые Prisma migrations;
3. выполняет идемпотентный seed в транзакции;
4. запускает NestJS только после успешной подготовки данных.

После старта доступны:

- Apollo Sandbox: <http://localhost:3000/graphql>;
- healthcheck: <http://localhost:3000/health>;
- информация о приложении: <http://localhost:3000/>.

Остановить окружение:

```bash
docker compose down
```

Данные PostgreSQL сохраняются в named volume. Для полного чистого запуска можно явно удалить volume командой `docker compose down --volumes`, после чего снова выполнить `docker compose up --build`.

## GraphQL API

Основной запрос цифровой визитки:

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

Также профиль можно получить по уникальному `slug`:

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

Schema генерируется из TypeScript-моделей при старте. Apollo Sandbox использует introspection, поэтому актуальная документация типов и полей всегда доступна на `/graphql`.

## Архитектура

```text
src/
├── common/interceptors/       # сквозное HTTP, GraphQL и RPC логирование
├── config/                    # конфигурация, validation окружения, Winston
├── generated/prisma/          # генерируемый Prisma Client (не хранится в Git)
└── modules/
    ├── app/                   # composition root и служебные HTTP endpoints
    ├── database/              # подключение и жизненный цикл Prisma Client
    └── profile/               # GraphQL resolver, бизнес-логика и API models

prisma/
├── migrations/                # версионируемая схема PostgreSQL
├── schema.prisma              # модели и связи данных
└── seed.ts                    # воспроизводимые данные цифровой визитки
```

### Разделение ответственности

- `ProfileResolver` описывает GraphQL-контракт, принимает аргументы и разрешает вложенные поля. Он не содержит SQL/Prisma-запросов.
- `ProfileService` содержит сценарии чтения профиля и является единственной точкой доступа feature-модуля к данным.
- `DatabaseService` инкапсулирует конфигурацию, подключение и корректное завершение Prisma Client.
- GraphQL models отделены от Prisma models. Это не связывает внешний контракт API с внутренними служебными полями БД (`profileId`, `sortOrder`, timestamps).
- `AppModule` собирает инфраструктуру приложения: configuration, logging, GraphQL и feature-модули.

Такое разделение оставляет resolver тонким, позволяет тестировать бизнес-логику без запуска HTTP-сервера и не протаскивает Prisma Client в слой API.

### Работа с вложенными данными

Корневой resolver загружает только основные поля профиля. Связи `links`, `skills`, `experience` и `projects` реализованы отдельными `@ResolveField`: запрос к соответствующей таблице выполняется только тогда, когда поле присутствует в GraphQL selection set. Например, запрос `{ profile { name } }` не обращается к четырём таблицам связей.

API возвращает один профиль, поэтому количество запросов ограничено: один запрос профиля и максимум четыре независимых запроса связей. Это исключает лишнюю загрузку данных и декартово произведение нескольких one-to-many связей. Если в API появится список профилей, следующий шаг — request-scoped DataLoader для batch-загрузки связей и устранения N+1.

Во всех списках используется явный `sortOrder`: результат стабилен и не зависит от внутреннего порядка строк PostgreSQL. Prisma `select` также не отдаёт в API служебные колонки.

### Модель данных

`Profile` является агрегатом, остальные сущности связаны с ним отношением one-to-many и удаляются каскадно. Составные unique indexes защищают ссылки, проекты и навыки одного профиля от дублирования. Индексы `(profileId, sortOrder)` соответствуют фильтрации и сортировке запросов GraphQL.

Достижения опыта хранятся как `text[]`: это упорядоченный список простых строк без собственного жизненного цикла, поэтому отдельная таблица здесь усложнила бы модель без практической пользы.

### Миграции и seed

Схема изменяется только через Prisma migrations, что делает развёртывание воспроизводимым. Seed выполняется в транзакции: профиль обновляется через `upsert`, а зависимые коллекции пересоздаются в заданном порядке. Повторный запуск приводит базу к одному и тому же состоянию и не создаёт дубликаты.

Подготовка БД вынесена в одноразовый Compose-сервис `migrate`. Приложение зависит от его успешного завершения, поэтому не начинает принимать трафик с неприменённой схемой или пустой БД. Миграции не запускаются каждым экземпляром приложения, что также безопаснее при горизонтальном масштабировании.

### Конфигурация и эксплуатация

Переменные окружения валидируются через Joi до запуска сервера. В development используются читаемые логи, в production — JSON. Docker image собирается в несколько стадий; production-stage содержит только runtime dependencies, работает от непривилегированного пользователя `node` и не включает исходники.

## Локальный запуск без Docker

Понадобятся Node.js 22.12+ и PostgreSQL:

```bash
npm ci
cp .env.example .env
npm run prisma:migrate:deploy
npm run prisma:seed
npm run start:dev
```

## Проверки

Полная локальная проверка:

```bash
make check
```

Она последовательно проверяет форматирование, lint, production build, unit- и e2e-тесты. E2E-тесты поднимают настоящее NestJS/GraphQL-приложение, но заменяют слой БД детерминированным test double; отдельно проверяется, что незапрошенные GraphQL-связи не читаются.

Доступные команды:

```bash
make up      # собрать и запустить development-окружение
make down    # остановить окружение
make logs    # показать логи приложения
make seed    # применить миграции и повторно заполнить базу
make test    # запустить unit- и e2e-тесты
make check   # выполнить все статические проверки, сборку и тесты
```

## Production

Текущий публичный deployment: [https://my-profile-puce-five.vercel.app/graphql](https://my-profile-puce-five.vercel.app/graphql).

Production-вариант Compose требует отдельный пароль PostgreSQL и использует минимальный production-stage образа:

```bash
POSTGRES_PASSWORD='change-me' docker compose \
  -f docker-compose.yml \
  -f docker-compose.prod.yml \
  up --build -d
```

Для публичного размещения можно использовать любой сервис с поддержкой Docker и PostgreSQL (например, Render или Railway). В платформе нужно задать `NODE_ENV=production`, `PORT` и `DATABASE_URL`, выполнить `npm run prisma:migrate:deploy && npm run prisma:seed` как release/pre-deploy command и запускать image командой из `Dockerfile`.
