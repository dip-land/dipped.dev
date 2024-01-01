import { FastifyInstance } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import fastifyMongo from '@fastify/mongodb';

async function database(fastify: FastifyInstance, options: any) {
    fastify.register(fastifyMongo, {
        url: 'mongodb://localhost:27017/DipLand?compressors=snappy',
    });
}

export default fastifyPlugin(database);
