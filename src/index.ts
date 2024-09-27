import { ActivityType, Partials } from 'discord.js';
import { Client } from './classes/Client.js';
import 'dotenv/config';
import { editUser, getAllUsers, getCollection, getGuildInfo, getUser, getUserCountAll, updateUser } from './handlers/database.js';
import Fastify from 'fastify';
import Logger from './classes/logger.js';
import schedule from 'node-schedule';

export const version = '0.34.0';

//Bot
export const client = new Client({
    name: 'Role Eater',
    color: '\x1b[38;2;209;161;137m',
    embedColor: 0xd1a189,
    intents: ['Guilds', 'GuildMessages', 'MessageContent', 'GuildMembers', 'GuildVoiceStates'],
    partials: [Partials.Message, Partials.Channel, Partials.GuildMember, Partials.User],
});

client.once('ready', async () => {
    client.log(`Online`);
    await client.registerEvents();
    await client.registerCommands(['global', '1182260148501225552']);

    const activities = ['Playing with roles', `Watching ${await getUserCountAll()} users`, `Version ${version}`];
    client.user?.setPresence({ activities: [{ name: activities[Math.floor(Math.random() * activities.length)], type: ActivityType.Custom }], status: 'online' });
    setInterval(() => {
        client.user?.setPresence({ activities: [{ name: activities[Math.floor(Math.random() * activities.length)], type: ActivityType.Custom }], status: 'online' });
    }, 5 * 1000 * 60);

    const guilds = await client.guilds.fetch();
    guilds.forEach(async (guild) => {
        const members = await (await guild.fetch()).members.fetch();
        for (const [, member] of members) {
            const user = await getUser(member.guild.id, member.id);
            if (!user) return;
            const userVoiceID = user.voice.channelID;
            const memberVoiceID = member.voice.channelId;
            if (!memberVoiceID && userVoiceID) {
                await updateUser(guild.id, member.id, { voice: { time: (Date.now() - user.voice.lastJoinDate) / 60000, join: null, channel: null } });
            } else if (memberVoiceID && !userVoiceID) {
                await editUser(guild.id, member.id, { 'voice.channelID': memberVoiceID, 'voice.lastJoinDate': Date.now() });
            }
        }
    });

    const rule = new schedule.RecurrenceRule();
    rule.dayOfWeek = [new schedule.Range(0, 6)];
    rule.hour = 23;
    rule.minute = 58;
    rule.tz = 'America/Chicago';

    schedule.scheduleJob(rule, async function () {
        client.log('Running Job');
        for (const user of await getAllUsers({ filter: { 'voice.channelID': { $not: { $eq: null } } } })) {
            if (!user.guild) return;
            const guild = getCollection(user.guild);
            if (!guild || !user.voice.lastJoinDate) return;
            const guildInfo = await getGuildInfo(user.guild);
            if (guildInfo && guildInfo.noStatsChannels.includes(user.voice.channelID)) return;
            const xp = user.id === '322945996931727361' ? ((Date.now() - user.voice.lastJoinDate) / 60000) * 0.8 : (Date.now() - user.voice.lastJoinDate) / 60000;
            await updateUser(user.guild, user.id, { voice: { time: xp, join: Date.now() } });
        }
    });
});

client.login(process.env.TOKEN);

//webserver
const logger = new Logger('WebServer', '212;47;151');
const fastify = Fastify({ logger: { level: 'error' }, ignoreTrailingSlash: true });

fastify.register((await import('./routes/index.js')).default);

try {
    await fastify.listen({ port: +process.env.WEB_PORT });
    logger.log(`Port ${process.env.WEB_PORT} open.`);
} catch (err) {
    logger.log(err);
}

//graceful shutdown
process.on('beforeExit', async () => {
    await client.destroy();
    await fastify.close();
    console.log('Shutdown.');
    process.exit();
});
