const formatter = Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
});

window.addEventListener('load', async () => {
    const accessToken = window.localStorage.getItem('access_token');
    const container = document.getElementById('users');
    if (!accessToken) document.getElementById('me').children[1].innerHTML = '<h3>You must be logged in to edit your profile.</h3>';
    const guildID = window.location.pathname.replace('/role-eater/dashboard/', '');
    const data = await (await fetch(`/api/role-eater/${guildID}`, { headers: { guilds: localStorage.getItem('guilds') } })).json();
    const usersWithRoles = data.users.map((v) => v.role?.id).filter((v) => v);
    const combinedXP = data.users.map((v) => v.xp).reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    const guildIcon = Object.assign(document.createElement('img'), { id: 'guildIcon', src: `${data.guild.icon}` });
    document.getElementById('guildName').innerText = data.guild.name;
    guildIcon.addEventListener('error', (event) => {
        guildIcon.remove();
        const text = data.guild.name.split(' ').map((v, i) => {
            if (i < 3) return v.charAt(0);
        });
        document.getElementById('guild').prepend(Object.assign(document.createElement('span'), { id: 'guildIcon', innerText: `${text.join('')}` }));
    });
    document.getElementById('guild').prepend(guildIcon);
    document.getElementById('guildInfo').innerHTML = `<span>Users: ${Number(data.users.length).toLocaleString()}</span>
    <span>Roles: ${Number(usersWithRoles.length).toLocaleString()}</span>
    <span>Combined XP: ${Number(combinedXP).toLocaleString()}</span>`;

    const me = JSON.parse(localStorage.getItem('me'));
    for (const index in data.users) {
        const user = data.users[index];
        const userDiv = Object.assign(document.createElement('div'), { id: `${user.id}`, classList: 'user' });
        const position = Object.assign(document.createElement('span'), { classList: `position ${+index === 0 ? 'gold' : +index === 1 ? 'silver' : +index === 2 ? 'bronze' : ''}` });
        position.innerText = +index + 1;
        const userAvatar = Object.assign(document.createElement('img'), { src: `${user.avatar}?size=64`, classList: 'userAvatar' });
        const username = Object.assign(document.createElement('span'), { classList: 'username' });
        username.innerText = user.username;
        const role = new DOMParser().parseFromString(
            `<div class="role" style="opacity: ${user.role?.color ? 1 : 0}"><div class="roleColor" style="background: ${user?.role?.color}"></div><span>${
                user?.role?.name
            }</span></div>`,
            'text/html'
        );
        const xp = Object.assign(document.createElement('div'), { classList: 'xp' });
        xp.innerText = formatter.format(+user.xp);
        const level = Object.assign(document.createElement('div'), { classList: 'level' });
        level.innerText = Math.floor(Math.sqrt(+user.xp / 10));
        userDiv.append(position, userAvatar, username, role.getElementsByClassName('role')[0], xp, level);
        userDiv.innerHTML += `<svg id="${user.id}_caret" class="caret rotated" width="20" height="20" viewbox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 14.5l5-5 5 5" stroke="rgb(181, 187, 202)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>`;
        userDiv.onclick = () => {
            if (userDiv.classList.contains('expanded')) return userDiv.classList.remove('expanded');
            document.querySelectorAll('.expanded').forEach((element) => {
                element.classList.remove('expanded');
            });
            userDiv.classList.add('expanded');
        };
        if (user.id === me?.id) {
            const clone = userDiv.cloneNode(true);
            clone.classList.add('me');
            clone.id = `me_${user.id}`;
            clone.onclick = () => {
                if (clone.classList.contains('expanded')) return clone.classList.remove('expanded');
                document.querySelectorAll('.expanded').forEach((element) => {
                    element.classList.remove('expanded');
                });
                clone.classList.add('expanded');
            };
            document.getElementById('me').append(clone);
        }
        container.append(userDiv);
    }
});
