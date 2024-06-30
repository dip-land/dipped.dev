import { Command } from '../../classes/Command.js';
import { exec } from 'child_process';

export default new Command({
    name: 'ping',
    description: 'Shows the bots ping.',
    disabled: false,
    category: 'utility',
    deferReply: false,
    dm_permission: false,
    hidden: false,
    options: [],
    async slashCommand({ interaction, client }) {
        exec('ping -n 1 172.67.133.38', function (err, stdout, stderr) {
            interaction.reply({
                embeds: [
                    {
                        title: 'Ping Command',
                        fields: [
                            {
                                name: 'Bot',
                                value: `${Date.now() - interaction.createdTimestamp}ms`,
                                inline: true,
                            },
                            {
                                name: 'Gateway',
                                value: `${client.ws.ping}ms`,
                                inline: true,
                            },
                            {
                                name: 'Dipped.dev',
                                value: `${stdout
                                    .match(/Average = \d+/g)
                                    ?.at(0)
                                    ?.replace('Average =', '')}ms`,
                                inline: true,
                            },
                        ],
                        color: client.embedColor,
                    },
                ],
            });
        });
    },
});
