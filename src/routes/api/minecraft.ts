import { FastifyInstance } from 'fastify';
import fs from 'node:fs';
import path from 'node:path';
import axios from 'axios';

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
    fastify.get('/servers', async (req, reply) => {
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

    fastify.get('/servers/:server', async (req, reply) => {
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

    fastify.get('/icons/:server', async (req, reply) => {
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

    fastify.get('/worlds/:server', async (req, reply) => {
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
}

export default routes;
