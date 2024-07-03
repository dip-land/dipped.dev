import { createCollection, createUser } from '../handlers/database.js';
import { Event } from '../classes/Event.js';

export default new Event('guildCreate', {
    async fn(guild) {
        await createCollection(guild.id);
        for (const [, member] of await guild.members.fetch()) {
            createUser(guild.id, {
                id: member.id,
                username: member.user.username,
                avatar: member.user.avatarURL(),
                role: {},
                voice: {
                    channelID: null,
                    lastJoinDate: null,
                    time: 0,
                    history: [],
                },
                message: {
                    count: 1,
                    history: [],
                },
                xp: 1,
            });
        }
    },
});
