const mainOrigin = 'https://dipland.gay';
window.addEventListener('load', async () => {
    const loginButton = document.getElementById('login');
    const accessToken = window.localStorage.getItem('access_token');
    const tokenType = window.localStorage.getItem('token_type');
    if (accessToken && accessToken !== 'null') {
        const user = await (await fetch('https://discord.com/api/users/@me', { headers: { authorization: `${tokenType} ${accessToken}` } })).json();
        if (user?.message && user.message === '401: Unauthorized') {
            window.localStorage.removeItem('access_token');
            window.localStorage.removeItem('token_type');
            window.location.reload();
        }
        window.discordUser = user;
        const popout = document.getElementById('nav_popout');
        const container = document.getElementById('user');
        const avatar = document.getElementById('userAvatar');
        avatar.src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=32`;
        const username = document.getElementById('username');
        username.innerText = user.global_name;
        container.addEventListener('click', () => {
            popout.classList.toggle('hidden');
            document.getElementById('caret').classList.toggle('rotated');
        });

        container.classList.remove('hidden');
        loginButton.remove();

        document.getElementById('logout').addEventListener('click', async () => {
            window.localStorage.removeItem('access_token');
            window.localStorage.removeItem('token_type');
            window.location.reload();
        });
    } else {
        if (window.origin === mainOrigin) {
            loginButton.setAttribute(
                'href',
                'https://discord.com/api/oauth2/authorize?client_id=1169815792142000228&response_type=token&redirect_uri=https%3A%2F%2Fdipland.gay%2F&scope=identify+guilds+guilds.members.read'
            );
            loginButton.setAttribute(
                'onclick',
                "window.open('https://discord.com/api/oauth2/authorize?client_id=1169815792142000228&response_type=token&redirect_uri=https%3A%2F%2Fdipland.gay%2F&scope=identify+guilds+guilds.members.read','popup','width=500,height=720'); return false;"
            );
        } else {
            loginButton.setAttribute(
                'href',
                'https://discord.com/api/oauth2/authorize?client_id=1169815792142000228&response_type=token&redirect_uri=http%3A%2F%2Flocalhost%3A4000&scope=identify+guilds+guilds.members.read'
            );
            loginButton.setAttribute(
                'onclick',
                "window.open('https://discord.com/api/oauth2/authorize?client_id=1169815792142000228&response_type=token&redirect_uri=http%3A%2F%2Flocalhost%3A4000&scope=identify+guilds+guilds.members.read','popup','width=500,height=720'); return false;"
            );
        }
    }
});
