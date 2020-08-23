import * as mongoose from 'mongoose';
import {ItemSchema} from './item.schema';

export const RelationSchema = new mongoose.Schema({
    quantity: String,
    itemNumber: String
})