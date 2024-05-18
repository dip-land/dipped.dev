window.addEventListener('load', async () => {
    try {
        const cj = colorjoe.rgb(document.getElementById('colorJoe'));
        if (cj) {
            cj.show();
            cj.on('done', (color) => console.log('Selected ' + color.css()));
        }

        const accessToken = window.localStorage.getItem('access_token');
        const tokenType = window.localStorage.getItem('token_type');
        const container = document.getElementById('guilds');
        if (accessToken && accessToken !== 'null') {
            const guilds = await (await fetch('https://discord.com/api/users/@me/guilds', { headers: { authorization: `${tokenType} ${accessToken}` } })).json();
            const botGuilds = await (await fetch('/api/dashboard/servers/list')).json();
            for (const guild of guilds) {
                if (!botGuilds.includes(guild.id)) continue;
                const guildDiv = Object.assign(document.createElement('a'), { id: `${guild.id}`, classList: 'guild', href: `/dashboard/servers/${guild.id}` });
                const guildContent = Object.assign(document.createElement('div'), { id: `guildContent` });
                const guildBackground = Object.assign(document.createElement('div'), { id: `guildBackground` });
                guildBackground.style.backgroundImage = `url("https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png")`;
                const guildIcon = Object.assign(document.createElement('img'), { id: 'guildIcon', src: `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` });
                guildIcon.addEventListener('error', (event) => {
                    guildIcon.remove();
                    const text = guild.name.split(' ').map((v, i) => {
                        if (i < 3) return v.charAt(0);
                    });
                    guildContent.prepend(Object.assign(document.createElement('span'), { id: 'guildIcon', innerText: `${text.join('')}` }));
                });
                const guildName = Object.assign(document.createElement('span'), { id: 'guildName', innerText: `${guild.name}` });
                guildContent.append(guildIcon, guildName);
                guildDiv.append(guildBackground, guildContent);
                container.append(guildDiv);
            }
            document.getElementById('loader').classList.add('hidden');
        } else {
            window.alert('You must login to access this page.');
            window.location.replace(window.location.origin);
        }
    } catch (error) {
        console.log(error);
        setTimeout(() => location.reload(), 200);
    }
});
