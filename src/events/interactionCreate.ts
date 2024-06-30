import { type Interaction } from 'discord.js';
import { Event } from '../classes/Event.js';
import slashCommand from '../handlers/slashCommand.js';
import contextCommand from '../handlers/userContextCommand.js';
import userContextCommand from '../handlers/userContextCommand.js';
import messageContextCommand from '../handlers/messageContextCommand.js';

export default new Event('interactionCreate', {
    on: true,
    async fn(interaction: Interaction) {
        if (!interaction.id) return;
        if (interaction.isChatInputCommand()) return slashCommand(interaction);
        if (interaction.isUserContextMenuCommand()) return userContextCommand(interaction);
        if (interaction.isMessageContextMenuCommand()) return messageContextCommand(interaction);
    },
});
