import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ProfileModel } from './models/profile.model';
import { ExperienceModel } from './models/experience.model';
import { ProfessionalLinkModel } from './models/professional-link.model';
import { ProjectModel } from './models/project.model';
import { SkillModel } from './models/skill.model';

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
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
      },
    });

    if (!profile) {
      throw new NotFoundException(`Profile "${slug}" was not found`);
    }

    return profile;
  }

  getLinks(profileId: number): Promise<ProfessionalLinkModel[]> {
    return this.database.professionalLink.findMany({
      where: { profileId },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        label: true,
        url: true,
      },
    });
  }

  getSkills(profileId: number): Promise<SkillModel[]> {
    return this.database.skill.findMany({
      where: { profileId },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
      },
    });
  }

  getExperience(profileId: number): Promise<ExperienceModel[]> {
    return this.database.experience.findMany({
      where: { profileId },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        company: true,
        position: true,
        period: true,
        achievements: true,
      },
    });
  }

  getProjects(profileId: number): Promise<ProjectModel[]> {
    return this.database.project.findMany({
      where: { profileId },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        url: true,
      },
    });
  }
}
