import { FastifyInstance } from 'fastify';

async function routes(fastify: FastifyInstance) {
    fastify.register((await import('./minecraft.js')).default, { prefix: '/minecraft' });
    fastify.register((await import('./role-eater.js')).default, { prefix: '/role-eater' });
}

export default routes;
