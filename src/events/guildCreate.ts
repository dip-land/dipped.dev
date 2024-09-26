import { createCollection, createUser } from '../handlers/database.js';
import { Event } from '../classes/Event.js';

export default new Event('guildCreate', {
    async fn(guild) {
        await createCollection(guild.id);
        let count = 1;
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
                    modifier: 1,
                },
                message: {
                    count: 1,
                    history: [],
                    modifier: 1,
                },
                total: 1,
                positions: {
                    total: count,
                    voice: count,
                    message: count,
                },
            });
            count = count++;
        }
    },
});
