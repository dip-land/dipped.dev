import { FastifyInstance } from 'fastify';
import { constructPage } from '../constants.js';
import fs from 'node:fs';
import path from 'node:path';
import axios from 'axios';
import { local, mcssApiServers, mcssHeaders } from './api.js';

async function routes(fastify: FastifyInstance) {
    type test = {
        name: string;
        type: string;
    };

    fastify.all('/', (req, reply) => {
        constructPage(reply, {
            language: 'en-US',
            head: { title: 'Minecraft', description: '', image: '/static/images/favicon.png', files: ['public/root/head.html'] },
            body: { files: ['public/root/nav.html', 'public/minecraft/index.html'] },
        });
        return reply;
    });

    fastify.all('/:name', async (req, reply) => {
        const pack = (req.params as test).name;
        const serverData = (await axios(`${local}:${process.env.MCSS_PORT}/api/v2/servers`, { responseType: 'json', headers: mcssHeaders })).data as Array<mcssApiServers>;
        const server = serverData.filter((value) => value.folderName === (req.params as { name: string }).name)[0];
        try {
            const packInfo = JSON.parse(fs.readFileSync(path.join(server.pathToFolder, `webConfig.json`), { encoding: 'utf8', flag: 'r' }));
            constructPage(
                reply,
                {
                    language: 'en-US',
                    head: { title: packInfo.name, description: '', image: `/api/minecraft/icons/${server.serverId}`, files: ['public/root/head.html'] },
                    body: { files: ['public/root/nav.html', `public/minecraft/server.html`] },
                },
                async function (window, document) {
                    const packVersion = document.getElementById('pack-version');
                    const serverStart = document.getElementById('server-start');
                    const serverEnd = document.getElementById('server-end');
                    const packDownload = document.getElementById('pack-download');

                    packInfo.pack.version ? (packVersion!.innerHTML = `v.${packInfo.pack.version}`) : packVersion!.remove();
                    serverStart!.innerHTML = packInfo.server.start;
                    serverEnd!.innerHTML = packInfo.server.end;
                    if (packInfo.pack.download) {
                        packDownload!.setAttribute('href', packInfo.pack.download.replace('PACKID', packInfo.pack.id).replace('FILEID', packInfo.pack.fileId));
                    } else {
                        packDownload!.innerHTML = 'ModPack Unavailable';
                        packDownload?.classList.add('disabled');
                        if (!packInfo.pack.download) packDownload?.remove();
                    }
                }
            );
        } catch (error) {
            reply.code(404);
            return reply.send();
        }
    });
}

export default routes;
