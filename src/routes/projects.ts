import { FastifyInstance } from 'fastify';
import { constructPage } from '../constants.js';

async function routes(fastify: FastifyInstance, options: any) {
    fastify.all('/', (req, reply) => {
        constructPage(reply, {
            language: 'en-US',
            head: { title: 'Page Not Found', description: 'Error 404, Page Not Found.', image: '/static/icons/favicon.png', files: ['public/html/head.html'] },
            body: { files: ['public/html/nav.html', 'public/html/projects.html'] },
        });
        return reply;
    });
}

export default routes;
