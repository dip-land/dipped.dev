import { FastifyInstance } from 'fastify';
import { constructPage } from './constants.js';

async function routes(fastify: FastifyInstance, options: any) {
    // MAIN
    // /dashboard/
    // /dashboard/me/
    // /dashboard/:serverID/
    fastify.get('/dashboard', async (req, res) => {
        constructPage(res, {
            language: 'en-US',
            head: {
                title: 'Dashboard - DipLand',
                description: 'Server Dashboard.',
                image: '/static/icons/favicon.png',
                files: ['public/root/head.html', 'public/root/dashboard/head.html'],
            },
            body: { files: ['public/root/nav.html', 'public/root/dashboard/index.html'] },
        });
        return res;
    });

    // API
    fastify.get('/api/dashboard/servers/list', async (req, res) => {
        const collections = await fastify.mongo.db?.collections();
        return collections?.map((collection) => collection.collectionName);
    });
}

export default routes;
