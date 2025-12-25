window.addEventListener('load', async () => {
    const params = new URLSearchParams(location.search);
    const script = document.getElementById('mainScript');
    const guildID = script.getAttribute('data-guild');
    const userID = script.getAttribute('data-user');
    const data = await (await fetch(`/api/role-eater/${guildID}/${userID}`)).json();
    const positions = await (await fetch(`/api/role-eater/${guildID}/positions`)).json();
    const activityData = await (await fetch(`/api/role-eater/${guildID}/${userID}/activity`)).json();
    const latestActivityData = await (await fetch(`/api/role-eater/${guildID}/${userID}/activity/latest`)).json();
    const gameData = await (await fetch(`/api/role-eater/${guildID}/${userID}/activity/game`)).json();
    const musicData = await (await fetch(`/api/role-eater/${guildID}/${userID}/activity/music`)).json();

    if (false) {
        document.getElementById('main').style.backgroundImage = `url('${data.user.statImage.replace(/(\r\n|\n|\r)/gm, '')}')`;
        document.getElementById('main').classList.add('customImage');
    } else if (data.banner && false) {
        document.getElementById('main').style.backgroundImage = `url('${data.banner}')`;
        document.getElementById('main').classList.add('customImage');
    }

    const days = clampy(parseInt(params.get('t'), 10) + 1 || 46, 0, 366);

    function clampy(value, min, max) {
        return value <= min ? min : value >= max ? max : value;
    }

    document.getElementById('userAvatar').src = data.avatar;
    document.getElementById('displayName').innerHTML = data.nickname ?? data.display_name ?? data.apiUser.global_name;
    document.getElementById('userName').innerHTML = data.username;
    document.getElementById('serverName').innerHTML = data.guild_name;

    const formatter = new Intl.DateTimeFormat('en-us', { month: 'short', day: 'numeric', year: 'numeric' });
    document.getElementById('createdOn').innerHTML = formatter.format(new Date(data.created_date));
    document.getElementById('joinedOn').innerHTML = formatter.format(new Date(data.join_date));

    document.getElementById('footerText').innerHTML = document.getElementById('footerText').innerHTML.replace('{d}', days - 1);

    const numberFormatter = Intl.NumberFormat('en-US', {
        notation: 'standard',
        maximumFractionDigits: 2,
    });

    const labels = [],
        messageData = [],
        voiceData = [],
        gameDataHours = [],
        musicDataHours = [],
        voiceDataMins = [],
        gameDataMins = [],
        musicDataMins = [];

    for (let index = 0; index < 46; index++) {
        const day = new Date(new Date().setDate(new Date().getDate() - index));
        const data = activityData.data.find((v) => v.date === day.toDateString());
        labels.push(new Intl.DateTimeFormat('en-us', { month: 'long', day: 'numeric' }).format(day));
        messageData.push(data?.message_count ?? 0);
        voiceData.push(data?.voice_time / 60 ?? 0);
        voiceDataMins.push(data?.voice_time ?? 0);
        gameDataHours.push(data?.game_time / 60 / 60 || 0);
        gameDataMins.push(data?.game_time / 60 || 0);
        musicDataHours.push(data?.music_time / 60 / 60 || 0);
        musicDataMins.push(data?.music_time / 60 || 0);
    }

    const messages = messageData.reduce((a, b) => {
        return a + b;
    }, 0);
    const voiceTime = voiceDataMins.reduce((a, b) => {
        return a + b;
    }, 0);
    const gameTime = gameDataMins.reduce((a, b) => {
        return a + b;
    }, 0);
    const musicTime = musicDataMins.reduce((a, b) => {
        return a + b;
    }, 0);

    console.log(messages, voiceTime, gameTime, musicTime);

    document.getElementById('messageCount').innerText = numberFormatter.format(messages);
    document.getElementById('voiceTime').innerText = numberFormatter.format(voiceTime > 60 ? voiceTime / 60 : voiceTime);
    document.getElementById('voiceFormat').innerText = voiceTime > 60 ? 'hrs' : 'mins';
    document.getElementById('gameTime').innerText = numberFormatter.format(gameTime > 60 ? gameTime / 60 : gameTime);
    document.getElementById('gameFormat').innerText = gameTime > 60 ? 'hrs' : 'mins';
    document.getElementById('musicTime').innerText = numberFormatter.format(musicTime > 60 ? musicTime / 60 : musicTime);
    document.getElementById('musicFormat').innerText = musicTime > 60 ? 'hrs' : 'mins';

    const ctx = document.getElementById('activityChart');

    let scales = {
        y: {
            beginAtZero: true,
            ticks: {
                font: {
                    family: 'SF Pro Text, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
                },
                color: '#8990a4',
                display: true,
            },
            grid: {
                display: true,
                color: '#8990a480',
            },
        },
        x: {
            ticks: {
                font: {
                    family: 'SF Pro Text, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
                },
                color: '#8990a4',
                display: true,
            },
            grid: {
                display: false,
            },
        },
    };

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.reverse(),
            datasets: [
                {
                    label: 'Messages',
                    data: messageData.reverse(),
                    borderWidth: 4,
                    borderColor: '#36d9ebd9',
                    normalized: true,
                },
                {
                    label: 'Voice',
                    data: voiceData.reverse(),
                    borderWidth: 4,
                    borderColor: '#ff636bd9',
                    normalized: true,
                },
                {
                    label: 'GameTime',
                    data: gameDataHours.reverse(),
                    borderWidth: 4,
                    borderColor: '#63ff7dd9',
                    normalized: true,
                },
                {
                    label: 'MusicTime',
                    data: musicDataHours.reverse(),
                    borderWidth: 4,
                    borderColor: '#b94fffd9',
                    normalized: true,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            layout: {
                padding: 5,
            },
            elements: {
                line: {
                    tension: 0.4,
                    borderCapStyle: 'round',
                },
                point: {
                    pointStyle: false,
                },
            },
            scales,
            plugins: {
                legend: {
                    display: false,
                },
            },
        },
    });

    const header = document.getElementById('header');
    const legend = document.getElementById('legend');
    const chart = document.getElementById('chart');
    const footer = document.getElementById('footer');

    chart.setAttribute(
        'style',
        `height: calc(100% - ${header.getBoundingClientRect().height}px - ${legend.getBoundingClientRect().height}px - ${footer.getBoundingClientRect().height}px - 3rem);`
    );
});
