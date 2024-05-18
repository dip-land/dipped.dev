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
                files: ['public/head.html', 'public/dashboard/head.html'],
            },
            body: { files: ['public/nav.html', 'public/dashboard/index.html'] },
        });
        return res;
    });
    fastify.get('/dashboard/me', async (req, res) => {
        constructPage(res, {
            language: 'en-US',
            head: {
                title: 'Dashboard - DipLand',
                description: 'Server Dashboard.',
                image: '/static/icons/favicon.png',
                files: ['public/head.html', 'public/dashboard/head.html'],
            },
            body: { files: ['public/nav.html', 'public/dashboard/index.html'] },
        });
        return res;
    });
    fastify.get('/dashboard/servers/', async (req, res) => {
        res.redirect(303, '/dashboard/');
    });
    fastify.get('/dashboard/servers/:serverID', async (req, res) => {
        constructPage(res, {
            language: 'en-US',
            head: {
                title: 'Dashboard - DipLand',
                description: 'Server Dashboard.',
                image: '/static/icons/favicon.png',
                files: ['public/head.html', 'public/dashboard/head.html'],
            },
            body: { files: ['public/nav.html', 'public/dashboard/index.html'] },
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
