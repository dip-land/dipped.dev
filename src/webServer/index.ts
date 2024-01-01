import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyFavicon from 'fastify-favicon';
import { constructPage } from './constants.js';
import path from 'path';
import { Logger } from './classes/logger.js';
const logger = new Logger();

const fastify = Fastify({ logger: false, ignoreTrailingSlash: true });
fastify.register(fastifyStatic, {
    root: path.join(process.cwd(), 'public/root/static/'),
    prefix: '/static/', // optional: default '/'
});
fastify.register(fastifyFavicon, { path: path.join(process.cwd(), 'public/root/static/icons/'), name: 'favicon.ico', maxAge: 3600 });
fastify.register((await import('./database.js')).default);
fastify.setNotFoundHandler({ preValidation: (req, res, done) => done(), preHandler: (req, res, done) => done() }, async function (req, res) {
    constructPage(res, {
        language: 'en-US',
        head: {
            title: 'Page Not Found - DipLand',
            description: 'Error 404, Page Not Found.',
            image: '/static/icons/favicon.png',
            files: ['public/root/head.html'],
        },
        body: { files: ['public/root/nav.html', 'public/root/404.html'] },
    });
    return res;
});

fastify.get('/', async (req, res) => {
    constructPage(res, {
        language: 'en-US',
        head: {
            title: 'DipLand',
            description: 'Home.',
            image: '/static/icons/favicon.png',
            files: ['public/root/head.html'],
        },
        body: { files: ['public/root/nav.html', 'public/root/home.html'] },
    });
    return res;
});

fastify.register((await import('./dashboard.js')).default);

try {
    await fastify.listen({ port: 4000 });
    logger.log('Online');
} catch (err) {
    logger.error(err);
}
