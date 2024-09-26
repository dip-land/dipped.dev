const formatter = Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
});

const dateFormatter = new Intl.DateTimeFormat('en-us', { month: 'long', day: 'numeric', year: 'numeric' });

window.addEventListener('load', async () => {
    console.log('e');
    const accessToken = window.localStorage.getItem('access_token');
    const container = document.getElementById('users');
    if (!accessToken) document.getElementById('me').remove();
    const guildID = window.location.pathname.replace('/role-eater/dashboard/', '');
    const data = await (await fetch(`/api/role-eater/${guildID}`, { headers: { guilds: localStorage.getItem('guilds') } })).json();
    console.log(data);
    const usersWithRoles = data.users.map((user) => user.role?.id).filter((v) => v);
    const totalMessages = data.users.map((user) => user.message.count).reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    const totalVoiceTime = data.users.map((user) => user.voice.time).reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    const guildIcon = Object.assign(document.createElement('img'), { id: 'guildIcon', src: `${data.guild.icon}` });
    document.getElementById('guildName').innerText = data.guild.name;
    guildIcon.addEventListener('error', (event) => {
        guildIcon.remove();
        const text = data.guild.name.split(' ').map((v, i) => {
            if (i < 3) return v.charAt(0);
        });
        document.getElementById('guildTop').prepend(Object.assign(document.createElement('span'), { id: 'guildIcon', innerText: `${text.join('')}` }));
    });
    document.getElementById('guildTop').prepend(guildIcon);
    document.getElementById('guildInfo').innerHTML = `<span>Users: ${Number(data.users.length).toLocaleString()}</span>
    <span>Roles: ${Number(usersWithRoles.length).toLocaleString()}</span>
    <span>Messages: ${Number(totalMessages).toLocaleString()}</span>
    <span>Voice Minutes: ${Math.round(Number(totalVoiceTime)).toLocaleString()}</span>`;

    const today = new Date();
    let labels = [];
    const messageData = [];
    const voiceData = [];

    const messageHistory = data.users.flatMap((user) => user.message.history);
    const voiceHistory = data.users.flatMap((user) => user.voice.history);
    for (let index = 0; index < 46; index++) {
        const day = new Date(new Date().setDate(today.getDate() - index));
        labels.push(new Intl.DateTimeFormat('en-us', { month: 'long', day: 'numeric' }).format(day));
        const messages = messageHistory.filter((v) => dateFormatter.format(new Date(v.date)) === dateFormatter.format(day));
        messageData.push(
            messages?.at(0)
                ? messages.reduce((accumulator, object) => {
                      return accumulator + object.count;
                  }, 0)
                : 0
        );
        const voice = voiceHistory.filter((v) => dateFormatter.format(new Date(v.date)) === dateFormatter.format(day));
        voiceData.push(
            voice?.at(0)
                ? voice.reduce((accumulator, object) => {
                      return accumulator + Math.round(object.time);
                  }, 0)
                : 0
        );
    }
    labels = labels.reverse();
    new Chart(document.getElementById('serverActivityChartCanvas'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Messages',
                    data: messageData.reverse(),
                    borderWidth: 0,
                    backgroundColor: '#36a2eb',
                },
                {
                    label: 'Voice Minutes',
                    data: voiceData.reverse(),
                    borderWidth: 0,
                    backgroundColor: '#ff6384',
                },
            ],
        },
        options: {
            animation: false,
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        font: {
                            family: 'SF Pro Text, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
                        },
                        color: '#8a91a5',
                    },
                },
                y: {
                    stacked: true,
                    ticks: {
                        font: {
                            family: 'SF Pro Text, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
                        },
                        color: '#8a91a5',
                    },
                },
            },
            plugins: {
                legend: {
                    display: false,
                },
            },
        },
    });

    const me = JSON.parse(localStorage.getItem('me'));
    for (const index in data.users) {
        const user = data.users[index];
        console.log(user);
        const userDiv = Object.assign(document.createElement('a'), { id: `${user.id}`, classList: 'user' });
        userDiv.href = location.href + `/${user.id}`;
        const position = Object.assign(document.createElement('span'), { classList: `position ${+index === 0 ? 'first' : +index === 1 ? 'second' : +index === 2 ? 'third' : ''}` });
        position.innerText = +index + 1;
        const userAvatar = Object.assign(document.createElement('img'), { src: `${user.avatar}?size=64`, classList: 'userAvatar' });
        const username = Object.assign(document.createElement('span'), { classList: 'username' });
        username.innerHTML = `${user.nickname} <span>${user.username}</span>`;
        const messages = Object.assign(document.createElement('div'), { classList: 'xp' });
        messages.innerText = formatter.format(+user.message.count);
        const voiceTime = Object.assign(document.createElement('div'), { classList: 'xp' });
        voiceTime.innerText = formatter.format(+user.voice.time);
        const total = Object.assign(document.createElement('div'), { classList: 'xp' });
        total.innerText = formatter.format(+user.message.count + +user.voice.time);
        userDiv.append(position, userAvatar, username, messages, voiceTime, total);
        if (user.id === me?.id) {
            const clone = userDiv.cloneNode(true);
            clone.classList.add('me');
            clone.id = `me_${user.id}`;
            document.getElementById('me').append(clone);
        }
        container.append(userDiv);
    }
});
