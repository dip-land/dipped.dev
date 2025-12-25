const formatter = Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
});

const dateFormatter = new Intl.DateTimeFormat('en-us', { month: 'long', day: 'numeric', year: 'numeric' });

window.addEventListener('load', async () => {
    const accessToken = window.localStorage.getItem('access_token');
    const container = document.getElementById('users');
    if (!accessToken) document.getElementById('me').remove();

    const guildID = window.location.pathname.replace('/role-eater/dashboard/', '');
    const data = await (await fetch(`/api/role-eater/${guildID}`, { headers: { guilds: localStorage.getItem('guilds') } })).json();

    const guildIcon = Object.assign(document.createElement('img'), { id: 'guildIcon', src: `${data.icon}` });
    guildIcon.addEventListener('error', (event) => {
        guildIcon.remove();
        const text = data.name.split(' ').map((v, i) => {
            if (i < 3) return v.charAt(0);
        });
        document.getElementById('guildTop').prepend(Object.assign(document.createElement('span'), { id: 'guildIcon', innerText: `${text.join('')}` }));
    });

    document.getElementById('guildName').innerText = data.name;
    document.getElementById('guildTop').prepend(guildIcon);
    document.getElementById('guildInfo').innerHTML = `<span>Users: ${Number(data.users.length).toLocaleString()}</span>
    <span>Roles: ${Number(data.role_count).toLocaleString()}</span>
    <span>Messages: ${Number(data.message_count).toLocaleString()}</span>
    <span>Voice Minutes: ${Math.round(Number(data.voice_time)).toLocaleString()}</span>`;

    const chart_data = (await (await fetch(`/api/role-eater/${guildID}/activity`, { headers: { guilds: localStorage.getItem('guilds') } })).json()).data;

    let labels = [];
    const messageData = [];
    const voiceData = [];

    for (let index = 0; index < 46; index++) {
        const day = new Date(new Date().setDate(new Date().getDate() - index));
        const data = chart_data.find((v) => v.date === day.toDateString());
        labels.push(new Intl.DateTimeFormat('en-us', { month: 'long', day: 'numeric' }).format(day));
        messageData.push(data?.message_count ?? 0);
        voiceData.push(data?.voice_time ?? 0);
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
        const userDiv = Object.assign(document.createElement('a'), { id: `${user.user_id}`, classList: 'user' });
        userDiv.href = location.href + `/${user.user_id}`;

        const position = Object.assign(document.createElement('span'), { classList: `position ${+index === 0 ? 'first' : +index === 1 ? 'second' : +index === 2 ? 'third' : ''}` });
        position.innerText = +index + 1;

        const userAvatar = Object.assign(document.createElement('img'), { src: `${user.avatar}?size=64`, classList: 'userAvatar' });

        const username = Object.assign(document.createElement('span'), { classList: 'username' });
        username.innerHTML = `${user.display_name} <span>${user.username}</span>`;

        const messages = Object.assign(document.createElement('div'), { classList: 'xp' });
        messages.innerText = formatter.format(+user.message_count);

        const voiceTime = Object.assign(document.createElement('div'), { classList: 'xp' });
        voiceTime.innerText = formatter.format(+user.voice_time);

        const total = Object.assign(document.createElement('div'), { classList: 'xp' });
        total.innerText = formatter.format(+user.total);

        userDiv.append(position, userAvatar, username, messages, voiceTime, total);

        if (user.user_id === me?.id) {
            const clone = userDiv.cloneNode(true);
            clone.classList.add('me');
            clone.id = `me_${user.user_id}`;
            document.getElementById('me').append(clone);
        }

        container.append(userDiv);
    }
});
