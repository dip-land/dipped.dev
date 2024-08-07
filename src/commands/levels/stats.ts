import { Command } from '../../classes/Command.js';
import { ApplicationCommandOptionType, GuildMember } from 'discord.js';
import { AttachmentBuilder } from 'discord.js';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { launch } from 'puppeteer';
import { getUser, updateUser } from '../../handlers/database.js';

export default new Command({
    name: 'stats',
    description: 'Shows a users level stats.',
    disabled: false,
    category: 'levels',
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
                    time: user.id === '322945996931727361' ? (Date.now() - user.voice.lastJoinDate) / 60000 / 1.1 : (Date.now() - user.voice.lastJoinDate) / 60000,
                    join: Date.now(),
                },
            });
        const canvas = createCanvas(1280, 706);
        const ctx = canvas.getContext('2d');
        const browser = await launch();
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 706 });
        await page.goto(`http://localhost:8011/role-eater/dashboard/${interaction.guildId}/${userOption.user.id}.png`, {
            waitUntil: 'networkidle2',
        });
        const ss = await page.screenshot();
        const stats = await loadImage(ss);
        ctx.beginPath();
        ctx.roundRect(0, 0, 1280, 706, 20);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(stats, 0, 0, 1280, 706);

        const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: `${userOption.user.username}_stats.png` });
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
                    time: user.id === '322945996931727361' ? (Date.now() - user.voice.lastJoinDate) / 60000 / 1.1 : (Date.now() - user.voice.lastJoinDate) / 60000,
                    join: Date.now(),
                },
            });
        const canvas = createCanvas(1280, 706);
        const ctx = canvas.getContext('2d');
        const browser = await launch();
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 706 });
        await page.goto(`http://localhost:8011/role-eater/dashboard/${interaction.guildId}/${userOption.user.id}.png`, {
            waitUntil: 'networkidle2',
        });
        const ss = await page.screenshot();
        const stats = await loadImage(ss);
        ctx.beginPath();
        ctx.roundRect(0, 0, 1280, 706, 20);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(stats, 0, 0, 1280, 706);

        const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: `${userOption.user.username}_stats.png` });
        interaction.editReply({ content: '', files: [attachment] });
        await browser.close();
    },
});
