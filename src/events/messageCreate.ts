import type { Message } from 'discord.js';
import { Event } from '../classes/Event.js';
import prefixCommand from '../handlers/prefixCommand.js';
import { messageCreate } from '../handlers/database.js';

export default new Event('messageCreate', {
    on: true,
    async fn(message: Message<boolean>) {
        if (message.author.bot || message.author.system || !message.guild) return;
        messageCreate(message.client, message.guildId as string, message.author.id);

        let prefix = message.content.startsWith('.') ? '.' : undefined;
        //if (config && config.prefixes) prefix = config.prefixes.find((p) => message.content.startsWith(p));
        if (!prefix) return;
        prefixCommand(message, prefix);
    },
});
