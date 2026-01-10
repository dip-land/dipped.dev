window.addEventListener('load', async () => {
    const paths = location.pathname.split("/").filter(v => v);
    const guildID = paths[2];
    const userID = paths[3];
    const data = await (await fetch(`/api/role-eater/${guildID}/${userID}`)).json();
    const activityData = await (await fetch(`/api/role-eater/${guildID}/${userID}/activity`)).json();
    const latestActivityData = await (await fetch(`/api/role-eater/${guildID}/${userID}/activity/latest`)).json();
    const gameData = await (await fetch(`/api/role-eater/${guildID}/${userID}/activity/game?limit=5`)).json();
    const musicData = await (await fetch(`/api/role-eater/${guildID}/${userID}/activity/music?limit=5`)).json();

    if (false) {
        document.getElementById('main').style.backgroundImage = `url('${data.user.statImage.replace(/(\r\n|\n|\r)/gm, '')}')`;
        document.getElementById('main').classList.add('customImage');
    } else if (data.banner && false) {
        document.getElementById('main').style.backgroundImage = `url('${data.banner}')`;
        document.getElementById('main').classList.add('customImage');
    }

    document.getElementById('userAvatar').src = data.avatar;
    document.getElementById('displayName').innerHTML = data.nickname ?? data.display_name ?? data.apiUser.global_name;
    document.getElementById('userName').innerHTML = data.username;
    document.getElementById('serverName').innerHTML = data.guild_name;

    const formatter = new Intl.DateTimeFormat('en-us', { month: 'short', day: 'numeric', year: 'numeric' });
    document.getElementById('createdOn').innerHTML = formatter.format(new Date(data.creation_date));
    document.getElementById('joinedOn').innerHTML = formatter.format(new Date(data.join_date));

    document.getElementById('overallRank').innerHTML = `#${data.total_position}`;
    document.getElementById('messageRank').innerHTML = `#${data.message_position}`;
    document.getElementById('voiceRank').innerHTML = `#${data.voice_position}`;

    const numberFormatter = Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 2,
    });

    document.getElementById('messageActivityall').innerHTML = numberFormatter.format(data.message_count).toLowerCase();
    document.getElementById('voiceActivityall').innerHTML = numberFormatter.format(data.voice_time).toLowerCase();

    const gameHistory = gameData.data;
    document.getElementById('lastGame').innerHTML = `${latestActivityData.current_game_title ?? latestActivityData.last_played_game_title ?? 'No Data'}`;
    const currentGameTime = (Date.now() - (latestActivityData.current_game_start_time ?? Date.now())) / 1000 / 60;
    const gameMinutes = currentGameTime || (latestActivityData.last_played_game_time ?? 0) / 60;
    const gameTotalMins = (gameHistory[0]?.time_played ?? 0) / 60;

    document.getElementById('lastGameTime').innerHTML = `${numberFormatter.format(gameMinutes > 60 ? gameMinutes / 60 : gameMinutes)} ${gameMinutes > 60 ? 'hrs' : 'mins'}`;
    document.getElementById('mostGame').innerHTML = `${gameHistory[0]?.game_title ?? 'No Data'}`;
    document.getElementById('mostGameTime').innerHTML = `${numberFormatter.format(gameTotalMins > 60 ? gameTotalMins / 60 : gameTotalMins)} ${gameTotalMins > 60 ? 'hrs' : 'mins'}`;

    const musicHistory = musicData.data;
    document.getElementById('lastSong').innerHTML = `${latestActivityData.current_song_title ?? latestActivityData.last_played_song_title ?? 'No Data'}`;
    document.getElementById('lastSongArtist').innerHTML = `${latestActivityData.current_song_artist ?? latestActivityData.last_played_song_artist ?? 'No Data'}`;
    document.getElementById('mostSong').innerHTML = `${musicHistory[0]?.song_title ?? 'No Data'}`;
    document.getElementById('mostSongArtist').innerHTML = `${musicHistory[0]?.song_artist ?? 'No Data'}`;

    const labels = [];
    const messageData = [];
    const voiceData = [];
    const gameTime = [];
    const musicTime = [];

    let messageWeekCount = 0;
    let voiceWeekCount = 0;
    for (let index = 0; index < 46; index++) {
        const day = new Date(new Date().setDate(new Date().getDate() - index));
        const data = activityData.data.find((v) => v.date === day.toDateString());
        labels.push(new Intl.DateTimeFormat('en-us', { month: 'long', day: 'numeric' }).format(day));
        if (index === 0) {
            document.getElementById('messageActivity1d').innerHTML = numberFormatter.format(data?.message_count ?? 0).toLowerCase();
            document.getElementById('voiceActivity1d').innerHTML = numberFormatter.format(Math.round(data?.voice_time ?? 0)).toLowerCase();
        }
        if (index < 8) {
            messageWeekCount = messageWeekCount + (data?.message_count ?? 0);
            voiceWeekCount = voiceWeekCount + Math.round(data?.voice_time ?? 0);
        }
        messageData.push(data?.message_count ?? 0);
        voiceData.push(data?.voice_time / 60 ?? 0);
        gameTime.push(data?.game_time / 60 / 60 || 0);
        musicTime.push(data?.music_time / 60 / 60 || 0);
    }

    document.getElementById('messageActivity7d').innerHTML = numberFormatter.format(messageWeekCount).toLowerCase();
    document.getElementById('voiceActivity7d').innerHTML = numberFormatter.format(voiceWeekCount).toLowerCase();

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
