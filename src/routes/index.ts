import { FastifyInstance } from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyFavicon from 'fastify-favicon';
import { constructPage } from '../constants.js';
import path from 'path';

async function routes(fastify: FastifyInstance) {
    fastify.register(fastifyStatic, { root: path.join(process.cwd(), 'public/'), prefix: '/static/' });
    fastify.register(fastifyFavicon, { path: path.join(process.cwd(), 'public/images/'), name: 'favicon.ico', maxAge: 3600 });
    fastify.setNotFoundHandler({ preValidation: (req, res, done) => done(), preHandler: (req, res, done) => done() }, async function (req, res) {
        constructPage(res, {
            language: 'en-US',
            head: {
                title: 'Page Not Found',
                description: 'Error 404, Page Not Found.',
                image: '/static/images/favicon.png',
                files: ['public/root/head.html'],
            },
            body: { files: ['public/root/nav.html', 'public/root/404.html'] },
        });
        return res;
    });
    fastify.all('/', (req, reply) => {
        constructPage(reply, {
            language: 'en-US',
            head: { title: 'Home', description: '', image: '/static/images/favicon.png', files: ['public/root/head.html'] },
            body: { files: ['public/root/nav.html', 'public/root/index.html'] },
        });
        return reply;
    });

    fastify.register((await import('./api/index.js')).default, { prefix: '/api' });
    fastify.register((await import('./minecraft.js')).default, { prefix: '/minecraft' });
    fastify.register((await import('./role-eater/index.js')).default, { prefix: '/role-eater' });
}

export default routes;
