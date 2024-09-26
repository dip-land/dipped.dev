import { Command } from '../../classes/Command.js';
import { AttachmentBuilder } from 'discord.js';
import { launch } from 'puppeteer';
import { getUser, updateUser } from '../../handlers/database.js';

export default new Command({
    name: 'me',
    description: 'Shows your stats.',
    disabled: false,
    category: 'stats',
    deferReply: false,
    dm_permission: false,
    hidden: false,
    options: [],
    async slashCommand({ interaction, client }) {
        if (!interaction.guildId) return;
        await interaction.reply('Loading <a:wiggle:1190127338101415957>');
        const user = await getUser(interaction.guildId, interaction.user.id);
        if (user && user.voice.channelID !== null)
            await updateUser(interaction.guildId, interaction.user.id, {
                voice: {
                    time: user.id === '322945996931727361' ? ((Date.now() - user.voice.lastJoinDate) / 60000) * 0.8 : (Date.now() - user.voice.lastJoinDate) / 60000,
                    join: Date.now(),
                },
            });

        const browser = await launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 706 });
        await page.goto(`http://localhost:${process.env.WEB_PORT}/role-eater/dashboard/${interaction.guildId}/${interaction.user.id}.png`, {
            waitUntil: 'networkidle2',
        });
        const ss = await page.screenshot({ optimizeForSpeed: true, omitBackground: true });

        const attachment = new AttachmentBuilder(Buffer.from(ss.buffer), { name: `${interaction.user.username}_stats.png` });
        interaction.editReply({ content: '', files: [attachment] });
        await browser.close();
    },
});
