import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Профессиональный навык' })
export class SkillModel {
  @Field(() => Int)
  id!: number;

  @Field()
  name!: string;
}
