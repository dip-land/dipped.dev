import type { Client } from '../classes/Client';

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            CLIENT_SECRET: string;
            COMMANDS_PATH: string;
            EVENTS_PATH: string;
            FONTS: string;
            INTERNAL_IP: string;
            EXTERNAL_IP: string;
            ORIGIN: string;
            TOKEN: string;
            WEB_PORT: string;
            MCSS_PORT: string;
            MCSS_KEY: string;
        }
    }
}
