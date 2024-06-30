import type { Client as customClient } from '../classes/Client';

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            TOKEN: string;
            CLIENT_SECRET: string;
            WEB_PORT: string;
            FONTS: string;
            E621_USERNAME: string;
            E621_KEY: string;
            GELBOORU_KEY: string;
        }
    }
}
