import { NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ProfileService } from './profile.service';

describe('ProfileService', () => {
  const findUnique = jest.fn();
  const findLinks = jest.fn();
  const findSkills = jest.fn();
  const findExperience = jest.fn();
  const findProjects = jest.fn();
  const database = {
    profile: { findUnique },
    professionalLink: { findMany: findLinks },
    skill: { findMany: findSkills },
    experience: { findMany: findExperience },
    project: { findMany: findProjects },
  } as unknown as DatabaseService;

  const service = new ProfileService(database);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const profile = {
    id: 1,
    slug: 'andrey-piganov',
    name: 'Андрей Пиганов',
    description: 'Backend-разработчик',
  };

  const expectedQuery = (slug: string) => ({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
    },
  });

  it('returns the business card owner profile', async () => {
    findUnique.mockResolvedValue(profile);

    await expect(service.getMyProfile()).resolves.toBe(profile);
    expect(findUnique).toHaveBeenCalledWith(expectedQuery('andrey-piganov'));
  });

  it('returns a profile by the supplied slug', async () => {
    findUnique.mockResolvedValue(profile);

    await expect(service.getProfile('another-profile')).resolves.toBe(profile);
    expect(findUnique).toHaveBeenCalledWith(expectedQuery('another-profile'));
  });

  it('fails clearly when the database has not been seeded', async () => {
    findUnique.mockResolvedValue(null);

    await expect(service.getProfile('missing-profile')).rejects.toBeInstanceOf(NotFoundException);
  });

  it.each([
    {
      name: 'professional links',
      load: () => service.getLinks(1),
      repository: findLinks,
      select: { id: true, label: true, url: true },
    },
    {
      name: 'skills',
      load: () => service.getSkills(1),
      repository: findSkills,
      select: { id: true, name: true },
    },
    {
      name: 'experience',
      load: () => service.getExperience(1),
      repository: findExperience,
      select: {
        id: true,
        company: true,
        position: true,
        period: true,
        achievements: true,
      },
    },
    {
      name: 'projects',
      load: () => service.getProjects(1),
      repository: findProjects,
      select: { id: true, name: true, description: true, url: true },
    },
  ])('loads and orders $name', async ({ load, repository, select }) => {
    repository.mockResolvedValue([]);

    await expect(load()).resolves.toEqual([]);
    expect(repository).toHaveBeenCalledWith({
      where: { profileId: 1 },
      orderBy: { sortOrder: 'asc' },
      select,
    });
  });
});
