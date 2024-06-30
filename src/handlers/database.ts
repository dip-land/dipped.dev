import { BulkWriteOptions, Document, Filter, FindOneAndUpdateOptions, InsertOneOptions, MongoClient, UpdateFilter, UpdateOptions, WithId } from 'mongodb';
import { Client } from '../classes/Client';
import { Client as DjsClient, Snowflake } from 'discord.js';
import { Guild, User, UserProjectionOptions, UserSortOptions, Post, Tag } from '../types/database.type.js';

//bot
const botDatabase = new MongoClient('mongodb://localhost:27017/DipLand', { compressors: ['snappy', 'zlib'] }).db();

export function getCollection(guild: Snowflake) {
    const collection = botDatabase.collection(guild);
    return collection;
}

export function getCollections() {
    const collections = botDatabase.collections();
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

export async function getAllUsers(guild: Snowflake, options?: { sort?: UserSortOptions; project?: UserProjectionOptions; limit?: number }) {
    const collection = getCollection(guild);
    if (!collection.collectionName) return false;
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
    if (!collection.collectionName) return false;
    const document = await collection.findOneAndUpdate({ id: user }, { $set: data }, options ?? {});
    return document;
}

export async function editMessageHistory(guild: Snowflake, user: User<false>['id'], options?: FindOneAndUpdateOptions) {
    const date = new Date().toDateString();
    const collection = getCollection(guild);
    if (!collection.collectionName) return false;
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
    if (!collection.collectionName) return false;
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
    if (!collection.collectionName) return false;
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

//booru
const booruDatabase = new MongoClient('mongodb://localhost:27017/Booru', { compressors: ['snappy', 'zlib'] }).db();

export function getPosts() {
    return booruDatabase.collection('posts');
}

export function findPost(data: Partial<Post>) {
    const posts = getPosts();
    return posts.findOne(data);
}

export function findPosts(data: Partial<Post>) {
    const posts = getPosts();
    return posts.find(data);
}

export async function editPost(id: string, data: Partial<Post>, options?: FindOneAndUpdateOptions) {
    const posts = getPosts();
    return await posts.findOneAndUpdate({ id }, { $set: data }, options ?? {});
}

export async function insertPost(data: Partial<Post>, options?: InsertOneOptions) {
    const posts = getPosts();
    return await posts.insertOne(data, options ?? {});
}

export async function insertPosts(data: Array<Partial<Post>>, options?: BulkWriteOptions) {
    const posts = getPosts();
    return await posts.insertMany(data, options ?? {});
}

export function getTags() {
    return booruDatabase.collection('tags');
}

export function incrementTag(data: { name: Tag['name']; category?: Tag['category']; incrementAmount?: number }, options?: UpdateOptions) {
    const tags = getTags();
    if (!data.category) return tags.updateOne({ name: data.name }, { $inc: { count: data.incrementAmount ?? 1 } }, options ?? {});
    return tags.updateOne({ name: data.name, category: data.category }, { $inc: { count: data.incrementAmount ?? 1 } }, options ?? {});
}

export function editTag(name: Tag['name'], data: Partial<Tag>, options?: UpdateOptions) {
    const tags = getTags();
    tags.updateMany({ name }, { $set: data }, options);
}

export function incrementTags(data: { name: Tag['name']; category?: Tag['category']; incrementAmount?: number }, options?: UpdateOptions) {
    const tags = getTags();
    if (!data.category) return tags.updateMany({ name: data.name }, { $inc: { count: data.incrementAmount ?? 1 } }, options ?? {});
    return tags.updateMany({ name: data.name, category: data.category }, { $inc: { count: data.incrementAmount ?? 1 } }, options ?? {});
}

export function getBooruUsers() {
    return booruDatabase.collection('users');
}
