import { Document } from 'mongoose';
import { Field, InputType } from '@nestjs/graphql';

export interface Item extends Document{
     readonly itemNumber: string;
     readonly description: string;
     readonly procurementType: string;
     readonly itemType: string;
     readonly parents: Relation[];
     readonly children: Relation[]
}

export interface Relation extends Document{
     readonly quantity?: string;
     readonly itemNumber: string;
} 

@InputType()
export class FilterInput{
  @Field(()=> Boolean,  {nullable: true})
  readonly product?:boolean;
  @Field(()=> Boolean,  {nullable: true})
  readonly assy?:boolean
  @Field(()=> Boolean,  {nullable: true})
  readonly parts?:boolean;
}
