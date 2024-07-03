import { ApplicationCommandOptionType, AttachmentBuilder } from 'discord.js';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { launch } from 'puppeteer';
import { Command } from '../../classes/Command.js';

export default new Command({
    name: 'leaderboard',
    description: 'Sends the servers leaderboard.',
    disabled: false,
    category: 'levels',
    deferReply: false,
    dm_permission: false,
    hidden: false,
    options: [
        {
            required: true,
            name: 'type',
            type: ApplicationCommandOptionType.String,
            choices: [
                { name: 'Overall', value: 'overall' },
                { name: 'Messages', value: 'message' },
                { name: 'Voice', value: 'voice' },
            ],
            description: 'Which leaderboard you want to see.',
        },
    ],
    async slashCommand({ interaction, options, client }) {
        if (!interaction.guildId) return;
        await interaction.reply('Loading <a:wiggle:1190127338101415957>');

        //return interaction.editReply({ content: `This command is currently disabled. \`TYPE: ${options.getString('type')}\`` });

        const browser = await launch();
        const page = await browser.newPage();
        await page.goto(`http://localhost:8011/role-eater/dashboard/${interaction.guildId}.png?type=${options.getString('type')}`, {
            waitUntil: 'networkidle2',
        });
        const element = await page.$('#main');
        const boundingBox = await element?.boundingBox();
        let height = 0;
        if (boundingBox) height = boundingBox.height;
        await page.setViewport({ width: 1280, height });
        const ss = await page.screenshot();
        const stats = await loadImage(ss);
        const canvas = createCanvas(1280, height);
        const ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.roundRect(0, 0, 1280, height, 20);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(stats, 0, 0, 1280, height);

        const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: `${interaction.user.username}_stats.png` });
        interaction.editReply({ content: '', files: [attachment] });
        await browser.close();
    },
});
