import { FastifyInstance } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { Db, MongoClient } from 'mongodb';

declare module 'fastify' {
    interface FastifyInstance {
        db: Db;
    }
}

async function database(fastify: FastifyInstance, options: any) {
    fastify['db'] = new MongoClient('mongodb://localhost:27017/DipLand').db();
}

export default fastifyPlugin(database);
