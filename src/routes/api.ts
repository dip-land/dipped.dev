import { FastifyInstance } from 'fastify';
import fs from 'node:fs';
import path from 'node:path';
import mc from 'minecraftstatuspinger';
import { getGuildInfo, getAllUsers, getUser } from '../handlers/database.js';

interface pack {
    name: string;
    identifier: string;
    status: string;
    iconType: string;
}

async function routes(fastify: FastifyInstance) {
    fastify.get('/minecraft/servers', async (req, reply) => {
        const dir = fs.readdirSync(path.join(process.cwd(), 'public/minecraft/servers'));
        const sort: 'asc' | 'desc' = (req.headers.sort as 'asc' | 'desc') || 'asc';
        const status: 'current' | 'archived' | 'all' = (req.headers.status as 'current' | 'archived' | 'all') || 'all';
        const sorter = () => (a: pack | undefined, b: pack | undefined) => {
            if (!a || !b) return -1;
            if (sort === 'asc' && a['name'].toLowerCase() > b['name'].toLowerCase()) return 1;
            else return -1;
        };
        const data = dir
            .map((v) => {
                if (v === 'index.html') return;
                const packInfo = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public/minecraft/servers', `${v}/packInfo.json`), { encoding: 'utf8', flag: 'r' }));
                return {
                    name: packInfo.name as string,
                    identifier: v,
                    status: packInfo.status as string,
                    iconType: packInfo.pack.icon as string,
                };
            })
            .filter((v) => v)
            .sort(sorter());
        const packs = data.map((server) => {
            if (!server) return '';
            if (status === 'current') {
                if (server.status !== 'current') return '';
                return `<a class="server ${server.status}" href="/minecraft/servers/${server.identifier}">
                <img src="/minecraft/servers/${server.identifier}/packIcon.${server.iconType}" width="140px" height="140px" alt="${server.name} Pack Icon" /><span>${server.name}</span>
                </a>`;
            } else if (status === 'archived') {
                if (server.status !== 'archive') return '';
                return `<a class="server ${server.status}" href="/minecraft/servers/${server.identifier}">
                <img src="/minecraft/servers/${server.identifier}/packIcon.${server.iconType}" width="140px" height="140px" alt="${server.name} Pack Icon" /><span>${server.name}</span>
                </a>`;
            } else {
                return `<a class="server ${server.status}" href="/minecraft/servers/${server.identifier}">
                <img src="/minecraft/servers/${server.identifier}/packIcon.${server.iconType}" width="140px" height="140px" alt="${server.name} Pack Icon" /><span>${server.name}</span>
                </a>`;
            }
        });
        reply.send({
            status: 'HOME',
            data,
            html: packs.join(''),
        });
    });

    fastify.get('/minecraft/servers/:server', async (req, reply) => {
        const ip = req.headers['cf-connecting-ip'] || 'localhost';
        const guilds = req.headers.guilds ? JSON.parse(`${req.headers.guilds}`) : false;
        const server = (req.params as { server: string }).server;
        if (fs.existsSync(path.join(process.cwd(), 'public/minecraft/servers', `${server}`))) {
            const packInfo = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public/minecraft/servers', `${server}/packInfo.json`), { encoding: 'utf8', flag: 'r' }));
            let packIP = packInfo.server.ip;
            if (ip === '162.227.64.166' && packIP) packIP = '192.168.1.91:' + packIP.split(':')[1];
            if (!guilds || !guilds.filter((guild: string) => guild === '1110754252315435070')[0]) reply.send({ status: 'OKAY', ip: false, players: false });
            if (packIP) {
                const port = packIP.split(':')[1];
                try {
                    const server = await mc.lookup({ host: 'localhost', port });
                    reply.send({ status: 'Online', ip: packIP, players: (server!.status as any).players.online, packInfo });
                } catch (error) {
                    reply.send({ status: 'Offline', ip: packIP, players: false, packInfo });
                }
            } else {
                reply.send({ status: 'Archived', ip: packIP, players: false, packInfo });
            }
        } else {
            reply.code(404);
            return reply.send({ status: 'NOT FOUND' });
        }
    });

    fastify.get('/role-eater/servers', async (req, reply) => {
        const userGuilds = req.headers.guilds ? JSON.parse(`${req.headers.guilds}`) : false;
        if (!userGuilds) return reply.code(401), reply.send([]);
        const content = [];
        for (const guild of userGuilds) {
            const guildData = await getGuildInfo(guild);
            if (!guildData) continue;
            content.push({
                id: guildData.id,
                name: guildData.name,
                icon: guildData.icon,
            });
        }
        return content;
    });

    fastify.get('/role-eater/:serverID', async (req, reply) => {
        const serverID = (req.params as { serverID: string }).serverID;
        const query = req.query as { limit: string };
        const guildData = await getGuildInfo(serverID);
        if (!guildData) return reply.code(401), reply.send([]);
        const users = await getAllUsers(serverID, { sort: { xp: 'desc' }, limit: +query.limit || undefined });
        const message = await getAllUsers(serverID, { sort: { 'message.count': 'desc' }, limit: +query.limit || undefined });
        const voice = await getAllUsers(serverID, { sort: { 'voice.time': 'desc' }, limit: +query.limit || undefined });
        const client = (await import('../index.js')).client;
        const apiGuild = client.isReady() ? await client.guilds.fetch(serverID) : undefined;
        let parsedUsers = [];
        let parsedMessage = [];
        let parsedVoice = [];
        if (users) {
            for (const user of users) {
                if (!apiGuild) continue;
                const apiUser = await apiGuild.members.fetch(user.id);
                parsedUsers.push(Object.assign({}, user, { nickname: apiUser.nickname || apiUser.user.displayName, username: apiUser.user.username }));
            }
        }
        if (message) {
            for (const user of message) {
                if (!apiGuild) continue;
                const apiUser = await apiGuild.members.fetch(user.id);
                parsedMessage.push(Object.assign({}, user, { nickname: apiUser.nickname || apiUser.user.displayName, username: apiUser.user.username }));
            }
        }
        if (voice) {
            for (const user of voice) {
                if (!apiGuild) continue;
                const apiUser = await apiGuild.members.fetch(user.id);
                parsedVoice.push(Object.assign({}, user, { nickname: apiUser.nickname || apiUser.user.displayName, username: apiUser.user.username }));
            }
        }
        return {
            guild: guildData,
            apiGuild,
            users: parsedUsers,
            message: parsedMessage,
            voice: parsedVoice,
        };
    });

    fastify.get('/role-eater/:serverID/:userID', async (req, reply) => {
        const serverID = (req.params as { serverID: string }).serverID;
        const userID = (req.params as { userID: string }).userID;
        const guildData = await getGuildInfo(serverID);
        if (!guildData) return reply.code(401), reply.send([]);
        const user = await getUser(serverID, userID);
        if (!user) return reply.code(401), reply.send([]);
        const xp = await getAllUsers(serverID, { sort: { xp: 'desc' } });
        const message = await getAllUsers(serverID, { sort: { 'message.count': 'desc' } });
        const voice = await getAllUsers(serverID, { sort: { 'voice.time': 'desc' } });
        const overallRank = xp && user ? xp.findIndex((v) => v.id === user?.id) + 1 : -1;
        const messageRank = message && user ? message.findIndex((v) => v.id === user?.id) + 1 : -1;
        const voiceRank = voice && user ? voice.findIndex((v) => v.id === user?.id) + 1 : -1;
        const client = (await import('../index.js')).client;
        if (client.isReady()) {
            return {
                guild: guildData,
                user,
                apiUser: await client.users.fetch(userID),
                apiMember: await (await client.guilds.fetch(serverID)).members.fetch(userID),
                ranks: {
                    overallRank,
                    messageRank,
                    voiceRank,
                },
            };
        } else {
            return {
                error: true,
                guild: guildData,
                user,
                apiUser: {},
                apiMember: {},
                ranks: {},
            };
        }
    });
}

export default routes;
