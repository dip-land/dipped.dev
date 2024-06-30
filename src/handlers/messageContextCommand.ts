import type { Collection, MessageContextMenuCommandInteraction } from 'discord.js';
import { client } from '../index.js';

export default async (interaction: MessageContextMenuCommandInteraction) => {
    const cmd = client.slashCommands.get(interaction.commandName);
    if (!cmd || cmd.disabled || !cmd.contextMessageCommand) return interaction.reply({ content: 'This command is disabled, it may be re-enabled in the future.', ephemeral: true });
    const hidden = !!interaction.options.get('hide')?.value || cmd.hidden || false;
    if (cmd.deferReply) await interaction.deferReply({ ephemeral: hidden });
    if (client.isBotOwner(interaction.user)) return cmd?.contextMessageCommand({ interaction, options: interaction.options, client });

    const timestamps = client.cooldowns.get(cmd.name) as Collection<string, number>;
    const now = Date.now();
    if (timestamps.has(interaction.user.id)) {
        const expire = (timestamps.get(interaction.user.id) as number) + cmd.cooldown;
        if (now < expire) return interaction.reply({ content: `Please wait \`${(expire - now) / 1_000}\` seconds before reusing the \`${cmd.name}\` command.`, ephemeral: true });
    }
    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cmd.cooldown);

    if (cmd.permissions) {
        for (const permission of cmd.permissions) {
            if (interaction.memberPermissions && !interaction.memberPermissions.has(permission))
                return interaction.reply({ content: 'You seem to be missing permissions to use this command.', ephemeral: true });
        }
    }

    cmd.contextMessageCommand({ interaction, options: interaction.options, client }).catch((err) => client.error(err));
};
