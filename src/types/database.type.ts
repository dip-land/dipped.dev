import { Snowflake } from 'discord.js';
import { SortDirection } from 'mongodb';

export type If<Value extends boolean, TrueResult, FalseResult = null> = Value extends true ? TrueResult : Value extends false ? FalseResult : TrueResult | FalseResult;

export interface Role {
    id: string;
    name: string;
    color: string;
}

interface BaseGuild {
    icon: string | null;
    name: string;
    xpChannels: string[];
    adminRoles: Role[];
}

export type Guild<Editable> = Editable extends false ? { id: Snowflake } & BaseGuild : Partial<BaseGuild>;

interface BaseUser {
    username: string;
    avatar: string | null;
    role:
        | {
              id: string;
              name: string;
              color: string;
          }
        | {};
    'role.id'?: string;
    'role.name'?: string;
    'role.color'?: string;
    message: {
        count: number;
        history: { date: string; count: number }[];
    };
    'message.count'?: number;
    'message.history'?: { date: string; count: number };
    'message.history.date'?: string;
    voice: {
        channelID: string | null;
        lastJoinDate: number | null;
        time: number;
        history: { date: string; time: number }[];
    };
    'voice.channelID'?: string | null;
    'voice.lastJoinDate'?: number | null;
    'voice.time'?: number;
    'voice.history'?: { date: string; tiem: number };
    'voice.history.date'?: string;
    xp: number;
}

export type User<Editable> = Editable extends false ? { id: Snowflake } & BaseUser : Partial<BaseUser>;

export type UserSortOptions = {
    id?: SortDirection;
    username?: SortDirection;
    avatar?: SortDirection;
    'role.id'?: SortDirection;
    'role.name'?: SortDirection;
    'role.color'?: SortDirection;
    'voice.id'?: SortDirection;
    'voice.lastJoinDate'?: SortDirection;
    'voice.time'?: SortDirection;
    'message.count'?: SortDirection;
    xp?: SortDirection;
};

type ProjectionOptions = boolean | 0 | 1;

export interface UserProjectionOptions {
    id?: ProjectionOptions;
    username?: ProjectionOptions;
    avatar?: ProjectionOptions;
    'role.id'?: ProjectionOptions;
    'role.name'?: ProjectionOptions;
    'role.color'?: ProjectionOptions;
    'voice.id'?: ProjectionOptions;
    'voice.lastJoinDate'?: ProjectionOptions;
    'voice.time'?: ProjectionOptions;
    'message.count'?: ProjectionOptions;
    xp?: ProjectionOptions;
}

export interface UserIncrementable {
    'voice.lastJoinDate'?: number;
    'voice.time'?: number;
    'message.count'?: number;
    xp?: number;
}
