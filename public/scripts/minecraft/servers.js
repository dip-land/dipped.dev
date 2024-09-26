window.addEventListener('load', async () => {
    let guilds = window.localStorage.getItem('guilds');
    let server = await (await fetch(`/api/minecraft/servers/${location.pathname.replace('/minecraft/', '')}`, { headers: { guilds } })).json();
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

    document.getElementById('pack-icon').src = `/api/minecraft/icons/${server.id}`;
    document.getElementById('pack-name').innerHTML = server.name;

    if (server.ip) {
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
    } else {
        document.getElementById('ip-container').remove();
    }
    const status = document.getElementById('status');
    if (server.status === 'current') {
        if (server.online) status.classList.add('green'), (status.innerHTML = ' Online');
        else status.classList.add('red'), (status.innerHTML = ' Offline');
        document.getElementById('players').innerHTML = server.players;
    } else {
        status.innerHTML = server.status.toUpperCase();
        status.classList.add('orange');
        document.getElementById('player-container').remove();
    }

    const downloadButton = document.getElementById('download');
    if (server.download) {
        downloadButton.href = `/api/minecraft/worlds/${server.id}`;
    } else {
        downloadButton.classList.add('disabled');
    }
});
