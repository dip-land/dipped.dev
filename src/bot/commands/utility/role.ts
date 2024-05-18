import { ApplicationCommandOptionType, GuildMember } from 'discord.js';
import { Command } from '../../classes/Command.js';
import { getCollection } from '../../handlers/database.js';

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
                { required: true, name: 'color', type: ApplicationCommandOptionType.String, description: 'Hex Color code of your role.', max_length: 7, min_length: 6 },
                { required: false, name: 'name', type: ApplicationCommandOptionType.String, description: 'New name for your custom role.', max_length: 64 },
            ],
        },
        {
            name: 'delete',
            type: ApplicationCommandOptionType.Subcommand,
            description: 'Deletes your custom role if you have one.',
        },
    ],
    async slashCommand({ interaction, options, client }) {
        const collection = getCollection(interaction.guildId as string);
        if (options.data[0].name === 'create') {
            const name = options.getString('name') as string;
            const color = ('#' + options.getString('color')?.replaceAll('#', '')) as `#${string}`;
            collection.findOneAndUpdate({ userID: interaction.member?.user.id }, { $set: { name, color } }, { upsert: true }).then(async () => {
                interaction.guild?.roles
                    .create({ name, color, position: interaction.guild.roles.highest.position - 1 })
                    .then(async (role) => {
                        await collection.findOneAndUpdate({ userID: interaction.member?.user.id }, { $set: { roleID: role.id } });
                        (interaction.member as GuildMember).roles.add(role.id);
                        interaction.editReply('Role created and added!');
                        role.setPosition(interaction.guild!.roles.highest.position - 1);
                    })
                    .catch((e) => {
                        console.log(e);
                    });
            });
        } else if (options.data[0].name === 'edit') {
            const name = options.getString('name') as string;
            const color = ('#' + options.getString('color')?.replaceAll('#', '')) as `#${string}`;
            const setData = name ? { name, color } : { color };
            collection.findOneAndUpdate({ userID: interaction.member?.user.id }, { $set: setData }).then(async (doc) => {
                if (!doc) return interaction.editReply('You have not created a role with this bot use `/role create` instead.');
                const document = await collection.findOne({ userID: interaction.member?.user.id });
                interaction.guild?.roles
                    .fetch(document!.roleID)
                    .then((role) => {
                        if (!role) return interaction.editReply('Role missing.');
                        role.setName(document!.name);
                        role.setColor(color);
                        role.setPosition(interaction.guild!.roles.highest.position - 1);
                        interaction.editReply('Role updated!');
                    })
                    .catch((e) => {
                        console.log(e);
                    });
            });
        } else if (options.data[0].name === 'delete') {
            const document = await collection.findOne({ userID: interaction.member?.user.id });
            if (document!.roleID) {
                interaction.guild?.roles.fetch(document!.roleID).then(async (role) => {
                    if (!role) return interaction.editReply("You don't have any custom roles.");
                    role.delete(`Deleted by command initiated by ${interaction.member?.user.id}`);
                    interaction.editReply('Role deleted!');
                    await collection.deleteOne({ userID: interaction.member?.user.id });
                });
            }
        }
    },
    // async webTrigger(message, client) {
    //     const collection = getCollection(message.guild as string);
    //     if (message.status === 'create' || message.status === 'edit') {
    //         const name = message.name as string;
    //         const color = ('#' + message.color?.replaceAll('#', '')) as `#${string}`;
    //         collection.findOneAndUpdate({ userID: message.user }, { $set: { name, color } }, { upsert: true }).then(async () => {
    //             const document = await collection.findOne({ userID: message.user });
    //             if (document!.roleID) {
    //                 (await client.guilds.fetch(message.guild as string)).roles.fetch(document!.roleID).then((role) => {
    //                     if (!role) return process.send!('Role Error');
    //                     role.setName(name);
    //                     role.setColor(color);
    //                 });
    //             } else {
    //                 (await client.guilds.fetch(message.guild as string)).roles.create({ name, color }).then(async (role) => {
    //                     await collection.findOneAndUpdate({ userID: message.user }, { $set: { roleID: role.id } });
    //                     ((await (await client.guilds.fetch(message.guild as string)).members.fetch(message.user as string)) as GuildMember).roles.add(role.id);
    //                 });
    //             }
    //         });
    //     } else if (message.status === 'delete') {
    //         (await client.guilds.fetch(message.guild as string)).roles.fetch(message.role as string).then(async (role) => {
    //             if (!role) return process.send!('Role Deletion Error');
    //             role.delete(`Deleted by command initiated by ${message.user}`);
    //             await collection.deleteOne({ userID: message.user });
    //         });
    //     }
    // },
});
