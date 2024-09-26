import { FastifyInstance } from 'fastify';
import fs from 'node:fs';
import path, { parse } from 'node:path';
import { getGuildInfo, getAllGuildUsers, getUser } from '../handlers/database.js';
import axios from 'axios';
import { WithId } from 'mongodb';
import { User } from 'src/types/database.type.js';

export interface mcssApiServers {
    serverId: string;
    status: 0 | 1;
    name: string;
    description: string;
    pathToFolder: string;
    folderName: string;
    type: string;
    creationDate: string;
    isSetToAutoStart: boolean;
    forceSaveOnStop: boolean;
    keepOnline: 0 | 1;
    javaAllocatedMemory: number;
    javaStartupLine: string;
    serverPermissions: [unknown];
}

export interface server {
    id: mcssApiServers['serverId'];
    online: boolean;
    ip?: string;
    status: 'current' | 'archived' | 'unavailable';
    name: mcssApiServers['name'];
    identifier: mcssApiServers['folderName'];
    players?: number;
    download?: boolean;
}

export const local = 'http://127.0.0.1';
export const mcssHeaders = { apiKey: process.env.MCSS_KEY };

async function routes(fastify: FastifyInstance) {
    fastify.get('/minecraft/servers', async (req, reply) => {
        const data = await axios(`${local}:${process.env.MCSS_PORT}/api/v2/servers`, { responseType: 'json', headers: mcssHeaders });
        if (data.status !== 200) return { status: 'unavailable' };
        let sort: 'asc' | 'desc' | 'na' = req.headers.sort as 'asc' | 'desc' | 'na';
        let status: 'current' | 'archived' | 'all' | 'na' = req.headers.status as 'current' | 'archived' | 'all' | 'na';
        const sorter = () => (a: server | undefined, b: server | undefined) => {
            if (!a || !b) return -1;
            if (sort === 'asc' && a['name'].toLowerCase() > b['name'].toLowerCase()) return 1;
            else if (sort === 'desc' && a['name'].toLowerCase() < b['name'].toLowerCase()) return 1;
            else if (sort === 'na') return 1;
            else return -1;
        };
        const servers = data.data
            .map((server: mcssApiServers) => {
                const description = JSON.parse(server.description);
                return {
                    id: server.serverId,
                    status: description.status,
                    online: server.status ? true : false,
                    name: server.name,
                    identifier: server.folderName,
                } as server;
            })
            .filter((server: server) => (status === 'all' || status === 'na' ? true : server.status === status))
            .sort(sorter());
        const packs = servers.map((server: server) => {
            return `<a class="server ${server.status}" href="/minecraft/${server.identifier}">
            <img src="/api/minecraft/icons/${server.id}" width="140px" height="140px" alt="${server.name} Icon" /><span>${server.name}</span></a>`;
        });
        reply.send({ status: 'HOME', data: servers, html: packs.join('') });
    });

    fastify.get('/minecraft/servers/:server', async (req, reply) => {
        const guilds = req.headers.guilds ? JSON.parse(`${req.headers.guilds}`) : false;
        const serverData = (await axios(`${local}:${process.env.MCSS_PORT}/api/v2/servers`, { responseType: 'json', headers: mcssHeaders })).data as Array<mcssApiServers>;
        const serverMappings = serverData
            .map((value) => {
                return { id: value.serverId, name: value.folderName };
            })
            .filter((value) => value.name === (req.params as { server: string }).server)[0];
        try {
            const server = (await axios(`${local}:${process.env.MCSS_PORT}/api/v2/servers/${serverMappings?.id}`, { responseType: 'json', headers: mcssHeaders })).data;
            const stats = (await axios(`${local}:${process.env.MCSS_PORT}/api/v2/servers/${serverMappings?.id}/stats`, { responseType: 'json', headers: mcssHeaders })).data;
            const { status, port } = JSON.parse(server.description);
            let packIP = (req.headers['cf-connecting-ip'] || 'localhost') === process.env.ORIGIN ? `${process.env.INTERNAL_IP}:${port}` : `${process.env.EXTERNAL_IP}:${port}`;
            const download = fs.existsSync(path.join(server.pathToFolder, 'world.zip'));
            reply.send({
                id: server.serverId,
                status: status,
                online: server.status ? true : false,
                ip: guilds && guilds.filter((guild: string) => guild === '1110754252315435070')[0] && port ? packIP : undefined,
                name: server.name,
                identifier: server.folderName,
                players: stats?.latest?.playersOnline || 0,
                download,
            });
        } catch (error) {
            reply.code(404);
            return reply.send({ status: 'unavailable' });
        }
    });

    fastify.get('/minecraft/icons/:server', async (req, reply) => {
        const server = (req.params as { server: string }).server;
        const data = await axios(`${local}:${process.env.MCSS_PORT}/api/v2/servers/${server}`, { responseType: 'json', headers: mcssHeaders });
        if (data.status !== 200) return { status: 'unavailable' };
        try {
            const file = fs.readFileSync(path.join(data.data.pathToFolder, 'server-icon.png'));
            return reply.header('Content-Disposition', `attachment; filename=${data.data.folderName}.png`).type('image/png').send(file);
        } catch (error) {
            return;
        }
    });

    fastify.get('/minecraft/worlds/:server', async (req, reply) => {
        const server = (req.params as { server: string }).server;
        const data = await axios(`${local}:${process.env.MCSS_PORT}/api/v2/servers/${server}`, { responseType: 'json', headers: mcssHeaders });
        if (data.status !== 200) return { status: 'unavailable' };
        if (fs.existsSync(path.join(data.data.pathToFolder, 'world.zip'))) {
            const file = fs.createReadStream(path.join(data.data.pathToFolder, 'world.zip'));
            return reply.header('Content-Disposition', `attachment; filename=${data.data.folderName}_world.zip`).type('application/zip').send(file);
        } else {
            reply.code(400).send();
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

    fastify.get('/role-eater/:guildID', async (req, reply) => {
        const guildID = (req.params as { guildID: string }).guildID;
        const query = req.query as { limit: string; sort: string };
        if (!query.sort) query.sort = 'users';
        const guildInfo = await getGuildInfo(guildID);
        if (!guildInfo) return reply.code(401), reply.send([]);
        const users = (await getAllGuildUsers(guildID, { sort: { total: 'desc' }, limit: +query.limit || undefined })) as Array<WithId<User<false>>>;
        const client = (await import('../index.js')).client;
        const apiGuild = client.isReady() ? await client.guilds.fetch(guildID) : undefined;
        const parsedUsers = [];
        const sort = (a: WithId<User<false>>, b: WithId<User<false>>) => {
            return query.sort === 'voice' ? b.voice.time - a.voice.time : query.sort === 'message' ? b.message.count - a.message.count : b.total - a.total;
        };
        for (const user of users.sort(sort)) {
            if (!apiGuild) continue;
            try {
                const apiUser = await apiGuild.members.fetch(user.id);
                parsedUsers.push(Object.assign({}, user, { nickname: apiUser.nickname || apiUser.user.displayName, username: apiUser.user.username }));
            } catch (error) {
                continue;
            }
        }
        return {
            guild: guildInfo,
            apiGuild,
            users: parsedUsers,
        };
    });

    fastify.get('/role-eater/:guildID/:userID', async (req, reply) => {
        const guildID = (req.params as { guildID: string }).guildID;
        const userID = (req.params as { userID: string }).userID;
        const guildData = await getGuildInfo(guildID);
        if (!guildData) return reply.code(401), reply.send([]);
        const user = await getUser(guildID, userID);
        if (!user) return reply.code(401), reply.send([]);
        const client = (await import('../index.js')).client;
        if (client.isReady()) {
            return {
                guild: guildData,
                user,
                apiUser: await client.users.fetch(userID),
                apiMember: await (await client.guilds.fetch(guildID)).members.fetch(userID),
            };
        } else {
            return {
                error: true,
                guild: guildData,
                user,
                apiUser: {},
                apiMember: {},
            };
        }
    });
}

export default routes;
