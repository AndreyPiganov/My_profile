import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/modules/app/app.module';
import { DatabaseService } from '../src/modules/database/database.service';

describe('Digital Business Card API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const profile = {
      id: 1,
      slug: 'andrey-piganov',
      name: 'Андрей Пиганов',
      description: 'Backend-разработчик',
      links: [
        {
          id: 1,
          label: 'GitHub',
          url: 'https://github.com/AndreyPiganov',
        },
      ],
      skills: [{ id: 1, name: 'TypeScript' }],
      experience: [
        {
          id: 1,
          company: 'Личные и учебные проекты',
          position: 'Backend-разработчик',
          period: '2025 — настоящее время',
          achievements: ['Разработка backend-приложений'],
        },
      ],
      projects: [
        {
          id: 1,
          name: 'Digital Business Card',
          description: 'GraphQL API',
          url: 'https://github.com/AndreyPiganov/My_profile',
        },
      ],
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DatabaseService)
      .useValue({
        profile: {
          findUnique: jest.fn().mockImplementation(({ where }: { where: { slug: string } }) => {
            return where.slug === profile.slug ? profile : null;
          }),
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('GET /health', () => {
    return request(app.getHttpServer()).get('/health').expect(200).expect({ status: 'ok' });
  });

  it('returns the profile and all nested relations', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          query GetProfile {
            profile {
              name
              description
              links { label url }
              skills { name }
              experience { company position period achievements }
              projects { name description url }
            }
          }
        `,
      })
      .expect(200);

    const body = response.body as {
      errors?: unknown;
      data: { profile: unknown };
    };

    expect(body.errors).toBeUndefined();
    expect(body.data.profile).toEqual({
      name: 'Андрей Пиганов',
      description: 'Backend-разработчик',
      links: [
        {
          label: 'GitHub',
          url: 'https://github.com/AndreyPiganov',
        },
      ],
      skills: [{ name: 'TypeScript' }],
      experience: [
        {
          company: 'Личные и учебные проекты',
          position: 'Backend-разработчик',
          period: '2025 — настоящее время',
          achievements: ['Разработка backend-приложений'],
        },
      ],
      projects: [
        {
          name: 'Digital Business Card',
          description: 'GraphQL API',
          url: 'https://github.com/AndreyPiganov/My_profile',
        },
      ],
    });
  });

  it('returns a profile by slug', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          query GetProfileBySlug($slug: String!) {
            profileBySlug(slug: $slug) {
              slug
              name
            }
          }
        `,
        variables: { slug: 'andrey-piganov' },
      })
      .expect(200);

    const body = response.body as {
      errors?: unknown;
      data: { profileBySlug: unknown };
    };

    expect(body.errors).toBeUndefined();
    expect(body.data.profileBySlug).toEqual({
      slug: 'andrey-piganov',
      name: 'Андрей Пиганов',
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
