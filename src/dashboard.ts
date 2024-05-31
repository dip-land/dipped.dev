import { FastifyInstance } from 'fastify';
import { constructPage } from './constants.js';

async function routes(fastify: FastifyInstance, options: any) {
    fastify.get('/', async (req, res) => {
        constructPage(res, {
            language: 'en-US',
            head: {
                title: 'Role Eater Dashboard - dipped.dev',
                description: 'Server Dashboard.',
                image: '/static/icons/favicon.png',
                files: ['public/html/head.html', 'public/dashboard/head.html'],
            },
            body: { files: ['public/html/nav.html', 'public/dashboard/index.html'] },
        });
        return res;
    });
    fastify.get('/:guildID', async (req, res) => {
        constructPage(res, {
            language: 'en-US',
            head: {
                title: 'Role Eater Dashboard - dipped.dev',
                description: 'Server Dashboard.',
                image: '/static/icons/favicon.png',
                files: ['public/html/head.html', 'public/dashboard/guildHead.html'],
            },
            body: { files: ['public/html/nav.html', 'public/dashboard/guild.html'] },
        });
        return res;
    });
    fastify.get('/:guildID/:userID', async (req, res) => {
        constructPage(res, {
            language: 'en-US',
            head: {
                title: 'Role Eater Dashboard - dipped.dev',
                description: 'Server Dashboard.',
                image: '/static/icons/favicon.png',
                files: ['public/html/head.html', 'public/dashboard/guildUserHead.html'],
            },
            body: { files: ['public/html/nav.html', 'public/dashboard/guildUser.html'] },
        });
        return res;
    });
}

export default routes;
