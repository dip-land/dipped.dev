import type { User, PartialUser } from 'discord.js';
import { Event } from '../classes/Event.js';
import { editUserAll } from '../handlers/database.js';

export default new Event('userUpdate', {
    on: true,
    async fn(oldUser: User | PartialUser, newUser: User) {
        await editUserAll(newUser.id, { username: newUser.username, avatar: newUser.avatarURL() });
    },
});
