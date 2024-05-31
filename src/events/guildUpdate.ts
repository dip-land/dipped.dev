import type { Guild } from 'discord.js';
import { Event } from '../classes/Event.js';
import { editGuildInfo, editUserAll } from '../handlers/database.js';

export default new Event({
    name: 'guildUpdate',
    on: true,
    async fn(oldGuild: Guild, newGuild: Guild) {
        console.log('good');
        await editGuildInfo(newGuild.id, { name: 'test' });
        await editGuildInfo(newGuild.id, { name: newGuild.name, icon: newGuild.iconURL() });
    },
});
