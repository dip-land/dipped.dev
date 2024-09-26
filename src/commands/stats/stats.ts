import { Command } from '../../classes/Command.js';
import { ApplicationCommandOptionType, GuildMember } from 'discord.js';
import { AttachmentBuilder } from 'discord.js';
import { launch } from 'puppeteer';
import { getUser, updateUser } from '../../handlers/database.js';

export default new Command({
    name: 'stats',
    description: 'Shows a users stats.',
    disabled: false,
    category: 'stats',
    deferReply: false,
    dm_permission: false,
    hidden: false,
    options: [{ required: true, name: 'user', type: ApplicationCommandOptionType.User, description: 'The user stats you want to see.' }],
    async slashCommand({ interaction, options, client }) {
        const userOption = options.getMember('user') as GuildMember;
        if (!interaction.guildId || userOption?.pending) return;
        await interaction.reply('Loading <a:wiggle:1190127338101415957>');
        const user = await getUser(userOption.guild.id, userOption.user.id);
        if (user && user.voice.channelID !== null)
            await updateUser(userOption.guild.id, userOption.user.id, {
                voice: {
                    time: user.id === '322945996931727361' ? ((Date.now() - user.voice.lastJoinDate) / 60000) * 0.8 : (Date.now() - user.voice.lastJoinDate) / 60000,
                    join: Date.now(),
                },
            });

        const browser = await launch();
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 706 });
        await page.goto(`http://localhost:${process.env.WEB_PORT}/role-eater/dashboard/${interaction.guildId}/${userOption.user.id}.png`, {
            waitUntil: 'networkidle2',
        });
        const ss = await page.screenshot({ optimizeForSpeed: true, omitBackground: true });

        const attachment = new AttachmentBuilder(Buffer.from(ss.buffer), { name: `${userOption.user.username}_stats.png` });
        interaction.editReply({ content: '', files: [attachment] });
        await browser.close();
    },
    async contextUserCommand({ interaction, options, client }) {
        const userOption = options.getMember('user') as GuildMember;
        if (!interaction.guildId || userOption?.pending) return;
        await interaction.reply({ content: 'Loading <a:wiggle:1190127338101415957>', ephemeral: true });
        const user = await getUser(userOption.guild.id, userOption.user.id);
        if (user && user.voice.channelID !== null)
            await updateUser(userOption.guild.id, userOption.user.id, {
                voice: {
                    time: user.id === '322945996931727361' ? ((Date.now() - user.voice.lastJoinDate) / 60000) * 0.8 : (Date.now() - user.voice.lastJoinDate) / 60000,
                    join: Date.now(),
                },
            });

        const browser = await launch();
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 706 });
        await page.goto(`http://localhost:${process.env.WEB_PORT}/role-eater/dashboard/${interaction.guildId}/${userOption.user.id}.png`, {
            waitUntil: 'networkidle2',
        });
        const ss = await page.screenshot({ optimizeForSpeed: true, omitBackground: true });

        const attachment = new AttachmentBuilder(Buffer.from(ss.buffer), { name: `${userOption.user.username}_stats.png` });
        interaction.editReply({ content: '', files: [attachment] });
        await browser.close();
    },
});
