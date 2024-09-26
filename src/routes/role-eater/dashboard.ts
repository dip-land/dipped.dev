import { FastifyInstance } from 'fastify';
import { constructPage } from '../../constants.js';
import { GlobalFonts } from '@napi-rs/canvas';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'fs';
import path from 'path';

GlobalFonts.loadFontsFromDir(process.env.FONTS);

async function routes(fastify: FastifyInstance) {
    fastify.get('/', async (req, reply) => {
        constructPage(reply, {
            language: 'en-US',
            head: {
                title: 'Role Eater Dashboard - dipped.dev',
                description: 'Server Dashboard.',
                image: '/static/images/favicon.png',
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
                image: '/static/images/favicon.png',
                files: ['public/root/head.html', 'public/role-eater/dashboard/guild/head.html'],
            },
            body: { files: ['public/root/nav.html', 'public/role-eater/dashboard/guild/index.html'] },
        });
        return reply;
    });
    fastify.get('/:guildID.png', async (req, reply) => {
        constructPage(reply, {
            language: 'en-US',
            head: {
                title: 'Role Eater Dashboard - dipped.dev',
                description: 'Server Dashboard.',
                image: '/static/images/favicon.png',
                files: ['public/role-eater/dashboard/guild/imageHead.html'],
            },
            body: { files: ['public/role-eater/dashboard/guild/image.html'] },
        });
        return reply;
    });
    fastify.get('/:guildID/:userID', async (req, reply) => {
        constructPage(reply, {
            language: 'en-US',
            head: {
                title: 'Role Eater Dashboard - dipped.dev',
                description: 'Server Dashboard.',
                image: '/static/images/favicon.png',
                files: ['public/root/head.html', 'public/role-eater/dashboard/user/head.html'],
            },
            body: { files: ['public/root/nav.html', 'public/role-eater/dashboard/user/index.html'] },
        });
        return reply;
    });
    fastify.get('/:guildID/:userID.png', async (req, reply) => {
        const guildID = (req.params as { guildID: string }).guildID;
        const userID = (req.params as { userID: string }).userID;
        const file = readFileSync(path.join(process.cwd(), 'public/role-eater/dashboard/user/image.html'));
        const dom = new JSDOM(file, { runScripts: 'dangerously' });
        dom.window.document.getElementById('mainScript')?.setAttribute('data-user', userID);
        dom.window.document.getElementById('mainScript')?.setAttribute('data-guild', guildID);
        return reply.type('text/html').send(dom.serialize());
    });
}

export default routes;
