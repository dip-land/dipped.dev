import { fork } from 'child_process';
import readline from 'readline';
import { stdin as input, stdout as output } from 'node:process';
import Logger from './classes/logger.js';

const logger = new Logger('Manager', '55;173;26m');

const rl = readline.createInterface({ input, output });

let discordBot = fork('./dist/bot/index.js');
//let webServer = fork('./dist/webServer/index.js');
logger.log('Online');

discordBot.on('message', (message) => {
    logger.log('main ', message);
});

discordBot.on('exit', (message) => {
    logger.log('Restarting Bot...');
    discordBot = fork('./dist/bot/index.js');
});

rl.on('line', (input) => {
    if (input.includes('-u')) {
    }
    switch (input) {
        case '-r':
            discordBot.kill();
            break;
        case 'exit':
            logger.log('Shutting Down...');
            discordBot.kill();
            process.exit();
            break;
    }
});

// setTimeout(
//     () =>
//         discordBot.send({
//             type: 'role',
//             status: 'edit',
//             name: 'name change test',
//             color: '#19bd8e',
//             user: '251580400097427456',
//             guild: '1110754252315435070',
//             role: '1185802936626983004', // only needs to be preset for deletions
//         }),
//     2000
// );

// webServer.on('message', (message) => {
//     console.log('main ', message);
// });
