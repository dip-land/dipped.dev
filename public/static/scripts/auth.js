window.addEventListener('load', async () => {
    let loginButtons = document.getElementsByClassName('login');
    const authText = document.getElementById('auth');
    const params = new URLSearchParams(window.location.hash.slice(1) + window.location.search);
    const accessToken = params.get('access_token') || window.localStorage.getItem('access_token');
    const tokenType = params.get('token_type') || window.localStorage.getItem('token_type');
    let me = window.localStorage.getItem('me');
    let shouldReload = 0;

    if (window.opener) {
        if (accessToken === 'null') return (document.getElementById('login').style.display = 'block');
        window.localStorage.setItem('access_token', accessToken);
        window.localStorage.setItem('token_type', tokenType);
        window.opener.postMessage('reload');
        window.close();
    }

    if (!accessToken) {
        if (document.getElementById('server-info')) document.getElementById('server-info').innerHTML = 'You must be logged in to see the server info.\n<a class="login" id="server-info-login">Login</a>';
        loginButtons = document.getElementsByClassName('login');
        const discordOAuth = 'https://discord.com/oauth2/authorize?client_id=1169815792142000228&response_type=token&redirect_uri=';
        const scopes = ['identify', 'guilds'];
        for (const origin of ['http://localhost:8011', 'https://dipped.dev']) {
            if (origin !== window.location.origin) continue;
            for (const btn of loginButtons) {
                btn.setAttribute('href', `${discordOAuth}${encodeURIComponent(origin)}&scope=${scopes.join('+')}`);
                btn.setAttribute('onclick', `window.open('${discordOAuth}${encodeURIComponent(origin)}&scope=${scopes.join('+')}','popup','width=500,height=720'); return false;`);
            }
        }
    }

    if ((accessToken && me === null) || (me && Date.now() - JSON.parse(me).updated > 3_600_000)) {
        const user = await (await fetch('https://discord.com/api/users/@me', { headers: { authorization: `${tokenType} ${accessToken}` } })).json();
        if (user?.message && user.message === '401: Unauthorized') {
            window.localStorage.clear();
            window.location.reload();
        }
        user.updated = Date.now();
        const userGuilds = await (await fetch('https://discord.com/api/users/@me/guilds', { headers: { authorization: `${tokenType} ${accessToken}` } })).json();
        window.localStorage.setItem('me', JSON.stringify(user));
        window.localStorage.setItem('guilds', JSON.stringify(userGuilds.map((guild) => guild.id)));
        me = window.localStorage.getItem('me');
        shouldReload = 1;
    }
    me = JSON.parse(me);
    if (me) {
        const container = document.getElementById('user');
        document.getElementById('userAvatar').src = `https://cdn.discordapp.com/avatars/${me.id}/${me.avatar}.webp?size=32`;
        document.getElementById('username').innerText = me.global_name;
        container.addEventListener('click', () => {
            document.getElementById('nav_popout').classList.toggle('hidden');
            document.getElementById('caret').classList.toggle('rotated');
        });

        container.classList.remove('hidden');
        if (authText) authText.innerText = 'Authorizing User.';
        for (const btn of loginButtons) {
            btn.remove();
        }
        document.getElementById('logout').addEventListener('click', async () => {
            window.localStorage.clear();
            window.location.reload();
        });
    }
    if (shouldReload === 1) location.reload();
});
