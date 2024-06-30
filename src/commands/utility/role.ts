import { ApplicationCommandOptionType, GuildMember } from 'discord.js';
import { Command } from '../../classes/Command.js';
import { getUser, editUser } from '../../handlers/database.js';

export default new Command({
    name: 'role',
    description: 'Assign yourself a custom role.',
    disabled: false,
    category: 'utility',
    deferReply: true,
    dm_permission: false,
    hidden: true,
    options: [
        {
            name: 'create',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'Creates a custom role if you do not have one or edits your existing role.',
            options: [
                { required: true, name: 'name', type: ApplicationCommandOptionType.String, description: 'Name of your custom role.', max_length: 64 },
                { required: true, name: 'color', type: ApplicationCommandOptionType.String, description: 'Hex Color code of your role.', max_length: 7, min_length: 6 },
            ],
        },
        {
            name: 'edit',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'Edits a custom role if you have one or creates a new one.',
            options: [
                { required: false, name: 'color', type: ApplicationCommandOptionType.String, description: 'Hex Color code of your role.', max_length: 7, min_length: 6 },
                { required: false, name: 'name', type: ApplicationCommandOptionType.String, description: 'New name for your custom role.', max_length: 64 },
            ],
        },
        {
            name: 'delete',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'Deletes your custom role if you have one.',
        },
    ],
    async slashCommand({ interaction, options }) {
        const name = options.getString('name') as string;
        const color = ('#' + options.getString('color')?.replaceAll('#', '')) as `#${string}`;
        switch (options.data[0].name) {
            case 'create':
                interaction.guild?.roles
                    .create({ name, color, position: interaction.guild.roles.highest.position - 1 })
                    .then(async (role) => {
                        await editUser(interaction.guildId as string, interaction.member?.user.id as string, { 'role.id': role.id, 'role.name': name, 'role.color': color });
                        (interaction.member as GuildMember).roles.add(role.id);
                        interaction.editReply('Role created and added!');
                        role.setPosition(interaction.guild!.roles.highest.position - 1);
                    })
                    .catch((e) => {
                        console.log(e);
                    });
                break;
            case 'edit':
                const setData =
                    name && options.getString('color') ? { 'role.name': name, 'role.color': color } : name ? { 'role.name': name } : { 'role.name': name, 'role.color': color };
                editUser(interaction.guildId as string, interaction.member?.user.id as string, setData).then(async (document) => {
                    if (!document) return;
                    if (!document!.role?.id) return interaction.editReply('You have not created a role with this bot use `/role create` instead.');
                    interaction.guild?.roles
                        .fetch(document!.role.id)
                        .then((role) => {
                            if (!role) return interaction.editReply('Role missing.');
                            if (name) role.setName(name);
                            if (options.getString('color')) role.setColor(color);
                            interaction.editReply('Role updated!');
                        })
                        .catch((e) => {
                            console.log(e);
                        });
                });
                break;
            case 'delete':
                const document = await getUser(interaction.guildId as string, interaction.member?.user.id as string);
                if (!document) return;
                if (document!.role?.id) {
                    interaction.guild?.roles.fetch(document!.role.id).then(async (role) => {
                        if (!role) return interaction.editReply("You don't have any custom roles.");
                        role.delete(`Deleted by command initiated by ${interaction.member?.user.id}`);
                        interaction.editReply('Role deleted!');
                        await editUser(interaction.guildId as string, interaction.member?.user.id as string, { role: {} });
                    });
                }
                break;
        }
    },
});
