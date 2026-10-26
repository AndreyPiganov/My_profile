import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/modules/app/app.module';
import { DatabaseService } from '../src/modules/database/database.service';

describe('Digital Business Card API (e2e)', () => {
  let app: INestApplication<App>;

  const profile = {
    id: 1,
    slug: 'andrey-piganov',
    name: 'Андрей Пиганов',
    description: 'Backend-разработчик',
  };
  const links = [
    {
      id: 1,
      label: 'GitHub',
      url: 'https://github.com/AndreyPiganov',
    },
  ];
  const skills = [{ id: 1, name: 'TypeScript' }];
  const experience = [
    {
      id: 1,
      company: 'Личные и учебные проекты',
      position: 'Backend-разработчик',
      period: '2025 — настоящее время',
      achievements: ['Разработка backend-приложений'],
    },
  ];
  const projects = [
    {
      id: 1,
      name: 'Digital Business Card',
      description: 'GraphQL API',
      url: 'https://github.com/AndreyPiganov/My_profile',
    },
  ];

  const findLinks = jest.fn().mockResolvedValue(links);
  const findSkills = jest.fn().mockResolvedValue(skills);
  const findExperience = jest.fn().mockResolvedValue(experience);
  const findProjects = jest.fn().mockResolvedValue(projects);

  beforeAll(async () => {
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
        professionalLink: { findMany: findLinks },
        skill: { findMany: findSkills },
        experience: { findMany: findExperience },
        project: { findMany: findProjects },
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

    expect(findLinks).toHaveBeenCalledTimes(1);
    expect(findSkills).toHaveBeenCalledTimes(1);
    expect(findExperience).toHaveBeenCalledTimes(1);
    expect(findProjects).toHaveBeenCalledTimes(1);
  });

  it('does not query relations omitted from the GraphQL selection', async () => {
    jest.clearAllMocks();

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          query GetProfileSummary {
            profile {
              name
              description
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
    });
    expect(findLinks).not.toHaveBeenCalled();
    expect(findSkills).not.toHaveBeenCalled();
    expect(findExperience).not.toHaveBeenCalled();
    expect(findProjects).not.toHaveBeenCalled();
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
