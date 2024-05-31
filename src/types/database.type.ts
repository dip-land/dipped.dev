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
    messages: number;
}

export type User<Editable> = Editable extends false ? { id: Snowflake } & BaseUser : Partial<BaseUser>;

export type UserSortOptions = {
    id?: SortDirection;
    username?: SortDirection;
    avatar?: SortDirection;
    'role.id'?: SortDirection;
    'role.name'?: SortDirection;
    'role.color'?: SortDirection;
    messages?: SortDirection;
};

export interface UserProjectionOptions {
    id?: boolean | 0 | 1;
    username?: boolean | 0 | 1;
    avatar?: boolean | 0 | 1;
    'role.id'?: boolean | 0 | 1;
    'role.name'?: boolean | 0 | 1;
    'role.color'?: boolean | 0 | 1;
    messages?: boolean | 0 | 1;
}
