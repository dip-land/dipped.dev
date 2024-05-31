import type { Client as customClient } from '../classes/Client';

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            TOKEN: string;
            CLIENT_SECRET: string;
        }
    }
}
