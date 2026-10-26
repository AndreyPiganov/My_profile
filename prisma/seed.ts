import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const PROFILE_SLUG = 'andrey-piganov';

const connectionString =
  process.env.DATABASE_URL ?? 'postgresql://profile:profile@localhost:5432/profile?schema=public';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function seed(): Promise<void> {
  await prisma.$transaction(async (transaction) => {
    const profile = await transaction.profile.upsert({
      where: { slug: PROFILE_SLUG },
      update: {
        name: 'Пиганов Андрей Валерьевич',
        description:
          'Backend-разработчик с опытом около 3 лет на Node.js и NestJS. Специализируюсь на микросервисах и event-driven взаимодействии через Apache Kafka. Самостоятельно довожу backend-задачи от архитектуры и моделей данных до API, логирования, контейнеризации и запуска на сервере. Есть проектный опыт с Go, gRPC и Protocol Buffers; коммерческий опыт с Go не заявляю.',
      },
      create: {
        slug: PROFILE_SLUG,
        name: 'Пиганов Андрей Валерьевич',
        description:
          'Backend-разработчик с опытом около 3 лет на Node.js и NestJS. Специализируюсь на микросервисах и event-driven взаимодействии через Apache Kafka. Самостоятельно довожу backend-задачи от архитектуры и моделей данных до API, логирования, контейнеризации и запуска на сервере. Есть проектный опыт с Go, gRPC и Protocol Buffers; коммерческий опыт с Go не заявляю.',
      },
    });

    const relationFilter = { profileId: profile.id };

    await transaction.professionalLink.deleteMany({ where: relationFilter });
    await transaction.skill.deleteMany({ where: relationFilter });
    await transaction.experience.deleteMany({ where: relationFilter });
    await transaction.project.deleteMany({ where: relationFilter });

    await transaction.professionalLink.createMany({
      data: [
        {
          profileId: profile.id,
          label: 'GitHub',
          url: 'https://github.com/AndreyPiganov',
          sortOrder: 1,
        },
        {
          profileId: profile.id,
          label: 'GitHub — микросервисы',
          url: 'https://github.com/PiganovAndrey',
          sortOrder: 2,
        },
        {
          profileId: profile.id,
          label: 'HeadHunter',
          url: 'https://spb.hh.ru/resume/8a23c242ff11401f930039ed1f424774535077',
          sortOrder: 3,
        },
        {
          profileId: profile.id,
          label: 'Digital Business Card',
          url: 'https://my-profile-puce-five.vercel.app/graphql',
          sortOrder: 4,
        },
        {
          profileId: profile.id,
          label: 'Telegram',
          url: 'https://t.me/terris23',
          sortOrder: 5,
        },
        {
          profileId: profile.id,
          label: 'Email',
          url: 'mailto:piganov.andrey@mail.ru',
          sortOrder: 6,
        },
      ],
    });

    await transaction.skill.createMany({
      data: [
        'Node.js',
        'NestJS',
        'TypeScript',
        'JavaScript',
        'REST API',
        'Apache Kafka',
        'PostgreSQL',
        'MongoDB',
        'Redis',
        'Prisma ORM',
        'Docker',
        'Docker Compose',
        'Nginx',
        'Keycloak',
        'OAuth',
        'JWT',
        'Swagger',
        'WebSocket',
        'gRPC',
        'Protocol Buffers',
        'Go',
        'Elasticsearch',
        'Kibana',
        'Ansible',
        'GitHub Actions',
        'Jest',
        'Puppeteer',
        'AWS S3',
      ].map((name, index) => ({
        profileId: profile.id,
        name,
        sortOrder: index + 1,
      })),
    });

    await transaction.experience.createMany({
      data: [
        {
          profileId: profile.id,
          company: 'Upshell',
          position: 'Backend-разработчик',
          period: 'Август 2025 — июль 2026',
          achievements: [
            'Разрабатывал и поддерживал микросервисы платформы онлайн-курсов: от моделей данных и API до авторизации, интеграции сервисов, логирования, инфраструктуры и деплоя.',
            'Разработал два микросервиса на NestJS: auth_service и объединённый сервис опросов и уведомлений.',
            'Реализовал более 10 REST-маршрутов, модели опросов, получение анкет и сохранение ответов.',
            'Построил авторизацию через Nginx auth_request, auth_service и самостоятельно настроенный Keycloak.',
            'Реализовал уведомления через UniSender API, реферальную систему, Prisma-модели и доступ к маршрутам по тарифу.',
            'Настроил Logstash, Elasticsearch и Kibana; интегрировал traceId в сообщения Kafka.',
            'Проектировал схемы PostgreSQL, связи и ограничения целостности; писал SQL-запросы с JOIN, фильтрацией и сортировкой.',
            'Готовил Dockerfile и Docker Compose, настраивал Nginx, Swagger CORS и dev/test-окружения.',
            'Автоматизировал развёртывание с Ansible и GitHub Actions, сократив время деплоя с нескольких часов до 15 минут.',
          ],
          sortOrder: 1,
        },
        {
          profileId: profile.id,
          company: 'Frame',
          position: 'Backend-разработчик',
          period: 'Декабрь 2023 — май 2025',
          achievements: [
            'Разрабатывал и поддерживал микросервисы, интегрировал приложение с высоконагруженными сервисами через Apache Kafka и WebSocket.',
            'На стажировке разработал backend todo-сервиса на Express.js, поддерживал Docker-файлы, выполнил деплой, настроил сервер и SSL.',
            'Переписал все legacy-микросервисы проекта с Express.js на NestJS.',
            'Разработал сервис работы с фотографиями: AWS S3, CRUD, сжатие и холодное хранение.',
            'Реализовал JWT-авторизацию с хранением токенов в Redis и кэширование запросов.',
            'Разработал функции чата: редактирование, удаление, мультимедиа и статусы сообщений.',
            'Работал с email- и push-уведомлениями, PostgreSQL, MongoDB, Prisma ORM и Puppeteer.',
            'Работал с GraphQL и ClickHouse, участвовал в базовой диагностике Kubernetes Pod и логов.',
          ],
          sortOrder: 2,
        },
        {
          profileId: profile.id,
          company: 'lotfood',
          position: 'Fullstack-разработчик',
          period: 'Май 2023 — ноябрь 2023',
          achievements: [
            'Спроектировал backend на NestJS для веб-клиента и мобильного приложения на Expo: REST API, миграции, PostgreSQL/PostGIS, Redis и Docker Compose.',
            'Разработал веб-клиент на Next.js и TypeScript: каталог, корзину, кабинеты продавца и администратора, карты зон доставки на Leaflet.',
            'Реализовал круговые и полигональные зоны доставки; кэширование в Redis и оптимизация ETA сократили время обработки заказов на 20%.',
            'Внедрил роли customer/seller/admin/superadmin, RBAC, изоляцию данных продавцов и уведомления через Socket.IO и web-push.',
            'Реализовал обработку заказов и статусов, JWT access/refresh, throttling и подтверждение email через Resend.',
          ],
          sortOrder: 3,
        },
      ],
    });

    await transaction.project.createMany({
      data: [
        {
          profileId: profile.id,
          name: 'Job Aggregator',
          description:
            'Backend и схемы БД для четырёх сервисов. Vacancy service реализован на Go; запросы проходят через Nginx, Gateway и gRPC с валидацией Protocol Buffers. Есть авторизация с refresh-токенами, создание резюме и профилей.',
          url: 'https://github.com/AndreyPiganov/Job_Agregator/tree/dev',
          sortOrder: 1,
        },
        {
          profileId: profile.id,
          name: 'My-bots: ZoomBot, HhBot, OdinBot',
          description:
            'Три бота для действий по расписанию: подключение к Zoom, логи и скриншоты, обновление резюме на HeadHunter, вход в Odin и API для получения данных ботами.',
          url: 'https://github.com/AndreyPiganov/My-bots',
          sortOrder: 2,
        },
        {
          profileId: profile.id,
          name: 'Дополнительные микросервисы',
          description: 'Коллекция самостоятельно написанных backend-микросервисов и примеров структуры сервисов.',
          url: 'https://github.com/PiganovAndrey',
          sortOrder: 3,
        },
        {
          profileId: profile.id,
          name: 'Difference Calculator',
          description:
            'CLI-утилита для сравнения JSON- и YAML-файлов: древовидные структуры, несколько форматов вывода и модульные тесты.',
          url: 'https://github.com/AndreyPiganov/Difference-calculator',
          sortOrder: 4,
        },
        {
          profileId: profile.id,
          name: 'Effective-mobile-backend',
          description:
            'Три микросервиса: управление товарами и остатками, история действий через RabbitMQ и массовое обновление данных пользователей.',
          url: 'https://github.com/AndreyPiganov/Effective_mobile_backend',
          sortOrder: 5,
        },
        {
          profileId: profile.id,
          name: 'class-backend',
          description:
            'API поиска занятий с фильтрами по датам, преподавателям, статусу и количеству учеников, а также пагинацией.',
          url: 'https://github.com/AndreyPiganov/class-backend',
          sortOrder: 6,
        },
        {
          profileId: profile.id,
          name: 'google-test',
          description:
            'Получение тарифов Wildberries по расписанию, накопление данных в PostgreSQL и выгрузка в Google Sheets с сортировкой по коэффициенту.',
          url: 'https://github.com/AndreyPiganov/google-test',
          sortOrder: 7,
        },
        {
          profileId: profile.id,
          name: 'My_profile',
          description:
            'GraphQL API цифровой визитки: профиль, навыки, опыт, проекты и профессиональные ссылки; миграции и seed базы данных.',
          url: 'https://github.com/AndreyPiganov/My_profile',
          sortOrder: 8,
        },
        {
          profileId: profile.id,
          name: 'backend_diplom',
          description:
            'Backend дипломного проекта для тестирования знаний: пользователи, вопросы, варианты ответов, билеты и результаты тестирования.',
          url: 'https://github.com/AndreyPiganov/backend_dyplom',
          sortOrder: 9,
        },
        {
          profileId: profile.id,
          name: 'RSS-reader',
          description:
            'RSS-агрегатор: добавление источников, регулярная проверка обновлений и отображение новостей в одном интерфейсе.',
          url: 'https://github.com/AndreyPiganov/RSS-reader',
          sortOrder: 10,
        },
      ],
    });
  });
}

seed()
  .then(() => {
    console.log('Database seed completed successfully.');
  })
  .catch((error: unknown) => {
    console.error('Database seed failed.', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
