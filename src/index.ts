import { fork } from 'child_process';

let discordBot = fork('./dist/bot/index.js');
let webServer = fork('./dist/webServer/index.js');

discordBot.on('message', (message) => {
    console.log('main ', message);
});

setTimeout(
    () =>
        discordBot.send({
            type: 'role',
            status: 'edit',
            name: 'name change test',
            color: '#19bd8e',
            user: '251580400097427456',
            guild: '1110754252315435070',
            role: '1185802936626983004', // only needs to be preset for deletions
        }),
    2000
);

webServer.on('message', (message) => {
    console.log('main ', message);
});
