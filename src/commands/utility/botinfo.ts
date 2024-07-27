import { Command } from '../../classes/Command.js';
import { exec } from 'child_process';

export default new Command({
    name: 'botinfo',
    description: 'Shows the bots ping and uptime.',
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
                        title: 'Bot Info',
                        fields: [
                            {
                                name: '**• Latency**',
                                value: `> ${Date.now() - interaction.createdTimestamp}ms`,
                                inline: true,
                            },
                            {
                                name: '**• Gateway Latency**',
                                value: `> ${client.ws.ping}ms`,
                                inline: true,
                            },
                            {
                                name: '**• Dipped.dev Latency**',
                                value: `> ${stdout
                                    .match(/Average = \d+/g)
                                    ?.at(0)
                                    ?.replace('Average =', '')}ms`,
                                inline: false,
                            },
                            {
                                name: '**• Uptime**',
                                value: `<t:${((Date.now() - (client.uptime as number)) / 1000).toFixed(0)}:R>`,
                                inline: false,
                            },
                        ],
                        color: client.embedColor,
                    },
                ],
            });
        });
    },
    async prefixCommand({ message, client }) {
        exec('ping -n 1 172.67.133.38', function (err, stdout, stderr) {
            message.reply({
                embeds: [
                    {
                        title: 'Bot Info',
                        fields: [
                            {
                                name: '**• Latency**',
                                value: `> ${Date.now() - message.createdTimestamp}ms`,
                                inline: true,
                            },
                            {
                                name: '**• Gateway Latency**',
                                value: `> ${client.ws.ping}ms`,
                                inline: true,
                            },
                            {
                                name: '**• Dipped.dev Latency**',
                                value: `> ${stdout
                                    .match(/Average = \d+/g)
                                    ?.at(0)
                                    ?.replace('Average =', '')}ms`,
                                inline: false,
                            },
                            {
                                name: '**• Uptime**',
                                value: `<t:${((Date.now() - (client.uptime as number)) / 1000).toFixed(0)}:R>`,
                                inline: false,
                            },
                        ],
                        color: client.embedColor,
                    },
                ],
            });
        });
    },
});
