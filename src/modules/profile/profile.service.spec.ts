import { NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ProfileService } from './profile.service';

describe('ProfileService', () => {
  const findUnique = jest.fn();
  const database = {
    profile: { findUnique },
  } as unknown as DatabaseService;

  const service = new ProfileService(database);

  beforeEach(() => {
    findUnique.mockReset();
  });

  const profile = {
    id: 1,
    slug: 'andrey-piganov',
    name: 'Андрей Пиганов',
    description: 'Backend-разработчик',
    links: [],
    skills: [],
    experience: [],
    projects: [],
  };

  const expectedQuery = (slug: string) => ({
    where: { slug },
    include: {
      links: { orderBy: { sortOrder: 'asc' } },
      skills: { orderBy: { sortOrder: 'asc' } },
      experience: { orderBy: { sortOrder: 'asc' } },
      projects: { orderBy: { sortOrder: 'asc' } },
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
});
