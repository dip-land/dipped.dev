import { ActivityType, Partials } from 'discord.js';
import { Client } from './classes/Client.js';
import 'dotenv/config';
import role from './commands/utility/role.js';

export const client = new Client({
    intents: ['Guilds', 'GuildMessages', 'MessageContent', 'GuildMembers', 'GuildMessageReactions'],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.once('ready', async () => {
    client.log(`Online`);
    client.user?.setPresence({ activities: [{ name: 'Playing with roles', type: ActivityType.Custom }], status: 'online' });
    await client.registerEvents();
    await client.registerCommands(['global', '1182260148501225552']);
});

// process.on('message', (message: { type: string; status: string; name?: string; color?: string; user?: string; guild?: string; role?: string }) => {
//     if (message.type === 'role') {
//         role.webTrigger!(message, client);
//     }
// });

client.login(process.env.TOKEN);
