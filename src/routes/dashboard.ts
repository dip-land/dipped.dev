import { FastifyInstance } from 'fastify';
import { constructPage } from '../constants.js';

async function routes(fastify: FastifyInstance, options: any) {
    fastify.get('/', async (req, res) => {
        constructPage(res, {
            language: 'en-US',
            head: {
                title: 'Role Eater Dashboard - dipped.dev',
                description: 'Server Dashboard.',
                image: '/static/icons/favicon.png',
                files: ['public/root/head.html', 'public/role-eater/dashboard/head.html'],
            },
            body: { files: ['public/root/nav.html', 'public/role-eater/dashboard/index.html'] },
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
                files: ['public/root/head.html', 'public/role-eater/dashboard/guildHead.html'],
            },
            body: { files: ['public/root/nav.html', 'public/role-eater/dashboard/guild.html'] },
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
                files: ['public/root/head.html', 'public/role-eater/dashboard/guildUserHead.html'],
            },
            body: { files: ['public/root/nav.html', 'public/role-eater/dashboard/guildUser.html'] },
        });
        return res;
    });
}

export default routes;
