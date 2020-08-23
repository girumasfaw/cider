import { Module } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { MongooseModule } from '@nestjs/mongoose';
import {ItemSchema} from './schemas/item.schema';
import { ItemsService } from './items.service';
import {ItemsResolver} from './items.resolver'
@Module({
    imports:[MongooseModule.forFeature([{ name: 'Item', schema: ItemSchema }])],
    providers: [
      {
        provide: 'PUB_SUB',
        useValue: new PubSub(),
      },
      ItemsService, ItemsResolver]
  })
export class ItemsModule {}








