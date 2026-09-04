import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Ссылка на профессиональный ресурс' })
export class ProfessionalLinkModel {
  @Field(() => Int)
  id!: number;

  @Field()
  label!: string;

  @Field()
  url!: string;
}
