import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class RelationInput {
  @Field(()=>String , {nullable: true})
  readonly quantity?: string;
  @Field(()=>String , {nullable: true})
  readonly itemNumber: string;
}


@InputType()
export class ItemInput {
  @Field()
  readonly itemNumber: string;
  @Field(()=> String,{nullable: true})
  readonly description?: string;
  @Field(()=> String,{nullable: true})
  readonly procurementType?: string;
  @Field(()=> String,{nullable: true})
  readonly itemType?: string;
  @Field(()=> [RelationInput], {nullable: true})
  readonly parents?: RelationInput[];
  @Field(()=> [RelationInput], {nullable: true})
  readonly children?: RelationInput[]
}

@InputType()
export class RelationInputs{
  @Field(()=> [RelationInput], {nullable: true})
  readonly children?: RelationInput[]
}