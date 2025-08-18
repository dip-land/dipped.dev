window.addEventListener('load', async () => {
    const query = new URLSearchParams(location.search);
    // types are 'overall', 'message' or 'voice'
    const type = query.get('type') || 'overall';
    document.getElementById('type').innerHTML = type?.toUpperCase();

    const data = await (await fetch(`/api${location.pathname.replace('dashboard/', '').replace('.png', '')}?limit=6&sort=${type}`)).json();
    console.log(data);
    console.log(data);
    document.getElementById('serverIcon').src = data.apiGuild.iconURL;
    document.getElementById('serverName').innerHTML = data.apiGuild.name;
    document.getElementById('memberCount').innerHTML = `${data.apiGuild.members.length} Members`;

    for (const index in data.users) {
        const user = data.users[index];
        const pos = +index + 1;
        const totalSpan = `<span>${Math.round(user.message.count + +user.voice.time).toLocaleString()} Total</span>`;
        const messageSpan = `<span>${user.message.count.toLocaleString()} Messages</span>`;
        const voiceSpan = `<span>${Math.round(+user.voice.time).toLocaleString()} Voice Minutes</span>`;

        document.getElementById('bottom').innerHTML += `<div class="user"> 
        <span class="${pos === 1 ? 'first' : pos === 2 ? 'second' : pos === 3 ? 'third' : ''}">${pos}</span> 
        <img src="${user.avatar}"/> 
        <div> <span>${user.nickname}</span> <span>${user.username}</span> </div> 
        <div> ${
            type === 'overall' ? totalSpan.concat(messageSpan, voiceSpan) : type === 'message' ? messageSpan.concat(voiceSpan, totalSpan) : voiceSpan.concat(messageSpan, totalSpan)
        } </div> 
        </div>`;
    }
});
