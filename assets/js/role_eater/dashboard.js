window.addEventListener('load', async () => {
    const accessToken = window.localStorage.getItem('access_token');
    const container = document.querySelector('.terminal_grid');
    if (!accessToken) return (container.innerHTML = '<h1>You must be logged in to display your servers.</h1>');
    const guilds = await (await fetch('/api/role-eater/servers/', { headers: { guilds: localStorage.getItem('guilds') } })).json();
    for (const guild of guilds) {
        const guild_div = Object.assign(document.createElement('a'), { id: `${guild.id}`, classList: 'guild', href: `/role-eater/dashboard/${guild.id}` });
        const guild_content = Object.assign(document.createElement('div'), { classList: `guild_content` });
        const guild_background = Object.assign(document.createElement('div'), { classList: `guild_background` });
        guild_background.style.backgroundImage = `url("${guild.banner ?? guild.icon}")`;
        const guild_icon = Object.assign(document.createElement('img'), { classList: 'guild_icon', src: `${guild.icon}` });
        guild_icon.addEventListener('error', (event) => {
            guild_icon.remove();
            const text = guild.name.split(' ').map((v, i) => {
                if (i < 3) return v.charAt(0);
            });
            guild_content.prepend(Object.assign(document.createElement('span'), { classList: 'guild_icon', innerText: `${text.join('')}` }));
        });
        const guild_name = Object.assign(document.createElement('span'), { classList: 'guild_name', innerText: `${guild.name}` });
        guild_content.append(guild_icon, guild_name);
        guild_div.append(guild_background, guild_content);
        container.append(guild_div);
    }
});
