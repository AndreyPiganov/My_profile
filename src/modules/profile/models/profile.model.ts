import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ExperienceModel } from './experience.model';
import { ProfessionalLinkModel } from './professional-link.model';
import { ProjectModel } from './project.model';
import { SkillModel } from './skill.model';

@ObjectType({ description: 'Профессиональный профиль' })
export class ProfileModel {
  @Field(() => Int)
  id!: number;

  @Field({ description: 'Уникальный текстовый идентификатор профиля' })
  slug!: string;

  @Field()
  name!: string;

  @Field()
  description!: string;

  @Field(() => [ProfessionalLinkModel])
  links!: ProfessionalLinkModel[];

  @Field(() => [SkillModel])
  skills!: SkillModel[];

  @Field(() => [ExperienceModel])
  experience!: ExperienceModel[];

  @Field(() => [ProjectModel])
  projects!: ProjectModel[];
}
