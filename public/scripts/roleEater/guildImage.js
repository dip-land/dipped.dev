window.addEventListener('load', async () => {
    const query = new URLSearchParams(location.search);
    const type = query.get('type');
    document.getElementById('type').innerHTML = type?.toUpperCase() || 'OVERALL';

    const data = await (await fetch(`/api${location.pathname.replace('dashboard/', '').replace('.png', '')}?limit=6&sort=${type}`)).json();
    console.log(data);
    document.getElementById('serverIcon').src = data.apiGuild.iconURL;
    document.getElementById('serverName').innerHTML = data.apiGuild.name;

    for (const index in data.users) {
        const user = data.users[index];
        const pos = +index + 1;

        document.getElementById('bottom').innerHTML += `<div class="user"> <span class="${pos === 1 ? 'first' : pos === 2 ? 'second' : pos === 3 ? 'third' : ''}">${pos}
        </span> <img src="${user.avatar}"/> <div> <span>${user.nickname}
        </span> <span>${user.username}
        </span> </div> <div> <span>${user.message.count.toLocaleString()}
        Messages</span> <span>${Math.round(+user.voice.time).toLocaleString()}
        Voice Minutes</span> </div> </div>`;
    }
});
