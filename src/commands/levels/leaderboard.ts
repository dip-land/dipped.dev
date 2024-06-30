import { Command } from '../../classes/Command.js';

export default new Command({
    name: 'leaderboard',
    description: 'Sends the servers leaderboard.',
    disabled: false,
    category: 'levels',
    deferReply: false,
    dm_permission: false,
    hidden: false,
    options: [],
    async slashCommand({ interaction, client }) {
        if (!interaction.guildId) return;
        const url = `https://dipped.dev/role-eater/dashboard/${interaction.guildId}`;
        interaction.reply({
            embeds: [
                {
                    image: { url: `${url}.png?c=${Date.now()}` },
                    color: client.embedColor,
                    footer: { text: 'XP is Messages + Voice Chat time' },
                },
            ],
            components: [
                {
                    type: 1,
                    components: [{ type: 2, label: 'View Full Leaderboard', url, style: 5 }],
                },
            ],
        });
    },
});
