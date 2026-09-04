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
          'Backend-разработчик с более чем 2 годами коммерческого опыта на Node.js и NestJS. Специализируюсь на микросервисах и event-driven взаимодействии через Apache Kafka.',
      },
      create: {
        slug: PROFILE_SLUG,
        name: 'Пиганов Андрей Валерьевич',
        description:
          'Backend-разработчик с более чем 2 годами коммерческого опыта на Node.js и NestJS. Специализируюсь на микросервисах и event-driven взаимодействии через Apache Kafka.',
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
          label: 'GitHub: микросервисы',
          url: 'https://github.com/PiganovAndrey',
          sortOrder: 2,
        },
        {
          profileId: profile.id,
          label: 'Telegram',
          url: 'https://t.me/terris23',
          sortOrder: 3,
        },
        {
          profileId: profile.id,
          label: 'Email',
          url: 'mailto:piganov.andrey@mail.ru',
          sortOrder: 4,
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
          period: 'Декабрь 2024 — июль 2025',
          achievements: [
            'Разработал два микросервиса на NestJS: auth_service и сервис опросов и уведомлений.',
            'Реализовал более 10 REST-маршрутов, модели опросов, получение анкет и сохранение ответов.',
            'Построил авторизацию через Nginx auth_request, auth_service и Keycloak.',
            'Реализовал email-уведомления через UniSender API, реферальную систему и доступ по тарифам.',
            'Настроил Elasticsearch, Logstash, Kibana и трассировку traceId в Kafka.',
            'Подготовил Docker-окружение, Nginx, Ansible playbook и GitHub Actions workflow для деплоя.',
          ],
          sortOrder: 1,
        },
        {
          profileId: profile.id,
          company: 'Frame',
          position: 'Backend-разработчик',
          period: 'Май 2023 — сентябрь 2024',
          achievements: [
            'Разрабатывал NestJS-микросервисы с обменом через Apache Kafka и WebSocket.',
            'Разработал сервис работы с фотографиями: AWS S3, CRUD, сжатие и холодное хранение.',
            'Реализовал JWT-авторизацию с хранением токенов в Redis и кэширование запросов.',
            'Разработал функции чата: редактирование, удаление, мультимедиа и статусы сообщений.',
            'Работал с email- и push-уведомлениями, PostgreSQL, MongoDB, Prisma ORM и Puppeteer.',
          ],
          sortOrder: 2,
        },
      ],
    });

    await transaction.project.createMany({
      data: [
        {
          profileId: profile.id,
          name: 'Job_Agregator',
          description:
            'Платформа агрегации вакансий из четырёх микросервисов. Vacancy service реализован на Go, взаимодействие — через Nginx, Gateway, gRPC и Protocol Buffers.',
          url: 'https://github.com/AndreyPiganov/Job_Agregator/tree/dev',
          sortOrder: 1,
        },
        {
          profileId: profile.id,
          name: 'My-bots: ZoomBot, HhBot, OdinBot',
          description:
            'Три бота на NestJS, Node.js, TypeScript и Puppeteer для автоматизации действий в Zoom, HeadHunter и Odin.',
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
            'CLI-утилита на JavaScript для сравнения JSON- и YAML-файлов с несколькими форматами вывода и тестами на Jest.',
          url: 'https://github.com/AndreyPiganov/Difference-calculator',
          sortOrder: 4,
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
