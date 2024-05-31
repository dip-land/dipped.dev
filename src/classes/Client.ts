import { type ClientOptions, Collection, Client as DjsClient, Routes } from 'discord.js';
import { glob } from 'glob';
import type { Event } from './Event.js';
import { type Command } from './Command.js';
import 'dotenv/config';
import Logger from './logger.js';

export class Client extends DjsClient {
    public readonly cooldowns: Collection<string, Collection<string, number>> = new Collection();
    public readonly prefixCommands: Collection<string, Command> = new Collection();
    public readonly slashCommands: Collection<string, Command> = new Collection();

    public readonly consoleColor = '\x1b[38;2;255;212;243m';
    public readonly embedColor = 0xffd4f3;
    public readonly rgbColor = '255,212,243';

    private name;
    private color;

    constructor(options: ClientOptions) {
        super(options);
        this.name = `Emoji Eater`;
        this.color = this.consoleColor;
    }

    public logger = new Logger(`Emoji Eater`, this.consoleColor);
    /**Console logs data with a blue time code */
    public log = this.logger.log;
    /**Console logs data with a red time code */
    public error = this.logger.error;

    public isBotOwner(member: any): boolean {
        return member.id === '251580400097427456';
    }

    public async registerEvents(): Promise<this> {
        for (const eventPath of (await glob('./dist/events/**/*.js', { platform: 'linux' })).toString().replaceAll('dist', '..').split(',')) {
            try {
                const event: Event = (await import(eventPath)).default;
                if (!event.on) this.once(event.name, (...args) => event.fn(...args));
                else this.on(event.name, (...args) => event.fn(...args));
            } catch (err: Error | unknown) {
                this.error(eventPath, err);
            }
        }
        this.log('Events Registered.');
        return this;
    }
    public async registerCommands(servers: Array<string>): Promise<this> {
        const commands: Array<Command['applicationData']> = [];
        for (const cmdPath of (await glob('./dist/commands/**/*.js', { platform: 'linux' })).toString().replaceAll('dist', '..').split(',')) {
            try {
                const command: Command = (await import(cmdPath)).default as Command;
                this.cooldowns.set(command.name, new Collection());
                if (command.prefixCommand) this.prefixCommands.set(command.name, command);
                if (command.aliases && command.prefixCommand) for (const alias of command.aliases) this.prefixCommands.set(alias, command);
                if (command.slashCommand) commands.push(command.applicationData as never), this.slashCommands.set(command.name, command);
            } catch (err: Error | unknown) {
                this.error(cmdPath, err);
            }
        }
        for (const server of servers) {
            if (!this.user) throw new Error(`ClientUser is invalid ${this?.user}`);
            if (server === 'global') this.rest.put(Routes.applicationCommands(this.user.id), { body: commands }).catch((err) => this.error(err, server));
            else this.rest.put(Routes.applicationGuildCommands(this.user.id, server), { body: commands }).catch((err) => this.error(err, server));
        }
        this.log('Commands Registered.');
        return this;
    }
}
