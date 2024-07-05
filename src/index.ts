import { ActivityType, Partials } from 'discord.js';
import { Client } from './classes/Client.js';
import 'dotenv/config';
import { editUser, getUser, getUserCountAll, incrementUser } from './handlers/database.js';
import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyFavicon from 'fastify-favicon';
import { constructPage } from './constants.js';
import path from 'node:path';
import Logger from './classes/logger.js';

//Bot
export const client = new Client({
    name: 'Role Eater',
    color: '\x1b[38;2;209;161;137m',
    embedColor: 0xd1a189,
    intents: ['Guilds', 'GuildMessages', 'MessageContent', 'GuildMembers', 'GuildVoiceStates'],
    partials: [Partials.Message, Partials.Channel, Partials.GuildMember, Partials.User],
});

client.once('ready', async () => {
    client.log(`Online`);
    await client.registerEvents();
    await client.registerCommands(['global', '1182260148501225552']);

    const activities = ['Playing with roles', `Watching ${await getUserCountAll()} users`, 'Version v.3.1.2'];
    let count = 1;
    client.user?.setPresence({ activities: [{ name: activities[0], type: ActivityType.Custom }], status: 'online' });
    setInterval(() => {
        const selected = activities[count];
        client.user?.setPresence({ activities: [{ name: selected, type: ActivityType.Custom }], status: 'online' });
        count = count + 1 >= activities.length ? 0 : count + 1;
    }, 5 * 1000 * 60);

    const guilds = await client.guilds.fetch();
    guilds.forEach(async (guild) => {
        const members = await (await guild.fetch()).members.fetch();
        for (const [, member] of members) {
            const user = await getUser(member.guild.id, member.id);
            if (!user) return;
            const userVoiceID = user.voice.id;
            const memberVoiceID = member.voice.channelId;
            if (!memberVoiceID && userVoiceID) {
                incrementUser(guild.id, member.id, {
                    'voice.time': Math.floor((Date.now() - user.voice.lastJoinDate) / 60000),
                    xp: Math.floor((Date.now() - user.voice.lastJoinDate) / 60000),
                });
                editUser(guild.id, member.id, { 'voice.channelID': null, 'voice.lastJoinDate': null });
            } else if (memberVoiceID && !userVoiceID) {
                editUser(guild.id, member.id, { 'voice.channelID': memberVoiceID, 'voice.lastJoinDate': Date.now() });
            }
        }
    });
});

client.login(process.env.TOKEN);

//webserver
const logger = new Logger('WebServer', '212;47;151');
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
            files: ['public/root/head.html'],
        },
        body: { files: ['public/root/nav.html', 'public/root/404.html'] },
    });
    return res;
});
fastify.all('/', (req, reply) => {
    constructPage(reply, {
        language: 'en-US',
        head: { title: 'Home', description: '', image: '/static/icons/favicon.png', files: ['public/root/head.html'] },
        body: { files: ['public/root/nav.html', 'public/root/index.html'] },
    });
    return reply;
});

fastify.register((await import('./routes/api.js')).default, { prefix: '/api' });
fastify.register((await import('./routes/minecraft.js')).default, { prefix: '/minecraft' });
fastify.register((await import('./routes/projects.js')).default, { prefix: '/projects' });
fastify.register((await import('./routes/role-eater/index.js')).default, { prefix: '/role-eater' });
fastify.register((await import('./routes/role-eater/dashboard.js')).default, { prefix: '/role-eater/dashboard' });

fastify.all('/poke', (req, reply) => reply.sendFile('poke.zip', path.join(process.cwd(), 'public')));
fastify.all('/crewlink', (req, reply) => reply.sendFile('BCL_3.1.3.zip', path.join(process.cwd(), 'public')));
fastify.all('/robots.txt', (req, reply) => reply.sendFile('robots.txt', path.join(process.cwd(), 'public')));
fastify.all('/sitemap.xml', (req, reply) => reply.sendFile('sitemap.xml', path.join(process.cwd(), 'public')));
fastify.all('/ads.txt', (req, reply) => reply.sendFile('ads.txt', path.join(process.cwd(), 'public')));

try {
    await fastify.listen({ port: 8011 });
    logger.log('Port 8011 open.');
} catch (err) {
    logger.log(err);
}

//graceful shutdown
process.on('SIGINT', async () => {
    await client.destroy();
    await fastify.close();
    console.log('Shutdown.');
    process.exit();
});
