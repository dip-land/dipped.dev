import { ActivityType, Partials } from 'discord.js';
import { Client } from './classes/Client.js';
import 'dotenv/config';
import role from './commands/utility/role.js';
import { editUser } from './handlers/database.js';
import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyFavicon from 'fastify-favicon';
import { constructPage } from './constants.js';
import fs from 'node:fs';
import path from 'node:path';
import Logger from './classes/logger.js';
const index = false;

export const client = new Client({
    intents: ['Guilds', 'GuildMessages', 'MessageContent', 'GuildMembers'],
    partials: [Partials.Message, Partials.Channel, Partials.GuildMember, Partials.User],
});

client.once('ready', async () => {
    client.log(`Online`);
    client.user?.setPresence({ activities: [{ name: 'Playing with roles', type: ActivityType.Custom }], status: 'online' });
    await client.registerEvents();
    await client.registerCommands(['global', '1182260148501225552']);

    if (!index) return;
    for (const guild of await client.guilds.fetch()) {
        const members = await (await guild[1].fetch()).members.fetch();
        for (const [string, member] of members) {
            editUser(member.guild.id, member.id, { username: member.user.username, avatar: member.user.avatarURL() });
        }
    }
});

// process.on('message', (message: { type: string; status: string; name?: string; color?: string; user?: string; guild?: string; role?: string }) => {
//     if (message.type === 'role') {
//         role.webTrigger!(message, client);
//     }
// });

// setTimeout(
//     () =>
//         discordBot.send({
//             type: 'role',
//             status: 'edit',
//             name: 'name change test',
//             color: '#19bd8e',
//             user: '251580400097427456',
//             guild: '1110754252315435070',
//             role: '1185802936626983004', // only needs to be preset for deletions
//         }),
//     2000
// );

client.login(process.env.TOKEN);

const logger = new Logger('WebServer', '212;47;151m');
const fastify = Fastify({ logger: false, ignoreTrailingSlash: true });

fastify.register(fastifyStatic, { root: path.join(process.cwd(), 'public/static/'), prefix: '/static/' });
fastify.register(fastifyStatic, { root: path.join(process.cwd(), 'public/r2modman/'), prefix: '/r2modman/', decorateReply: false });
fastify.register(fastifyFavicon, { path: path.join(process.cwd(), 'public/static/icons/'), name: 'favicon.ico', maxAge: 3600 });
fastify.setNotFoundHandler({ preValidation: (req, res, done) => done(), preHandler: (req, res, done) => done() }, async function (req, res) {
    constructPage(res, {
        language: 'en-US',
        head: {
            title: 'Page Not Found',
            description: 'Error 404, Page Not Found.',
            image: '/static/icons/favicon.png',
            files: ['public/html/head.html'],
        },
        body: { files: ['public/html/nav.html', 'public/html/404.html'] },
    });
    return res;
});
fastify.all('/', (req, reply) => {
    constructPage(reply, {
        language: 'en-US',
        head: { title: 'Home', description: '', image: '/static/icons/favicon.png', files: ['public/html/head.html'] },
        body: { files: ['public/html/nav.html', 'public/html/index.html'] },
    });
    return reply;
});

fastify.register((await import('./api.js')).default, { prefix: '/api' });
fastify.register((await import('./minecraft.js')).default, { prefix: '/minecraft' });
fastify.register((await import('./projects.js')).default, { prefix: '/projects' });
fastify.register((await import('./dashboard.js')).default, { prefix: '/role-eater/dashboard' });

fastify.all('/robots.txt', (req, reply) => reply.sendFile('robots.txt', path.join(process.cwd(), 'public')));
fastify.all('/sitemap.xml', (req, reply) => reply.sendFile('sitemap.xml', path.join(process.cwd(), 'public')));
fastify.all('/ads.txt', (req, reply) => reply.sendFile('ads.txt', path.join(process.cwd(), 'public')));

try {
    await fastify.listen({ port: 8011 });
    logger.log('Port 8011 open.');
} catch (err) {
    logger.log(err);
}
