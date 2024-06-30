import { ClientEvents } from 'discord.js';

export class Event {
    #event: keyof ClientEvents;
    #on: EventObject['on'] = true;
    #fn: EventObject['fn'];
    constructor(event: keyof ClientEvents, options: EventObject) {
        this.#event = event;
        this.#on = options?.on;
        this.#fn = options.fn;
    }

    public get event(): keyof ClientEvents {
        return this.#event;
    }
    public get on(): EventObject['on'] {
        return this.#on;
    }
    public get fn(): EventObject['fn'] {
        return this.#fn;
    }
}

export type EventObject = {
    on?: boolean;
    fn: (...args: any) => Promise<unknown>;
};

new Event('error', {
    on: true,
    async fn(error: Error) {
        console.log(error);
    },
});
