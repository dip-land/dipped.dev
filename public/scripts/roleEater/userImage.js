window.addEventListener('load', async () => {
    const query = new URLSearchParams(location.search);
    const type = query.get('type');
    const script = document.getElementById('mainScript');
    const guildID = script.getAttribute('data-guild');
    const userID = script.getAttribute('data-user');
    const data = await (await fetch(`/api/role-eater/${guildID}/${userID}`)).json();

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

    const today = new Date();
    const labels = [];
    const messageData = [];
    const voiceData = [];

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

    const ctx = document.getElementById('activityChart');

    let scales = {
        y: {
            beginAtZero: true,
            ticks: {
                display: false,
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

    if (type === 'chart') {
        document.getElementById('rankActivity').remove();
        document.getElementById('activityChart').setAttribute('height', '480px');
        document.getElementById('activityChart').setAttribute('width', '1240px');
        scales = {
            y: {
                beginAtZero: true,
                ticks: {
                    font: {
                        family: 'SF Pro Text, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
                    },
                    color: '#8a91a5',
                    display: true,
                },
                grid: {
                    display: false,
                },
            },
            x: {
                ticks: {
                    font: {
                        family: 'SF Pro Text, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
                    },
                    color: '#8a91a5',
                    display: true,
                },
                grid: {
                    display: false,
                },
            },
        };
    }

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.reverse(),
            datasets: [
                {
                    label: 'Messages',
                    data: messageData.reverse(),
                    borderWidth: 5,
                },
                {
                    label: 'Voice',
                    data: voiceData.reverse(),
                    borderWidth: 5,
                },
            ],
        },
        options: {
            animation: false,
            layout: {
                padding: type === 'chart' ? 10 : 0,
            },
            elements: {
                line: {
                    tension: 0.4,
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
});
