import { FastifyInstance } from 'fastify';
import { constructPage } from '../constants.js';

async function routes(fastify: FastifyInstance, options: any) {
    fastify.all('/', (req, reply) => {
        constructPage(reply, {
            language: 'en-US',
            head: { title: 'Page Not Found', description: 'Error 404, Page Not Found.', image: '/static/icons/favicon.png', files: ['public/root/head.html'] },
            body: { files: ['public/root/nav.html', 'public/root/projects.html'] },
        });
        return reply;
    });
}

export default routes;
