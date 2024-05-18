import { Event } from '../classes/Event.js';
import { client } from '../index.js';

export default new Event({
    name: 'error',
    on: true,
    async fn(error: Error) {
        client.error(error);
    },
});
