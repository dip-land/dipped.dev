import { FastifyInstance } from 'fastify';
import { constructPage, generateLeaderboardCanvas } from '../../constants.js';
import { GlobalFonts } from '@napi-rs/canvas';
import { getAllUsers } from '../../handlers/database.js';

GlobalFonts.loadFontsFromDir(process.env.FONTS);

async function routes(fastify: FastifyInstance) {
    fastify.get('/', async (req, reply) => {
        constructPage(reply, {
            language: 'en-US',
            head: {
                title: 'Role Eater Dashboard - dipped.dev',
                description: 'Server Dashboard.',
                image: '/static/icons/favicon.png',
                files: ['public/root/head.html', 'public/role-eater/dashboard/head.html'],
            },
            body: { files: ['public/root/nav.html', 'public/role-eater/dashboard/index.html'] },
        });
        return reply;
    });
    fastify.get('/:guildID', async (req, reply) => {
        constructPage(reply, {
            language: 'en-US',
            head: {
                title: 'Role Eater Dashboard - dipped.dev',
                description: 'Server Dashboard.',
                image: '/static/icons/favicon.png',
                files: ['public/root/head.html', 'public/role-eater/dashboard/guildHead.html'],
            },
            body: { files: ['public/root/nav.html', 'public/role-eater/dashboard/guild.html'] },
        });
        return reply;
    });
    fastify.get('/:guildID.png', async (req, reply) => {
        const guildID = (req.params as { guildID: string }).guildID;
        const users = await getAllUsers(guildID, { sort: { xp: 'desc' }, limit: 10 });
        if (!users) return reply.status(404);

        const data = await generateLeaderboardCanvas(users, 70, 5);
        reply.type('image/png');
        return reply.send(data);
    });
    fastify.get('/:guildID/:userID', async (req, reply) => {
        constructPage(reply, {
            language: 'en-US',
            head: {
                title: 'Role Eater Dashboard - dipped.dev',
                description: 'Server Dashboard.',
                image: '/static/icons/favicon.png',
                files: [],
            },
            body: { files: ['public/role-eater/dashboard/user.html'] },
        });
        return reply;
    });
}

export default routes;
