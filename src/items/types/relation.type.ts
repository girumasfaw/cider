import { ObjectType, Field, ID } from '@nestjs/graphql';
import { ItemType} from "./item.type";

@ObjectType()
export class RelationType {
  @Field(()=>String , {nullable: true})
  readonly quantity: string;
  @Field(()=>ItemType , {nullable: true})
  readonly item: ItemType;
}