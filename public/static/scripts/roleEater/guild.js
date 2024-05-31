window.addEventListener('load', async () => {
    const accessToken = window.localStorage.getItem('access_token');
    const container = document.getElementById('users');
    if (!accessToken) document.getElementById('me').children[1].innerHTML = '<h3>You must be logged in to edit your profile.</h3>';
    const guildID = window.location.pathname.replace('/role-eater/dashboard/', '');
    const data = await (await fetch(`/api/role-eater/servers/${guildID}`, { headers: { guilds: localStorage.getItem('guilds') } })).json();

    const me = JSON.parse(localStorage.getItem('me'));
    for (const index in data.users) {
        const user = data.users[index];
        const userDiv = Object.assign(document.createElement('div'), { id: `${user.id}`, classList: 'user' });
        const position = Object.assign(document.createElement('span'), { classList: `position ${+index === 0 ? 'gold' : +index === 1 ? 'silver' : +index === 2 ? 'bronze' : ''}` });
        position.innerText = +index + 1;
        const userAvatar = Object.assign(document.createElement('img'), { src: `${user.avatar}?size=64`, classList: 'userAvatar' });
        const username = Object.assign(document.createElement('span'), { classList: 'username' });
        username.innerText = user.username;
        const role = new DOMParser().parseFromString(`<div class="role" style="opacity: ${user.role?.color ? 1 : 0}"><div class="roleColor" style="background: ${user?.role?.color}"></div><span>${user?.role?.name}</span></div>`, "text/html");
        const messages = Object.assign(document.createElement('div'), { classList: 'messages' });
        messages.innerText = user.messages;
        const level = Object.assign(document.createElement('div'), { classList: 'level' });
        level.innerText = Math.floor(Math.sqrt(+user.messages / 10));
        console.log(Math.sqrt(+user.messages / 10));
        userDiv.append(position, userAvatar, username, role.getElementsByClassName('role')[0], messages, level);
        const clone = userDiv.cloneNode(true);
        clone.classList.add('me');
        if (user.id === me?.id) document.getElementById('me').append(clone);
        container.append(userDiv);
    }
});