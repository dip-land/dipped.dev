import type { Message } from 'discord.js';
import { Event } from '../classes/Event.js';
import prefixCommand from '../handlers/prefixCommand.js';

export default new Event({
    name: 'messageCreate',
    on: true,
    async fn(message: Message<boolean>) {
        if (message.author.bot || message.author.system) return;

        let prefix = message.content.startsWith('.') ? '.' : undefined;
        //if (config && config.prefixes) prefix = config.prefixes.find((p) => message.content.startsWith(p));
        if (!prefix) return;
        prefixCommand(message, prefix);
    },
});
