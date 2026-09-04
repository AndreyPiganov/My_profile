import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Проект' })
export class ProjectModel {
  @Field(() => Int)
  id!: number;

  @Field()
  name!: string;

  @Field({ nullable: true })
  description!: string | null;

  @Field()
  url!: string;
}
