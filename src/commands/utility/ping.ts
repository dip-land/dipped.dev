import { Command } from '../../classes/Command.js';
import botinfo from './botinfo.js';

export default new Command({
    name: 'ping',
    description: 'Shows the bots ping and uptime.',
    disabled: false,
    category: 'utility',
    deferReply: false,
    dm_permission: false,
    hidden: false,
    options: [],
    async slashCommand({ interaction, options, client }) {
        if (botinfo.slashCommand) botinfo.slashCommand({ interaction, options, client });
    },
    async prefixCommand({ message, args, client }) {
        if (botinfo.prefixCommand) botinfo.prefixCommand({ message, args, client });
    },
});
