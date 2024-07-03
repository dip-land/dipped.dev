import { Event } from '../classes/Event.js';
import { editUser, editVoiceHistory, getUser, incrementUser } from '../handlers/database.js';

export default new Event('voiceStateUpdate', {
    async fn(oldState, newState) {
        if (newState.channelId && oldState.channelId !== newState.channelId)
            editUser(newState.guild.id, newState.id, { 'voice.channelID': newState.channelId, 'voice.lastJoinDate': Date.now() });
        else if (newState.channelId === null) {
            //user left
            const user = await getUser(newState.guild.id, newState.id);
            if (!user) return;
            const xp = Math.floor((Date.now() - user.voice.lastJoinDate) / 60000);
            await incrementUser(newState.guild.id, newState.id, { 'voice.time': xp, xp: xp });
            await editVoiceHistory(newState.guild.id, newState.id, xp);
            await editUser(newState.guild.id, newState.id, { 'voice.channelID': null, 'voice.lastJoinDate': null });
        }
    },
});
