import { Args, Query, Resolver } from '@nestjs/graphql';
import { ProfileModel } from './models/profile.model';
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
}
