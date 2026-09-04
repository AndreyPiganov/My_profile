import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ProfileModel } from './models/profile.model';

const PROFILE_SLUG = 'andrey-piganov';

@Injectable()
export class ProfileService {
  constructor(private readonly database: DatabaseService) {}

  getMyProfile(): Promise<ProfileModel> {
    return this.getProfile(PROFILE_SLUG);
  }

  async getProfile(slug: string): Promise<ProfileModel> {
    const profile = await this.database.profile.findUnique({
      where: { slug },
      include: {
        links: { orderBy: { sortOrder: 'asc' } },
        skills: { orderBy: { sortOrder: 'asc' } },
        experience: { orderBy: { sortOrder: 'asc' } },
        projects: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!profile) {
      throw new NotFoundException(`Profile "${slug}" was not found`);
    }

    return profile;
  }
}
