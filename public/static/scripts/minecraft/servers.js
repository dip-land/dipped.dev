window.addEventListener('load', async () => {
    let guilds = window.localStorage.getItem('guilds');
    let server = await (await fetch(`/api/minecraft/servers/${location.pathname.replace('/minecraft/servers/', '')}`, { headers: { guilds } })).json();
    const serverIP = document.getElementById('server-ip');
    if (server.status === 'OKAY' && localStorage.getItem('access_token')) {
        const interval = setInterval(() => {
            if (guilds === null) location.reload();
            else {
                clearInterval(interval);
                location.reload();
            }
        }, 1000);
        return;
    }
    if (server.status === 'NOT FOUND' || server.status === 'OKAY') return;
    if (serverIP) {
        serverIP.innerHTML = server.ip + `<span class="tooltiptext">Click the IP to copy to clipboard.</span>`;
        serverIP.addEventListener('click', () => {
            navigator.clipboard.writeText(server.ip);
            serverIP.innerHTML = 'Copied!';
            serverIP.classList.toggle('green');
            setTimeout(() => {
                serverIP.innerHTML = server.ip + `<span class="tooltiptext">Click the IP to copy to clipboard.</span>`;
                serverIP.classList.toggle('green');
            }, 1500);
        });
    }
    const status = document.getElementById('status');
    status.innerHTML = server.status;
    if (server.status === 'Online') status.classList.add('green');
    else if (server.status === 'Offline') status.classList.add('red');
    else status.classList.add('orange');
    if (server.players || server.players === 0) document.getElementById('players').innerHTML = server.players;
    else document.getElementById('player-container').remove();
});
