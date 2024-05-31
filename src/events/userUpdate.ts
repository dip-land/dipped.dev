import type { User, PartialUser } from 'discord.js';
import { Event } from '../classes/Event.js';
import { editUserAll } from '../handlers/database.js';

export default new Event({
    name: 'userUpdate',
    on: true,
    async fn(oldUser: User | PartialUser, newUser: User) {
        console.log('good');
        await editUserAll(newUser.id, { username: newUser.username, avatar: newUser.avatarURL() });
    },
});
