import { Document, FindOneAndUpdateOptions, MongoClient, WithId } from 'mongodb';
import { Client } from '../classes/Client';
import { Client as DjsClient, Snowflake } from 'discord.js';
import { Guild, User, UserProjectionOptions, UserSortOptions } from '../types/database.type.js';

const botDatabase = new MongoClient('mongodb://localhost:27017/DipLand', { compressors: ['snappy', 'zlib'] }).db();

export function getCollection(guild: Snowflake) {
    const collection = botDatabase.collection(guild);
    if (!collection.collectionName) return false;
    return collection;
}

export function getCollections() {
    const collections = botDatabase.collections();
    return collections;
}

export async function createCollection(guild: Snowflake) {
    const collection = getCollection(guild) || (await botDatabase.createCollection(guild));
    return collection;
}

export async function createGuildInfo(guild: Snowflake, data: Guild<false>) {
    const collection = getCollection(guild);
    if (!collection) return false;
    const document = await collection.insertOne(data);
    return document;
}

export async function editGuildInfo(guild: Snowflake, data: Guild<true>) {
    const collection = getCollection(guild);
    if (!collection) return false;
    const document = await collection.findOneAndUpdate({ id: guild }, { $set: data });
    return document;
}

export async function getGuildInfo(guild: Snowflake) {
    const collection = getCollection(guild);
    if (!collection) return false;
    const document = await collection.findOne({ id: guild });
    return document;
}

export async function getUserCountAll() {
    const collections = await getCollections();
    let count = 0;
    for (const collection of collections) {
        count += (await collection.countDocuments()) - 1;
    }
    return count;
}

export async function createUser(guild: Snowflake, data: User<false>) {
    const collection = getCollection(guild);
    if (!collection) return false;
    const fetchedUser = await getUser(guild, data.id);
    if (!fetchedUser) {
        const document = await collection.insertOne(data);
        return document;
    }
    return fetchedUser;
}

export async function getUser(guild: Snowflake, user: User<false>['id']) {
    const collection = getCollection(guild);
    if (!collection) return false;
    const document = await collection.findOne({ id: user });
    return document;
}

export async function getAllUsers(guild: Snowflake, options?: { sort?: UserSortOptions; project?: UserProjectionOptions; limit?: number }) {
    const collection = getCollection(guild);
    if (!collection) return false;
    if (options?.project) {
        const documents = collection
            .find({ avatar: { $exists: true } }, options?.limit ? { limit: options.limit } : {})
            .sort(options.sort ?? { id: 1 })
            .project(options.project);
        return documents.toArray();
    } else {
        const documents = collection
            .find({ avatar: { $exists: true } }, options?.limit ? { limit: options.limit } : {})
            .sort(options?.sort ?? { id: 1 })
            .toArray();
        return documents;
    }
}

export async function editUser(guild: Snowflake, user: User<false>['id'], data: User<true>, options?: FindOneAndUpdateOptions) {
    const collection = getCollection(guild);
    if (!collection) return false;
    const document = await collection.findOneAndUpdate({ id: user }, { $set: data }, options ?? {});
    return document;
}

export async function editMessageHistory(guild: Snowflake, user: User<false>['id'], options?: FindOneAndUpdateOptions) {
    const date = new Date().toDateString();
    const collection = getCollection(guild);
    if (!collection) return false;
    const fetchedUser = await getUser(guild, user);
    if (!fetchedUser) return;
    if (fetchedUser.message.history.find((v: User<true>['message.history']) => v!.date === date)) {
        await collection.updateOne({ id: user, 'message.history.date': date }, { $inc: { 'message.history.$.count': 1 } });
    } else {
        await collection.updateOne({ id: user }, { $push: { 'message.history': { date, count: 1 } as any } });
    }
}

export async function editVoiceHistory(guild: Snowflake, user: User<false>['id'], time: number, options?: FindOneAndUpdateOptions) {
    const date = new Date().toDateString();
    const collection = getCollection(guild);
    if (!collection) return false;
    const fetchedUser = await getUser(guild, user);
    if (!fetchedUser) return;
    if (fetchedUser.voice.history.find((v: User<true>['voice.history']) => v!.date === date)) {
        await collection.updateOne({ id: user, 'voice.history.date': date }, { $inc: { 'voice.history.$.time': time } });
    } else {
        await collection.updateOne({ id: user }, { $push: { 'voice.history': { date, time } as any } });
    }
}

export async function incrementUser(guild: Snowflake, user: User<false>['id'], data: any, options?: FindOneAndUpdateOptions) {
    const collection = getCollection(guild);
    if (!collection) return false;
    const document = await collection.findOneAndUpdate({ id: user }, { $inc: data }, options ?? {});
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
    if (!collection) return false;
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
            voice: {
                channelID: null,
                lastJoinDate: null,
                time: 0,
                history: [],
            },
            message: {
                count: 1,
                history: [],
            },
            xp: 1,
        });
    } else {
        await incrementUser(guild, user, { 'message.count': 1, xp: 1 });
        editMessageHistory(guild, user);
    }
}
