window.addEventListener('load', async () => {
    const accessToken = window.localStorage.getItem('access_token');
    const container = document.getElementById('guilds');
    if (!accessToken) return (container.innerHTML = '<h1>You must be logged in to display your servers.</h1>');
    const guilds = await (await fetch('/api/role-eater/servers/', { headers: { guilds: localStorage.getItem('guilds') } })).json();
    for (const guild of guilds) {
        const guildDiv = Object.assign(document.createElement('a'), { id: `${guild.id}`, classList: 'guild', href: `/role-eater/dashboard/${guild.id}` });
        const guildContent = Object.assign(document.createElement('div'), { classList: `guildContent` });
        const guildBackground = Object.assign(document.createElement('div'), { classList: `guildBackground` });
        guildBackground.style.backgroundImage = `url("${guild.icon}")`;
        const guildIcon = Object.assign(document.createElement('img'), { classList: 'guildIcon', src: `${guild.icon}` });
        guildIcon.addEventListener('error', (event) => {
            guildIcon.remove();
            const text = guild.name.split(' ').map((v, i) => {
                if (i < 3) return v.charAt(0);
            });
            guildContent.prepend(Object.assign(document.createElement('span'), { classList: 'guildIcon', innerText: `${text.join('')}` }));
        });
        const guildName = Object.assign(document.createElement('span'), { classList: 'guildName', innerText: `${guild.name}` });
        guildContent.append(guildIcon, guildName);
        guildDiv.append(guildBackground, guildContent);
        container.append(guildDiv);
    }
});
