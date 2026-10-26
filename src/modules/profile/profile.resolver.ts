import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { ExperienceModel } from './models/experience.model';
import { ProfessionalLinkModel } from './models/professional-link.model';
import { ProfileModel } from './models/profile.model';
import { ProjectModel } from './models/project.model';
import { SkillModel } from './models/skill.model';
import { ProfileService } from './profile.service';

@Resolver(() => ProfileModel)
export class ProfileResolver {
  constructor(private readonly profileService: ProfileService) {}

  @Query(() => ProfileModel, {
    description: 'Профиль со связанными навыками, опытом и проектами',
  })
  profile(): Promise<ProfileModel> {
    return this.profileService.getMyProfile();
  }

  @Query(() => ProfileModel, {
    description: 'Профиль, найденный по уникальному slug',
  })
  profileBySlug(@Args('slug', { type: () => String }) slug: string): Promise<ProfileModel> {
    return this.profileService.getProfile(slug);
  }

  @ResolveField(() => [ProfessionalLinkModel])
  links(@Parent() profile: ProfileModel): Promise<ProfessionalLinkModel[]> {
    return this.profileService.getLinks(profile.id);
  }

  @ResolveField(() => [SkillModel])
  skills(@Parent() profile: ProfileModel): Promise<SkillModel[]> {
    return this.profileService.getSkills(profile.id);
  }

  @ResolveField(() => [ExperienceModel])
  experience(@Parent() profile: ProfileModel): Promise<ExperienceModel[]> {
    return this.profileService.getExperience(profile.id);
  }

  @ResolveField(() => [ProjectModel])
  projects(@Parent() profile: ProfileModel): Promise<ProjectModel[]> {
    return this.profileService.getProjects(profile.id);
  }
}
