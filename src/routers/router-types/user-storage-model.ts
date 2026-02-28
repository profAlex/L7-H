import {ObjectId} from "mongodb";

export type UserCollectionStorageModel = {
    _id: ObjectId;
    id: string
    login: string;
    email: string;
    passwordHash: string
    createdAt: Date
}