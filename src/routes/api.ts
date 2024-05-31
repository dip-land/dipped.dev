import { FastifyInstance } from 'fastify';
import fs from 'node:fs';
import path from 'node:path';
import mc from 'minecraftstatuspinger';
import { getGuildInfo, getAllUsers, getUser } from '../handlers/database.js';

async function routes(fastify: FastifyInstance, options: any) {
    fastify.get('/minecraft/servers', async (req, reply) => {
        const dir = fs.readdirSync(path.join(process.cwd(), 'public/minecraft/servers'));
        const sort: 'asc' | 'desc' = (req.headers.sort as 'asc' | 'desc') || 'asc';
        const status: 'current' | 'archived' | 'all' = (req.headers.status as 'current' | 'archived' | 'all') || 'all';
        const sorter = () => (a: any, b: any) => {
            if (sort === 'asc' && a['name'].toLowerCase() > b['name'].toLowerCase()) return 1;
            else return -1;
        };
        const data = dir
            .map((v) => {
                if (v === 'index.html') return;
                const packInfo = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public/minecraft/servers', `${v}/packInfo.json`), { encoding: 'utf8', flag: 'r' }));
                return {
                    name: packInfo.name,
                    identifier: v,
                    status: packInfo.status,
                    iconType: packInfo.pack.icon,
                };
            })
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
            if (!guilds || !guilds.filter((guild: any) => guild === '1110754252315435070')[0]) reply.send({ status: 'OKAY', ip: false, players: false });
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

    fastify.get('/role-eater/servers/', async (req, reply) => {
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

    fastify.get('/role-eater/servers/:serverID', async (req, reply) => {
        const serverID = (req.params as { serverID: string }).serverID;
        const guildData = await getGuildInfo(serverID);
        if (!guildData) return reply.code(401), reply.send([]);
        const users = await getAllUsers(serverID, { sort: { messages: 'desc' } });
        return {
            guild: guildData,
            users,
        };
    });

    fastify.get('/role-eater/servers/:serverID/:userID', async (req, reply) => {
        const serverID = (req.params as { serverID: string }).serverID;
        const userID = (req.params as { userID: string }).userID;
        const guildData = await getGuildInfo(serverID);
        if (!guildData) return reply.code(401), reply.send([]);
        const user = await getUser(serverID, userID);
        return {
            guild: guildData,
            user,
        };
    });
}

export default routes;
