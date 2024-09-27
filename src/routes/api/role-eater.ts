import { FastifyInstance } from 'fastify';
import { getGuildInfo, getAllGuildUsers, getUser } from '../../handlers/database.js';
import { WithId } from 'mongodb';
import { User } from 'src/types/database.type.js';

async function routes(fastify: FastifyInstance) {
    fastify.get('/servers', async (req, reply) => {
        const userGuilds = req.headers.guilds ? JSON.parse(`${req.headers.guilds}`) : false;
        if (!userGuilds) return reply.code(401), reply.send([]);
        const content = [];
        for (const guild of userGuilds) {
            const guildData = await getGuildInfo(guild);
            if (!guildData) continue;
            content.push({
                id: guildData.id,
                name: guildData.name,
                icon: guildData.icon,
            });
        }
        return content;
    });

    fastify.get('/:guildID', async (req, reply) => {
        const guildID = (req.params as { guildID: string }).guildID;
        const query = req.query as { limit: string; sort: string };
        if (!query.sort) query.sort = 'users';
        const guildInfo = await getGuildInfo(guildID);
        if (!guildInfo) return reply.code(401), reply.send([]);
        const users = (await getAllGuildUsers(guildID, { sort: { total: 'desc' }, limit: +query.limit || undefined })) as Array<WithId<User<false>>>;
        const client = (await import('../../index.js')).client;
        const apiGuild = client.isReady() ? await client.guilds.fetch(guildID) : undefined;
        const parsedUsers = [];
        const sort = (a: WithId<User<false>>, b: WithId<User<false>>) => {
            return query.sort === 'voice' ? b.voice.time - a.voice.time : query.sort === 'message' ? b.message.count - a.message.count : b.total - a.total;
        };
        for (const user of users.sort(sort)) {
            if (!apiGuild) continue;
            try {
                const apiUser = await apiGuild.members.fetch(user.id);
                parsedUsers.push(Object.assign({}, user, { nickname: apiUser.nickname || apiUser.user.displayName, username: apiUser.user.username }));
            } catch (error) {
                continue;
            }
        }
        return {
            guild: guildInfo,
            apiGuild,
            users: parsedUsers,
        };
    });

    fastify.get('/:guildID/:userID', async (req, reply) => {
        const guildID = (req.params as { guildID: string }).guildID;
        const userID = (req.params as { userID: string }).userID;
        const guildData = await getGuildInfo(guildID);
        if (!guildData) return reply.code(401), reply.send([]);
        const user = await getUser(guildID, userID);
        if (!user) return reply.code(401), reply.send([]);
        const client = (await import('../../index.js')).client;
        if (client.isReady()) {
            return {
                guild: guildData,
                user,
                apiUser: await client.users.fetch(userID),
                apiMember: await (await client.guilds.fetch(guildID)).members.fetch(userID),
            };
        } else {
            return {
                error: true,
                guild: guildData,
                user,
                apiUser: {},
                apiMember: {},
            };
        }
    });
}

export default routes;
