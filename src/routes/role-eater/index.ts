import { FastifyInstance } from 'fastify';
import { constructPage } from '../../constants.js';

async function routes(fastify: FastifyInstance) {
    fastify.get('/', async (req, reply) => {
        constructPage(reply, {
            language: 'en-US',
            head: {
                title: 'Role Eater Dashboard - dipped.dev',
                description: 'Server Dashboard.',
                image: '/static/images/favicon.png',
                files: ['public/root/head.html', 'public/role-eater/head.html'],
            },
            body: { files: ['public/root/nav.html', 'public/role-eater/index.html'] },
        });
        return reply;
    });

    fastify.register((await import('./dashboard.js')).default, { prefix: '/dashboard' });
}

export default routes;
