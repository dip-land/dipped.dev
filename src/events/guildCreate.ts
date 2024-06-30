import type { VoiceState } from 'discord.js';
import { Event } from '../classes/Event.js';
import { editUserAll } from '../handlers/database.js';

export default new Event('guildCreate', {
    on: true,
    async fn() {
        return;
    },
});
