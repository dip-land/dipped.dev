import { ApplicationCommandOptionType, PermissionFlagsBits } from 'discord.js';
import { Command } from '../../classes/Command.js';

export default new Command({
    name: 'adminstats',
    description: 'Alter user stats.',
    disabled: false,
    category: 'stats',
    deferReply: false,
    dm_permission: false,
    hidden: false,
    default_member_permissions: PermissionFlagsBits.Administrator.toString(),
    options: [
        {
            name: 'include',
            description: 'Sets a channel or users stat modifiers to 1.',
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: 'channel',
                    description: 'Sets a channels stat modifiers to 1.',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'value',
                            description: 'Channel to include.',
                            type: ApplicationCommandOptionType.Channel,
                            required: true,
                        },
                    ],
                },
                {
                    name: 'user',
                    description: 'Sets a users stat modifiers to 1.',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'value',
                            description: 'User to include.',
                            type: ApplicationCommandOptionType.User,
                            required: true,
                        },
                    ],
                },
            ],
        },
        {
            name: 'exclude',
            description: 'Sets a channel or users stat modifiers to 0.',
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: 'channel',
                    description: 'Sets a channels stat modifiers to 0.',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'value',
                            description: 'Channel to exclude.',
                            type: ApplicationCommandOptionType.Channel,
                            required: true,
                        },
                    ],
                },
                {
                    name: 'user',
                    description: 'Sets a users stat modifiers to 0.',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'value',
                            description: 'User to exclude.',
                            type: ApplicationCommandOptionType.User,
                            required: true,
                        },
                    ],
                },
            ],
        },
        {
            name: 'notification_channel',
            description: 'Alter this commands notification channel',
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: 'disable',
                    description: 'Disables notifications for this command.',
                    type: ApplicationCommandOptionType.Subcommand,
                },
                {
                    name: 'enable',
                    description: 'Enables notifications for this command.',
                    type: ApplicationCommandOptionType.Subcommand,
                },
                {
                    name: 'reset',
                    description: 'Resets notification channel.',
                    type: ApplicationCommandOptionType.Subcommand,
                },
                {
                    name: 'set',
                    description: 'Set notification channel.',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'channel',
                            description: 'Channel to set as notification channel.',
                            type: ApplicationCommandOptionType.Channel,
                            required: true,
                        },
                    ],
                },
            ],
        },
        {
            name: 'message',
            description: 'Alter a users message stats.',
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: 'modifier',
                    description: 'Apply a modifier to a users message stats.',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'user',
                            required: true,
                            description: 'User to alter.',
                            type: ApplicationCommandOptionType.User,
                        },
                        {
                            name: 'value',
                            required: true,
                            description: 'Value to set modifier to.',
                            type: ApplicationCommandOptionType.Number,
                            min_value: 0,
                            max_value: 10,
                        },
                    ],
                },
                {
                    name: 'set',
                    description: 'Alter a users message stats.',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'user',
                            required: true,
                            description: 'User to alter.',
                            type: ApplicationCommandOptionType.User,
                        },
                        {
                            name: 'value',
                            required: true,
                            description: 'Value to set time to.',
                            type: ApplicationCommandOptionType.Number,
                            min_value: 0,
                        },
                    ],
                },
                {
                    name: 'set_history',
                    description: 'Alter a users message history.',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'user',
                            required: true,
                            description: 'User to alter.',
                            type: ApplicationCommandOptionType.User,
                        },
                        {
                            name: 'day',
                            required: true,
                            description: 'Date to alter.',
                            type: ApplicationCommandOptionType.String,
                        },
                        {
                            name: 'value',
                            required: true,
                            description: 'Value to set time to.',
                            type: ApplicationCommandOptionType.Number,
                            min_value: 0,
                        },
                    ],
                },
                {
                    name: 'reset',
                    description: 'Resets a users message stats.',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'user',
                            required: true,
                            description: 'User to reset.',
                            type: ApplicationCommandOptionType.User,
                        },
                    ],
                },
                {
                    name: 'reset_history',
                    description: 'Resets a users message history.',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'user',
                            required: true,
                            description: 'User to reset.',
                            type: ApplicationCommandOptionType.User,
                        },
                    ],
                },
            ],
        },
        {
            name: 'voice',
            description: 'Alter a users voice stats.',
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: 'modifier',
                    description: 'Apply a modifier to a users voice stats.',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'user',
                            required: true,
                            description: 'User to alter.',
                            type: ApplicationCommandOptionType.User,
                        },
                        {
                            name: 'value',
                            required: true,
                            description: 'Value to set modifier to.',
                            type: ApplicationCommandOptionType.Number,
                            min_value: 0,
                            max_value: 10,
                        },
                    ],
                },
                {
                    name: 'set',
                    description: 'Alter a users voice stats.',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'user',
                            required: true,
                            description: 'User to alter.',
                            type: ApplicationCommandOptionType.User,
                        },
                        {
                            name: 'value',
                            required: true,
                            description: 'Value to set time to.',
                            type: ApplicationCommandOptionType.Number,
                            min_value: 0,
                        },
                    ],
                },
                {
                    name: 'set_history',
                    description: 'Alter a users voice history.',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'user',
                            required: true,
                            description: 'User to alter.',
                            type: ApplicationCommandOptionType.User,
                        },
                        {
                            name: 'day',
                            required: true,
                            description: 'Date to alter.',
                            type: ApplicationCommandOptionType.String,
                        },
                        {
                            name: 'value',
                            required: true,
                            description: 'Value to set time to.',
                            type: ApplicationCommandOptionType.Number,
                            min_value: 0,
                        },
                    ],
                },
                {
                    name: 'reset',
                    description: 'Resets a users voice stats.',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'user',
                            required: true,
                            description: 'User to reset.',
                            type: ApplicationCommandOptionType.User,
                        },
                    ],
                },
                {
                    name: 'reset_history',
                    description: 'Resets a users voice history.',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'user',
                            required: true,
                            description: 'User to reset.',
                            type: ApplicationCommandOptionType.User,
                        },
                    ],
                },
            ],
        },
    ],
    async slashCommand({ interaction, options, client }) {
        const group = options.getSubcommandGroup();
        const subcommand = options.getSubcommand();
        console.log(group, subcommand, options);
        if (group === 'include') {
            if (subcommand === 'channel') {
                const channel = options.getChannel('value', true);
            } else if (subcommand === 'user') {
                const user = options.getMember('value');
            }
        } else if (group === 'exclude') {
            if (subcommand === 'channel') {
                const channel = options.getChannel('value', true);
            } else if (subcommand === 'user') {
                const user = options.getMember('value');
            }
        } else if (group === 'notification_channel') {
            if (subcommand === 'disable') {
            } else if (subcommand === 'enable') {
            } else if (subcommand === 'set') {
                const channel = options.getChannel('channel', true);
            } else if (subcommand === 'reset') {
            }
        } else if (group === 'message') {
            if (subcommand === 'modifier') {
                const user = options.getMember('user');
                const value = options.getNumber('value', true);
            } else if (subcommand === 'set') {
                const user = options.getMember('user');
                const value = options.getNumber('value', true);
            } else if (subcommand === 'set_history') {
                const user = options.getMember('user');
                const day = options.getString('day', true);
                const value = options.getNumber('value', true);
            } else if (subcommand === 'reset') {
                const user = options.getMember('user');
            } else if (subcommand === 'reset_history') {
                const user = options.getMember('user');
            }
        } else if (group === 'voice') {
            if (subcommand === 'modifier') {
                const user = options.getMember('user');
                const value = options.getNumber('value', true);
            } else if (subcommand === 'set') {
                const user = options.getMember('user');
                const value = options.getNumber('value', true);
            } else if (subcommand === 'set_history') {
                const user = options.getMember('user');
                const day = options.getString('day', true);
                const value = options.getNumber('value', true);
            } else if (subcommand === 'reset') {
                const user = options.getMember('user');
            } else if (subcommand === 'reset_history') {
                const user = options.getMember('user');
            }
        }
    },
});
