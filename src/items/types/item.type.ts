import { ObjectType, Field, ID } from '@nestjs/graphql';
import {RelationType} from './relation.type'

@ObjectType()
export class ItemType {
  @Field(() => ID)
  readonly id?: string;
  @Field()
  readonly itemNumber: string;
  @Field()
  readonly description: string;
  @Field()
  readonly procurmentType: string;
  @Field()
  readonly itemType: string;
  
  @Field(type => [RelationType], {nullable: true})
  readonly parents?: RelationType[];

  @Field(type => [RelationType], {nullable: true})
  readonly children?: RelationType[]
}