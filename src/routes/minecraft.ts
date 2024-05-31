import { FastifyInstance } from 'fastify';
import { constructPage } from '../constants.js';
import fs from 'node:fs';
import path from 'node:path';

async function routes(fastify: FastifyInstance, options: any) {
    type test = {
        IDENTIFIER: string;
        type: string;
    };

    fastify.all('/', (req, reply) => {
        constructPage(reply, {
            language: 'en-US',
            head: { title: 'Minecraft', description: '', image: '/static/icons/favicon.png', files: ['public/root/head.html'] },
            body: { files: ['public/root/nav.html', 'public/minecraft/index.html'] },
        });
        return reply;
    });

    fastify.all('/servers', (req, reply) => reply.redirect(303, '/'));

    fastify.all('/servers/:IDENTIFIER', (req, reply) => {
        const pack = (req.params as test).IDENTIFIER;
        if (fs.existsSync(path.join(process.cwd(), 'public/minecraft/servers', `${pack}`))) {
            const packInfo = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public/minecraft/servers', `${pack}/packInfo.json`), { encoding: 'utf8', flag: 'r' }));
            constructPage(
                reply,
                {
                    language: 'en-US',
                    head: { title: packInfo.name, description: '', image: `/minecraft/servers/${pack}/packIcon.png`, files: ['public/root/head.html'] },
                    body: { files: ['public/root/nav.html', `public/minecraft/server.html`] },
                },
                async function (window, document) {
                    const packIcon = document.getElementById('pack-icon');
                    const packName = document.getElementById('pack-name');
                    const packVersion = document.getElementById('pack-version');
                    const ipContainer = document.getElementById('ip-container');
                    const serverStart = document.getElementById('server-start');
                    const serverEnd = document.getElementById('server-end');
                    const packDownload = document.getElementById('pack-download');
                    const download = document.getElementById('download');

                    packIcon!.setAttribute('src', `/minecraft/servers/${pack}/packIcon.${packInfo.pack.icon}`);
                    packIcon!.setAttribute('alt', `${packInfo.name} Icon`);
                    packName!.innerHTML = packInfo.name;
                    packInfo.pack.version ? (packVersion!.innerHTML = `v.${packInfo.pack.version}`) : packVersion!.remove();
                    if (!packInfo.server.ip) ipContainer!.remove();
                    serverStart!.innerHTML = packInfo.server.start;
                    serverEnd!.innerHTML = packInfo.server.end;
                    if (packInfo.pack.available) {
                        packDownload!.setAttribute('href', packInfo.pack.download.replace('PACKID', packInfo.pack.id).replace('FILEID', packInfo.pack.fileId));
                    } else {
                        packDownload!.innerHTML = 'ModPack Unavailable';
                        packDownload?.classList.add('disabled');
                        if (!packInfo.pack.download) packDownload?.remove();
                    }
                    if (packInfo.world.available) {
                        download!.setAttribute('href', `/minecraft/servers/${pack}.${packInfo.world.type}`);
                    } else {
                        download!.innerHTML = 'World Download Unavailable';
                        download?.classList.add('disabled');
                    }
                }
            );
        } else {
            reply.code(404);
            //statusPage(reply, { code: 404, title: 'Not Found' });
            return reply;
        }
    });
    fastify.get('/servers/:IDENTIFIER.:type', (req, reply) => {
        const { IDENTIFIER, type } = req.params as test;
        if (fs.existsSync(path.join(process.cwd(), 'public/minecraft/servers', `${IDENTIFIER}/world.${type}`))) {
            reply.sendFile(`world.${type}`, path.join(process.cwd(), 'public/minecraft/servers', IDENTIFIER));
        } else reply.send({ IDENTIFIER, status: 'World Not Found.' });
    });
    fastify.get('/servers/:IDENTIFIER/packIcon.:type', (req, reply) => {
        const { IDENTIFIER, type } = req.params as test;
        if (fs.existsSync(path.join(process.cwd(), 'public/minecraft/servers', `${IDENTIFIER}/packIcon.${type}`))) {
            reply.sendFile(`packIcon.${type}`, path.join(process.cwd(), 'public/minecraft/servers', IDENTIFIER));
        } else {
            reply.code(400);
            //statusPage(reply, { code: 400, title: 'Bad Request' });
            return reply;
        }
    });
}

export default routes;
