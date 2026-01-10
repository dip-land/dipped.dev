const formatter = Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
});

const dateFormatter = new Intl.DateTimeFormat('en-us', { month: 'long', day: 'numeric', year: 'numeric' });

window.addEventListener('load', async () => {
    const accessToken = window.localStorage.getItem('access_token');
    if (!accessToken) {
        const parent = document.getElementById("terminal_content");
        parent.children[4].remove();
        parent.children[4].remove();
    }

    const guildID = window.location.pathname.replace('/role-eater/dashboard/', '');
    const data = await (await fetch(`/api/role-eater/${guildID}`, { headers: { guilds: localStorage.getItem('guilds') } })).json();
    const chart_data = (await (await fetch(`/api/role-eater/${guildID}/activity`, { headers: { guilds: localStorage.getItem('guilds') } })).json()).data;

    let labels = [];
    let messageData = [];
    let voiceData = [];

    for (let index = 0; index < 46; index++) {
        const day = new Date(new Date().setDate(new Date().getDate() - index));
        const data = chart_data.find((v) => v.date === day.toDateString());
        labels.push(new Intl.DateTimeFormat('en-us', { month: 'long', day: 'numeric' }).format(day));
        let message_count = data?.message_count ?? 0;
        let voice_time = data?.voice_time ?? 0;
        messageData.push(message_count);
        voiceData.push(voice_time);
    }
    labels = labels.reverse();
    messageData = messageData.reverse();
    voiceData = voiceData.reverse();

    try {
        let chart = echarts.init(document.getElementById('main_chart'));
        const options = {
            title: {},
            tooltip: {
                trigger: 'axis'
            },
            grid: {
                left: 0,
                right: 0,
                top: 10,
                bottom: 0,
                containLabel: true
            },
            legend: {
                data: []
            },
            xAxis: {
                type: 'category',
                data: labels
            },
            yAxis: {
                type: 'value',
            },
            series: [
                {
                    name: 'Messages',
                    type: 'line',
                    data: messageData,
                    itemStyle: {
                        color: '#36a2eb'
                    },
                },
                {
                    name: 'Voice Minutes',
                    type: 'line',
                    data: voiceData.map(v => Math.round(v)),
                    itemStyle: {
                        color: '#ff6384'
                    },
                }
            ]
        };
        chart.setOption(options);

        window.addEventListener('resize', function () {
            chart.resize();
        });
    } catch (error) {
        console.log(error);
    }

    const me = JSON.parse(localStorage.getItem('me'));
    if (me) {
        console.log(data)
        const index = data.users.findIndex(v => v.user_id === me.id);
        const user = data.users[index];

        const row = Object.assign(document.createElement('tr'), {});

        const position = Object.assign(document.createElement('td'), {});
        position.innerText = +index + 1

        const content = Object.assign(document.createElement('td'), {});
        const avatar = Object.assign(document.createElement('img'), { src: `${user.avatar}?size=64` });
        content.append(avatar);
        content.innerHTML += `<div>${user.display_name} <span>${user.username}</span></div>`;

        const message_count = Object.assign(document.createElement('td'), {});
        message_count.innerText = formatter.format(+user.message_count);

        const voice_time = Object.assign(document.createElement('td'), {});
        voice_time.innerText = formatter.format(+user.voice_time);

        const total = Object.assign(document.createElement('td'), {});
        total.innerText = formatter.format(+user.total);

        row.append(position, content, message_count, voice_time, total);
        document.getElementById("terminal_content").children[5].children[0].append(row);
    }
});
