import type {
    AnySelectMenuInteraction,
    ButtonInteraction,
    ChatInputApplicationCommandData,
    ChatInputCommandInteraction,
    Collection,
    Message,
    PermissionResolvable,
    TextInputComponent,
} from 'discord.js';
import type { Client } from './Client';

export class Command {
    public name = '';
    public name_localizations;
    public description = '';
    public description_localizations;
    public options: ChatInputApplicationCommandData['options'] = [];
    public default_member_permissions? = '';
    public dm_permission = false;
    public nsfw = false;
    public aliases: Array<string> = [];
    public cooldown = 2_000;
    public category = '';
    public disabled = false;
    public hidden = false;
    public deferReply = false;
    public permissions?: Array<PermissionResolvable> = [];
    public prefixCommand?: (data: { message: Message; args: Array<string>; client: Client }) => Promise<unknown>;
    public slashCommand?: (data: { interaction: ChatInputCommandInteraction; options: ChatInputCommandInteraction['options']; client: Client }) => Promise<unknown>;
    public button?: (interaction: ButtonInteraction) => Promise<unknown>;
    public selectMenu?: (interaction: AnySelectMenuInteraction) => Promise<unknown>;
    public modal?: (interaction: Message, fields: Collection<string, TextInputComponent>) => Promise<unknown>;
    public webTrigger?: (
        message: { type: string; status: string; name?: string; color?: string; user?: string; guild?: string; role?: string },
        client: Client
    ) => Promise<unknown>;
    constructor(data: CommandData) {
        this.name = data.name;
        this.name_localizations = data.name_localizations;
        this.description = data.description;
        this.description_localizations = data.description_localizations;
        this.options = data.options || [];
        this.default_member_permissions = data.default_member_permissions;
        this.dm_permission = data.dm_permission || false;
        this.nsfw = data.nsfw || false;
        this.aliases = data.aliases || [];
        this.cooldown = data.cooldown || 2_000;
        this.category = data.category;
        this.disabled = data.disabled || false;
        this.deferReply = data.deferReply || false;
        this.permissions = data.permissions;
        this.prefixCommand = data.prefixCommand;
        this.slashCommand = data.slashCommand;
        this.button = data.button;
        this.selectMenu = data.selectMenu;
        this.modal = data.modal;
        this.webTrigger = data.webTrigger;
    }
    public get applicationData() {
        return {
            name: this.name,
            name_localizations: this.name_localizations,
            description: this.description,
            description_localizations: this.description_localizations,
            options: this.options,
            default_member_permissions: this.default_member_permissions,
            dm_permission: this.dm_permission,
            nsfw: this.nsfw,
        };
    }
}

interface CommandData {
    name: string;
    name_localizations?: discordLocaleDictionary;
    description: string;
    description_localizations?: discordLocaleDictionary;
    options?: ChatInputApplicationCommandData['options'];
    default_member_permissions?: string;
    dm_permission?: boolean;
    nsfw?: boolean;
    aliases?: Array<string>;
    /**Cooldown in ms */
    cooldown?: number;
    category: string;
    disabled?: boolean;
    hidden?: boolean;
    deferReply?: boolean;
    permissions?: Array<PermissionResolvable>;
    prefixCommand?: (data: { message: Message; args: Array<string>; client: Client }) => Promise<unknown>;
    slashCommand?: (data: { interaction: ChatInputCommandInteraction; options: ChatInputCommandInteraction['options']; client: Client }) => Promise<unknown>;
    button?: (interaction: ButtonInteraction) => Promise<unknown>;
    selectMenu?: (interaction: AnySelectMenuInteraction) => Promise<unknown>;
    modal?: (interaction: Message, fields: Collection<string, TextInputComponent>) => Promise<unknown>;
    webTrigger?: (message: { type: string; status: string; name?: string; color?: string; user?: string; guild?: string; role?: string }, client: Client) => Promise<unknown>;
}

//https://discord.com/developers/docs/reference#locales
interface discordLocaleDictionary {
    id?: string;
    da?: string;
    de?: string;
    'en-GB'?: string;
    'en-US'?: string;
    'en-ES'?: string;
    fr?: string;
    hr?: string;
    it?: string;
    lt?: string;
    hu?: string;
    nl?: string;
    no?: string;
    pl?: string;
    'pt-BR'?: string;
    ro?: string;
    fi?: string;
    'sv-SE'?: string;
    vi?: string;
    tr?: string;
    cs?: string;
    el?: string;
    bg?: string;
    ru?: string;
    uk?: string;
    hi?: string;
    th?: string;
    'zh-CN'?: string;
    ja?: string;
    'zh-TW'?: string;
    ko?: string;
}
