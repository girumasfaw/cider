import * as mongoose from 'mongoose';
import {RelationSchema} from './relation.schema';

export const ItemSchema = new mongoose.Schema({
    itemNumber:String,
    description: String,
    procurementType: String,
    itemType: String,
    parents:[RelationSchema],
    children:[RelationSchema]
});
