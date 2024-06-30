import { ApplicationCommandOptionType } from 'discord.js';
import { Command } from '../../classes/Command.js';

export default new Command({
    name: 'emojj',
    description: 'Does some emoji stuff',
    disabled: false,
    category: 'utility',
    deferReply: true,
    dm_permission: false,
    hidden: true,
    options: [
        {
            name: 'steal',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'Steals an emoji from a message',
            options: [
                {
                    required: true,
                    name: 'message_id',
                    type: ApplicationCommandOptionType.String,
                    description: 'ID of the message that contains the emoji you want to steal',
                    max_length: 64,
                },
                {
                    required: true,
                    name: 'name',
                    type: ApplicationCommandOptionType.String,
                    description: 'Give the stolen emoji a name',
                    max_length: 48,
                    min_length: 2,
                },
            ],
        },
    ],
    async slashCommand({ interaction, options }) {
        const messageID = options.getString('message_id') as string;
        const name = options.getString('name') as string;
        switch (options.data[0].name) {
            case 'steal':
                const message = await interaction.channel?.messages.fetch(messageID);
                if (!message) return interaction.editReply('Message does not exist or is not in this channel.');
                const emotes = message?.content.match(/<a?:.+?:(\d{18}>|\d{19}>)/g)?.map((emoji) => {
                    const split = emoji.split(':');
                    return split[split.length - 1]?.replace('>', '');
                });
                if (!emotes) return interaction.editReply('Message does not contain any emojis.');
                interaction!
                    .guild!.emojis.create({
                        name,
                        attachment: `https://cdn.discordapp.com/emojis/${emotes[0]}`,
                    })
                    .then(() => {
                        interaction.editReply(`Emoji :${name}: Created.`);
                    });
                // for (const emote of emotes) {
                // }
                break;
        }
    },
});
