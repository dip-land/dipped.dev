import { Event } from '../classes/Event.js';
import { editUser, getCollection, getUser, updateUser } from '../handlers/database.js';

export default new Event('voiceStateUpdate', {
    async fn(oldState, newState) {
        const guild = getCollection(newState.guild.id);
        if (!guild) return;
        const guildInfo = await guild.findOne({ id: newState.guild.id });
        if (!guildInfo) return;
        if (newState.channelId && oldState.channelId !== newState.channelId) {
            if (guildInfo.noStatsChannels.includes(newState.channelId)) return;
            editUser(newState.guild.id, newState.id, { 'voice.channelID': newState.channelId, 'voice.lastJoinDate': Date.now() });
        } else if (newState.channelId === null) {
            //user left
            if (guildInfo.noStatsChannels.includes(oldState.channelId)) return;
            const user = await getUser(newState.guild.id, newState.id);
            if (!user) return;
            const xp = user.id === '322945996931727361' ? ((Date.now() - user.voice.lastJoinDate) / 60000) * 0.8 : (Date.now() - user.voice.lastJoinDate) / 60000;
            await updateUser(newState.guild.id, newState.id, { voice: { time: xp, join: null, channel: null } });
        }
    },
});
