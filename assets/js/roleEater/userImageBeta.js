window.addEventListener('load', async () => {
    const script = document.getElementById('mainScript');
    const guildID = script.getAttribute('data-guild');
    const userID = script.getAttribute('data-user');
    const data = await (await fetch(`/api/role-eater/${guildID}/${userID}`)).json();

    if (data.user.statImage) {
        document.getElementById('main').style.backgroundImage = `url('${data.user.statImage.replace(/(\r\n|\n|\r)/gm, '')}')`;
        document.getElementById('main').classList.add('customImage');
    }

    document.getElementById('userAvatar').src = data.user.avatar;
    document.getElementById('displayName').innerHTML = data.apiMember.nickname ?? data.apiMember.displayName ?? data.apiUser.globalName;
    document.getElementById('userName').innerHTML = data.user.username;
    document.getElementById('serverName').innerHTML = data.guild.name;

    const formatter = new Intl.DateTimeFormat('en-us', { month: 'short', day: 'numeric', year: 'numeric' });
    document.getElementById('createdOn').innerHTML = formatter.format(data.apiUser.createdTimestamp);
    document.getElementById('joinedOn').innerHTML = formatter.format(data.apiMember.joinedTimestamp);

    document.getElementById('overallRank').innerHTML = `#${data.user.positions.total}`;
    document.getElementById('messageRank').innerHTML = `#${data.user.positions.message}`;
    document.getElementById('voiceRank').innerHTML = `#${data.user.positions.voice}`;

    const numberFormatter = Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 2,
    });

    document.getElementById('messageActivityall').innerHTML = numberFormatter.format(data.user.message.count).toLowerCase();
    document.getElementById('voiceActivityall').innerHTML = numberFormatter.format(data.user.voice.time).toLowerCase();

    const gameHistory = data.user.activities?.game?.history.sort((a, b) => b.time - a.time);
    document.getElementById('lastGame').innerHTML = `${data.user.activities?.game?.title ?? data.user.activities?.game?.lastPlayed ?? 'No Data'}`;
    const lgt = (Date.now() - (data.user.activities?.game?.startDate ?? Date.now())) / 1000 / 60;
    const gameMinutes = lgt || (data.user.activities?.game?.lastPlayedTime ?? 0) / 60;
    const gameTotalMins = (gameHistory?.at(0)?.time ?? 0) / 60;

    document.getElementById('lastGameTime').innerHTML = `${numberFormatter.format(gameMinutes > 60 ? gameMinutes / 60 : gameMinutes)} ${gameMinutes > 60 ? 'hrs' : 'mins'}`;
    document.getElementById('mostGame').innerHTML = `${gameHistory?.at(0)?.title ?? 'No Data'}`;
    document.getElementById('mostGameTime').innerHTML = `${numberFormatter.format(gameTotalMins > 60 ? gameTotalMins / 60 : gameTotalMins)} ${gameTotalMins > 60 ? 'hrs' : 'mins'}`;

    const musicHistory = data.user.activities?.music?.history.sort((a, b) => b.time - a.time);
    document.getElementById('lastSong').innerHTML = `${data.user.activities?.music?.song ?? data.user.activities?.music?.lastPlayed ?? 'No Data'}`;
    document.getElementById('lastSongArtist').innerHTML = `${data.user.activities?.music?.artist ?? data.user.activities?.music?.lastPlayedArtist ?? 'No Data'}`;
    document.getElementById('mostSong').innerHTML = `${musicHistory?.at(0)?.name ?? 'No Data'}`;
    document.getElementById('mostSongArtist').innerHTML = `${musicHistory?.at(0)?.artist ?? 'No Data'}`;

    const today = new Date();
    const labels = [];
    const messageData = [];
    const voiceData = [];
    const gameTime = [];
    const musicTime = [];

    const messageHistory = data.user.message.history;
    let messageWeekCount = 0;
    for (let index = 0; index < 46; index++) {
        const day = new Date(new Date().setDate(today.getDate() - index));
        labels.push(new Intl.DateTimeFormat('en-us', { month: 'long', day: 'numeric' }).format(day));
        const value = messageHistory.find((v) => formatter.format(new Date(v.date)) === formatter.format(day));
        if (index === 0) {
            document.getElementById('messageActivity1d').innerHTML = numberFormatter.format(value?.count ?? 0).toLowerCase();
        }
        if (index < 8) messageWeekCount = messageWeekCount + (value?.count ?? 0);
        messageData.push(value?.count ?? 0);
    }
    document.getElementById('messageActivity7d').innerHTML = numberFormatter.format(messageWeekCount).toLowerCase();

    const voiceHistory = data.user.voice.history;
    let voiceWeekCount = 0;
    for (let index = 0; index < 46; index++) {
        const day = new Date(new Date().setDate(today.getDate() - index));
        const value = voiceHistory.find((v) => formatter.format(new Date(v.date)) === formatter.format(day));
        if (index === 0) {
            document.getElementById('voiceActivity1d').innerHTML = numberFormatter.format(Math.round(value?.time || 0)).toLowerCase();
        }
        if (index < 8) voiceWeekCount = voiceWeekCount + Math.round(value?.time || 0);
        voiceData.push(value?.time / 60 || 0);
    }
    document.getElementById('voiceActivity7d').innerHTML = numberFormatter.format(voiceWeekCount).toLowerCase();

    const gameTimeHistory = data.user.activities?.game?.timeHistory;
    for (let index = 0; index < 46; index++) {
        const day = new Date(new Date().setDate(today.getDate() - index));
        const value = gameTimeHistory?.find((v) => formatter.format(new Date(v.date)) === formatter.format(day));
        gameTime.push(value?.time / 60 / 60 || 0);
    }

    const musicTimeHistory = data.user.activities?.music?.timeHistory;
    for (let index = 0; index < 46; index++) {
        const day = new Date(new Date().setDate(today.getDate() - index));
        const value = musicTimeHistory?.find((v) => formatter.format(new Date(v.date)) === formatter.format(day));
        musicTime.push(value?.time / 60 / 60 || 0);
    }

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
                display: false,
            },
        },
        x: {
            ticks: {
                display: false,
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
                    data: gameTime.reverse(),
                    borderWidth: 4,
                    borderColor: '#63ff7dd9',
                    normalized: true,
                },
                {
                    label: 'MusicTime',
                    data: musicTime.reverse(),
                    borderWidth: 4,
                    borderColor: '#b94fffd9',
                    normalized: true,
                },
            ],
        },
        options: {
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

    document.getElementById('activityChart').setAttribute('width', '635px');

    const header = document.getElementById('header');
    const rankActivity = document.getElementById('rankActivity');
    const bottom = document.getElementById('bottom');

    bottom.setAttribute('style', `height: calc(100% - ${header.getBoundingClientRect().height}px - ${rankActivity.getBoundingClientRect().height}px - 2rem);`);
});
