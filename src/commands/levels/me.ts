import { Command } from '../../classes/Command.js';
import { AttachmentBuilder } from 'discord.js';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { launch } from 'puppeteer';

export default new Command({
    name: 'me',
    description: 'Shows your level stats.',
    disabled: false,
    category: 'levels',
    deferReply: false,
    dm_permission: false,
    hidden: false,
    options: [],
    async slashCommand({ interaction, client }) {
        if (!interaction.guildId) return;

        const canvas = createCanvas(1280, 706);
        const ctx = canvas.getContext('2d');
        const browser = await launch();
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 706 });
        await page.goto(`http://localhost:8011/role-eater/dashboard/${interaction.guildId}/${interaction.user.id}`, {
            waitUntil: 'networkidle2',
        });
        const ss = await page.screenshot();
        const stats = await loadImage(ss);
        ctx.beginPath();
        ctx.roundRect(0, 0, 1280, 706, 20);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(stats, 0, 0, 1280, 706);

        const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: `${interaction.user.username}_stats.png` });
        interaction.reply({ files: [attachment] });
        await browser.close();
    },
});
