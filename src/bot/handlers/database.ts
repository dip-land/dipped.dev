import { MongoClient } from 'mongodb';

const database = new MongoClient('mongodb://localhost:27017/DipLand').db();

export function getCollection(guild: string) {
    const collection = database.collection(guild);
    return collection;
}
