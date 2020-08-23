import {Resolver, Query, Mutation, Args, Subscription, ID, ResolveField, Parent, ResolveProperty} from '@nestjs/graphql';
import {Inject} from '@nestjs/common'
import { PubSubEngine } from 'graphql-subscriptions';
import { ItemsService } from './items.service';
import { ItemType } from './types/item.type';
import { ItemInput, RelationInput, RelationInputs } from './inputs/item.input';
import { RelationType } from './types/relation.type';
import {Arg} from 'type-graphql'
import { FilterInput } from './interfaces/item.interface';

@Resolver(of => ItemType)
export class ItemsResolver {
    constructor(@Inject('PUB_SUB') private pubSub: PubSubEngine, private readonly itemsService: ItemsService) {}

    @Query(() => [ItemType])
    async items(): Promise<ItemType[]> {
      return this.itemsService.getAll();
    }

    @Query(() => ItemType)
    async itemByNumber(@Args('itemNumber') itemNumber: string): Promise<ItemType> {
      return this.itemsService.findOne(itemNumber);
    }

    @Query(() => Boolean)
    async ItemExist(@Args('itemNumber') itemNumber: string): Promise<Boolean>{
        return this.itemsService.itemExists(itemNumber)
    }

    @Query(() => [ItemType])
    async getAncestors(@Args('itemNumber') itemNumber: string, @Args('filter',{ nullable: true }) filter?:FilterInput): Promise<ItemType[]> {
      return this.itemsService.getAncestors(itemNumber,filter);
    }

    @Query(() => [ItemType])
    async getDecendants(@Args('itemNumber') itemNumber: string, @Args('filter',{ nullable: true }) filter?:FilterInput): Promise<ItemType[]> {
      return this.itemsService.getDecendants(itemNumber,filter);
    }
   

    @Mutation(() => ItemType)
    async createItem(@Args('item') item: ItemInput): Promise<ItemType> {
      return this.itemsService.createItem(item);
    }

    @ResolveField('children', ()=> [RelationType])
    async getChildren(@Parent() item:ItemType){
      const {itemNumber} = item
      if(itemNumber){
        return this.itemsService.getChildren(itemNumber)   
      }else{
        return []
      }
        
    }

    @ResolveField('parents', ()=> [RelationType])
    async getParents(@Parent() item:ItemType){
      const {itemNumber} = item
      if(itemNumber){
        return this.itemsService.getParents(itemNumber)   
      }else{
        return []
      }        
    }


    @Mutation(() => ItemType)
    async deleteItem(@Args('itemNumber') itemNumber: string): Promise<ItemType> {
       return this.itemsService.delete(itemNumber);
    }


    @Mutation(() => ItemType)
    async addParents(@Args('itemNumber') itemNumber: string, @Arg('parents', ()=>[RelationInput]) parents:[RelationInput]): Promise<ItemType>{
      return this.itemsService.addParents(itemNumber, parents)
    }


    @Mutation(() => ItemType)
    async removeParent(@Args('itemNumber') itemNumber: string, @Args('parent') parent: RelationInput): Promise<ItemType>{
      return this.itemsService.removeParent(itemNumber, parent)
    }

    @Mutation(() => ItemType)
    async addChildren(@Args('itemNumber') itemNumber: string, @Args({name:"children",type:()=>[RelationInput]}) children:[RelationInput]): Promise<ItemType>{
      return this.itemsService.addChildren(itemNumber, children)
    }

    @Mutation(() => ItemType)
    async removeChild(@Args('itemNumber') itemNumber: string, @Args('child') child:RelationInput): Promise<ItemType>{
      return this.itemsService.removeChild(itemNumber, child)
    }

    @Mutation(() => ItemType)
    async updateItem(@Args('itemNumber') itemNumber: string, @Args('item') item: ItemInput): Promise<ItemType>{
      return this.itemsService.update(itemNumber,item)
    }

    @Subscription(() => ItemType,{
      filter: (payload, variables) => {
         if(variables.itemNumber == payload.itemUpdated.itemNumber){
            return payload
         }         
     }})
     itemUpdated(@Args('itemNumber') itemNumber: string){
       return this.pubSub.asyncIterator('itemUpdated')
     }

}
