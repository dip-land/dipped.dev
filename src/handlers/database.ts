import { Document, FindOneAndUpdateOptions, MongoClient, WithId } from 'mongodb';
import { Client } from '../classes/Client';
import { Client as DjsClient, Snowflake } from 'discord.js';
import { Guild, User, UserProjectionOptions, UserSortOptions } from '../types/database.type.js';

const database = new MongoClient('mongodb://localhost:27017/DipLand').db();

export function getCollection(guild: Snowflake) {
    const collection = database.collection(guild);
    return collection;
}

export function getCollections() {
    const collections = database.collections();
    return collections;
}

export async function createGuildInfo(guild: Snowflake, data: Guild<false>) {
    const collection = getCollection(guild);
    if (!collection.collectionName) return false;
    const document = await collection.insertOne(data);
    return document;
}

export async function editGuildInfo(guild: Snowflake, data: Guild<true>) {
    const collection = getCollection(guild);
    if (!collection.collectionName) return false;
    const document = await collection.findOneAndUpdate({ id: guild }, { $set: data });
    return document;
}

export async function getGuildInfo(guild: Snowflake) {
    const collection = getCollection(guild);
    if (!collection.collectionName) return false;
    const document = await collection.findOne({ id: guild });
    return document;
}

export async function createUser(guild: Snowflake, data: User<false>) {
    const collection = getCollection(guild);
    if (!collection.collectionName) return false;
    const document = await collection.insertOne(data);
    return document;
}

export async function getUser(guild: Snowflake, user: User<false>['id']) {
    const collection = getCollection(guild);
    if (!collection.collectionName) return false;
    const document = await collection.findOne({ id: user });
    return document;
}

export async function getAllUsers(guild: Snowflake, options?: { sort?: UserSortOptions; project?: UserProjectionOptions }) {
    const collection = getCollection(guild);
    if (!collection.collectionName) return false;
    if (options?.project) {
        const documents = collection
            .find({ avatar: { $exists: true } })
            .sort(options.sort ?? { id: 1 })
            .project(options.project);
        return documents.toArray();
    } else {
        const documents = collection
            .find({ avatar: { $exists: true } })
            .sort(options?.sort ?? { id: 1 })
            .toArray();
        return documents;
    }
}

export async function editUser(guild: Snowflake, user: User<false>['id'], data: User<true>, options?: FindOneAndUpdateOptions) {
    const collection = getCollection(guild);
    if (!collection.collectionName) return false;
    const document = await collection.findOneAndUpdate({ id: user }, { $set: data }, options ?? {});
    return document;
}

export async function editUserAll(user: User<false>['id'], data: User<true>, options?: FindOneAndUpdateOptions) {
    const collections = await getCollections();
    const documents: (WithId<Document> | null)[] = [];
    for (const collection of collections) {
        const document = await collection.findOneAndUpdate({ id: user }, { $set: data }, options ?? {});
        documents.push(document);
    }
    return documents;
}

export async function deleteUser(guild: Snowflake, user: User<false>['id']) {
    const collection = getCollection(guild);
    if (!collection.collectionName) return false;
    const deleteResult = await collection.deleteOne({ id: user });
    return deleteResult;
}

export async function messageCreate(client: Client | DjsClient, guild: Snowflake, user: User<false>['id']) {
    const fetchedUser = await getUser(guild, user);
    const guildUser = await client.users.fetch(user);

    if (!fetchedUser) {
        createUser(guild, {
            id: user,
            username: guildUser.username,
            avatar: guildUser.avatarURL(),
            role: {},
            messages: 1,
        });
    } else {
        getCollection(guild).findOneAndUpdate({ id: user }, { $inc: { messages: 1 } });
    }
}
