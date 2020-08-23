import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PubSubEngine } from 'graphql-subscriptions';
import { Item, FilterInput } from './interfaces/item.interface';
import { ItemType } from './types/item.type';
import { RelationType } from './types/relation.type';
import { ItemInput, RelationInput, RelationInputs } from './inputs/item.input';
import { async } from 'rxjs';
import * as _ from 'lodash';

@Injectable()
export class ItemsService {
  constructor(
    @Inject('PUB_SUB') private pubSub: PubSubEngine,
    @InjectModel('Item') private itemModel: Model<Item>,
  ) {}

  async getAll(): Promise<ItemType[]> {
    return await this.itemModel.find().exec();
  }

  async createItem(createItemDTO: ItemInput): Promise<ItemType> {
    const defaultItemDocument: Item = {
      itemNumber: '',
      description: '',
      procurmentType: '',
      itemType: '',
      children: [],
      parents: [],
    };
    const createdItems = new this.itemModel({
      ...defaultItemDocument,
      ...createItemDTO,
    });

    return await createdItems.save();
  }

  async findOne(itemNumber: string): Promise<ItemType> {
    return await this.itemModel.findOne({ itemNumber: itemNumber });
  }

  async getAncestors(
    itemNumber: string,
    filter: FilterInput,
  ): Promise<ItemType[]> {
    var ancestors = [];
    var stack = [];
    var item = await this.itemModel.findOne({ itemNumber: itemNumber });
    stack.push(item);
    while (stack.length > 0) {
      var currentnode = stack.pop();
      var parentsStack = [];
      var parentsStack = await this.itemModel.find({
        'children.itemNumber': currentnode.itemNumber,
      });
      while (parentsStack.length > 0) {
        var parent = parentsStack.pop();
        ancestors.push(parent);
        stack.push(parent);
      }
    }

    return _.uniq(ancestors).filter(item => {
      if (item.itemType == 'Product' && filter.product == true) {
        return true;
      } else if (item.itemType == 'Assy' && filter.assys == true) {
        return true;
      } else if (item.itemType == 'part' && filter.parts == true) {
        return true;
      } else {
        false;
      }
    });
  }

  async getDecendants(
    itemNumber: string,
    filter: FilterInput,
  ): Promise<ItemType[]> {
    var decendants = [];
    var stack = [];
    var item = await this.itemModel.findOne({ itemNumber: itemNumber });
    stack.push(item);
    while (stack.length > 0) {
      var currentnode = stack.pop();
      var childrenStack = [];
      var childrenStack = await this.itemModel.find({
        'parents.itemNumber': currentnode.itemNumber,
      });
      while (childrenStack.length > 0) {
        var child = childrenStack.pop();
        decendants.push(child);
        stack.push(child);
      }
    }

    return _.uniq(decendants).filter(item => {
      if (item.itemType == 'Product' && filter.product == true) {
        return true;
      } else if (item.itemType == 'Assy' && filter.assys == true) {
        return true;
      } else if (item.itemType == 'part' && filter.parts == true) {
        return true;
      } else {
        false;
      }
    });
  }

  async itemExists(itemNumber: string): Promise<Boolean> {
    return await this.itemModel.countDocuments(
      { itemNumber: itemNumber },
      (err, count) => {
        if (count > 0) {
          return true;
        } else {
          false;
        }
      },
    );
  }
  async addParent(
    itemNumber: string,
    parent: RelationInput,
  ): Promise<ItemType> {
    let updatedItem: ItemType;

    updatedItem = await this.itemModel.findOneAndUpdate(
      { itemNumber: itemNumber },
      { $push: { parents: parent } },
      { new: true },
    );

    await this.pubSub.publish('itemUpdated', { itemUpdated: { itemNumber } });
    return updatedItem;
  }

  async addParents(
    itemNumber: string,
    parents: [RelationInput],
  ): Promise<ItemType> {
    let updatedItem: ItemType;

    updatedItem = await this.itemModel.findOneAndUpdate(
      { itemNumber: itemNumber },
      { $push: { parents: { $each: [...parents] } } },
      { new: true },
    );

    await this.pubSub.publish('itemUpdated', { itemUpdated: { itemNumber } });
    return updatedItem;
  }

  async removeParent(
    itemNumber: string,
    parent: RelationInput,
  ): Promise<ItemType> {
    const updatedItem = await this.itemModel.findOneAndUpdate(
      { itemNumber: itemNumber },
      { $pull: { parents: { itemNumber: parent.itemNumber } } },
      { new: true },
    );
    await this.pubSub.publish('itemUpdated', { itemUpdated: { itemNumber } });
    return updatedItem;
  }

  async addChildren(
    itemNumber: string,
    children: RelationInput[],
  ): Promise<ItemType> {
    let updatedItem: ItemType;
    updatedItem = await this.itemModel.findOneAndUpdate(
      { itemNumber: itemNumber },
      { $push: { children: { $each: [...children] } } },
      { new: true },
    );

    children.map(async item => {
      await this.itemModel.findOneAndUpdate(
        { itemNumber: item.itemNumber },
        { $push: { parents: { quantity: '1', itemNumber: itemNumber } } },
        { new: true },
      );
    });
    await this.pubSub.publish('itemUpdated', { itemUpdated: { itemNumber } });
    return updatedItem;
  }

  async addChild(itemNumber: string, child: RelationInput): Promise<ItemType> {
    let updatedItem: ItemType;
    let updatedParent: ItemType;
    updatedItem = await this.itemModel.findOneAndUpdate(
      { itemNumber: itemNumber },
      { $push: { children: { ...child } } },
      { new: true },
    );

    updatedParent = await this.addParent(child.itemNumber, {
      itemNumber: itemNumber,
    });

    await this.pubSub.publish('itemUpdated', { itemUpdated: { itemNumber } });
    return updatedItem;
  }

  async removeChild(
    itemNumber: string,
    child: RelationInput,
  ): Promise<ItemType> {
    const updatedItem = await this.itemModel.findOneAndUpdate(
      { itemNumber: itemNumber },
      { $pull: { children: { itemNumber: child.itemNumber } } },
      { new: true },
    );
    await this.pubSub.publish('itemUpdated', { itemUpdated: { itemNumber } });
    return updatedItem;
  }

  async delete(itemNumber: string): Promise<ItemType> {
    return await this.itemModel.findByIdAndRemove(itemNumber);
  }

  async update(itemNumber: string, item: ItemInput): Promise<ItemType> {
    return await this.itemModel.findOneAndUpdate(
      { itemNumber: itemNumber },
      item,
      { upsert: true },
    );
  }

  async getChildren(itemNumber: string): Promise<RelationType[]> {
    let jobQueries = [];
    const item: Item = await this.itemModel.findOne({ itemNumber: itemNumber });
    const itemNumbers = item.children.map(c => c.itemNumber);
    const quantity = item.children.map(c => c.quantity);
    await this.itemModel.find({ itemNumber: { $in: itemNumbers } }, function(
      err,
      ItemData: Item[],
    ) {
      ItemData.forEach((item, i) => {
        jobQueries.push({ quantity: quantity[i], item: item });
      });
    });
    return Promise.all(jobQueries);
  }

  async getParents(itemNumber: string): Promise<RelationType[]> {
    let jobQueries = [];
    const item: Item = await this.itemModel.findOne({ itemNumber: itemNumber });
    const itemNumbers = item.parents.map(c => c.itemNumber);
    const quantity = item.parents.map(c => c.quantity);
    await this.itemModel.find({ itemNumber: { $in: itemNumbers } }, function(
      err,
      ItemData: Item[],
    ) {
      ItemData.forEach((item, i) => {
        jobQueries.push({ quantity: '1', item: item });
      });
    });
    return Promise.all(jobQueries);
  }
}
