window.addEventListener('load', async () => {
    let auto = false;

    let attackers = [
        {
            "name": "Striker",
            "image_src": "/static/media/images/striker.png"
        },
        {
            "name": "Sledge",
            "image_src": "/static/media/images/sledge.png"
        },
        {
            "name": "Thatcher",
            "image_src": "/static/media/images/thatcher.png"
        },
        {
            "name": "Ash",
            "image_src": "/static/media/images/ash.png"
        },
        {
            "name": "Thermite",
            "image_src": "/static/media/images/thermite.png"
        },
        {
            "name": "Twitch",
            "image_src": "/static/media/images/twitch.png"
        },
        {
            "name": "Montagne",
            "image_src": "/static/media/images/montagne.png"
        },
        {
            "name": "Glaz",
            "image_src": "/static/media/images/glaz.png"
        },
        {
            "name": "Fuze",
            "image_src": "/static/media/images/fuze.png"
        },
        {
            "name": "Blitz",
            "image_src": "/static/media/images/blitz.png"
        },
        {
            "name": "IQ",
            "image_src": "/static/media/images/iq.png"
        },
        {
            "name": "Buck",
            "image_src": "/static/media/images/buck.png"
        },
        {
            "name": "Blackbeard",
            "image_src": "/static/media/images/blackbeard.png"
        },
        {
            "name": "Capitão",
            "image_src": "/static/media/images/capitao.png"
        },
        {
            "name": "Hibana",
            "image_src": "/static/media/images/hibana.png"
        },
        {
            "name": "Jackal",
            "image_src": "/static/media/images/jackal.png"
        },
        {
            "name": "Ying",
            "image_src": "/static/media/images/ying.png"
        },
        {
            "name": "Zofia",
            "image_src": "/static/media/images/zofia.png"
        },
        {
            "name": "Dokkaebi",
            "image_src": "/static/media/images/dokkaebi.png"
        },
        {
            "name": "Lion",
            "image_src": "/static/media/images/lion.png"
        },
        {
            "name": "Finka",
            "image_src": "/static/media/images/finka.png"
        },
        {
            "name": "Maverick",
            "image_src": "/static/media/images/maverick.png"
        },
        {
            "name": "Nomad",
            "image_src": "/static/media/images/nomad.png"
        },
        {
            "name": "Gridlock",
            "image_src": "/static/media/images/gridlock.png"
        },
        {
            "name": "Nøkk",
            "image_src": "/static/media/images/nokk.png"
        },
        {
            "name": "Amaru",
            "image_src": "/static/media/images/amaru.png"
        },
        {
            "name": "Kali",
            "image_src": "/static/media/images/kali.png"
        },
        {
            "name": "Iana",
            "image_src": "/static/media/images/iana.png"
        },
        {
            "name": "Ace",
            "image_src": "/static/media/images/ace.png"
        },
        {
            "name": "Zero",
            "image_src": "/static/media/images/zero.png"
        },
        {
            "name": "Flores",
            "image_src": "/static/media/images/flores.png"
        },
        {
            "name": "Osa",
            "image_src": "/static/media/images/osa.png"
        },
        {
            "name": "Sens",
            "image_src": "/static/media/images/sens.png"
        },
        {
            "name": "Grim",
            "image_src": "/static/media/images/grim.png"
        },
        {
            "name": "Brava",
            "image_src": "/static/media/images/brava.png"
        },
        {
            "name": "Ram",
            "image_src": "/static/media/images/ram.png"
        },
        {
            "name": "Deimos",
            "image_src": "/static/media/images/deimos.png"
        },
        {
            "name": "Rauora",
            "image_src": "/static/media/images/rauora.png"
        }
    ];
    let defenders = [
        {
            "name": "Sentry",
            "image_src": "/static/media/images/sentry.png"
        },
        {
            "name": "Smoke",
            "image_src": "/static/media/images/smoke.png"
        },
        {
            "name": "Mute",
            "image_src": "/static/media/images/mute.png"
        },
        {
            "name": "Castle",
            "image_src": "/static/media/images/castle.png"
        },
        {
            "name": "Pulse",
            "image_src": "/static/media/images/pulse.png"
        },
        {
            "name": "Doc",
            "image_src": "/static/media/images/doc.png"
        },
        {
            "name": "Rook",
            "image_src": "/static/media/images/rook.png"
        },
        {
            "name": "Kapkan",
            "image_src": "/static/media/images/kapkan.png"
        },
        {
            "name": "Tachanka",
            "image_src": "/static/media/images/tachanka.png"
        },
        {
            "name": "Jäger",
            "image_src": "/static/media/images/jager.png"
        },
        {
            "name": "Bandit",
            "image_src": "/static/media/images/bandit.png"
        },
        {
            "name": "Frost",
            "image_src": "/static/media/images/frost.png"
        },
        {
            "name": "Valkyrie",
            "image_src": "/static/media/images/valkyrie.png"
        },
        {
            "name": "Caveira",
            "image_src": "/static/media/images/caveira.png"
        },
        {
            "name": "Echo",
            "image_src": "/static/media/images/echo.png"
        },
        {
            "name": "Mira",
            "image_src": "/static/media/images/mira.png"
        },
        {
            "name": "Lesion",
            "image_src": "/static/media/images/lesion.png"
        },
        {
            "name": "Ela",
            "image_src": "/static/media/images/ela.png"
        },
        {
            "name": "Vigil",
            "image_src": "/static/media/images/vigil.png"
        },
        {
            "name": "Alibi",
            "image_src": "/static/media/images/alibi.png"
        },
        {
            "name": "Maestro",
            "image_src": "/static/media/images/maestro.png"
        },
        {
            "name": "Clash",
            "image_src": "/static/media/images/clash.png"
        },
        {
            "name": "Kaid",
            "image_src": "/static/media/images/kaid.png"
        },
        {
            "name": "Mozzie",
            "image_src": "/static/media/images/mozzie.png"
        },
        {
            "name": "Warden",
            "image_src": "/static/media/images/warden.png"
        },
        {
            "name": "Goyo",
            "image_src": "/static/media/images/goyo.png"
        },
        {
            "name": "Wamai",
            "image_src": "/static/media/images/wamai.png"
        },
        {
            "name": "Oryx",
            "image_src": "/static/media/images/oryx.png"
        },
        {
            "name": "Melusi",
            "image_src": "/static/media/images/melusi.png"
        },
        {
            "name": "Aruni",
            "image_src": "/static/media/images/aruni.png"
        },
        {
            "name": "Thunderbird",
            "image_src": "/static/media/images/thunderbird.png"
        },
        {
            "name": "Thorn",
            "image_src": "/static/media/images/thorn.png"
        },
        {
            "name": "Azami",
            "image_src": "/static/media/images/azami.png"
        },
        {
            "name": "Solis",
            "image_src": "/static/media/images/solis.png"
        },
        {
            "name": "Fenrir",
            "image_src": "/static/media/images/fenrir.png"
        },
        {
            "name": "Tubarao",
            "image_src": "/static/media/images/tubarao.png"
        },
        {
            "name": "Skopós",
            "image_src": "/static/media/images/skopos.png"
        },
        {
            "name": "Denari",
            "image_src": "/static/media/images/denari.png"
        }
    ]

    let random_all_list = shuffle(JSON.parse(localStorage.getItem("attackers")).concat(JSON.parse(localStorage.getItem("defenders"))));

    function generate_random() {
        if (random_all_list.length < 2) random_all_list = shuffle(JSON.parse(localStorage.getItem("attackers")).concat(JSON.parse(localStorage.getItem("defenders"))));
        let randomIndex = Math.floor(Math.random() * random_all_list.length);
        let selected = random_all_list[randomIndex];
        random_all_list.splice(randomIndex, 1);
        return selected;
    }

    let buttons = document.getElementsByClassName('terminal_button');
    for (const button of buttons) {
        const href = button.getAttribute('data-href');
        button.addEventListener('click', () => {
            if (href === "random_any") {
                let selected = generate_random();
                while (selected === "Montagne" || selected === "Blitz" || selected === "Blackbeard" || selected === "Clash") selected = generate_random();
                set_selected(selected);
            }
            if (href === "random_auto") {
                if (auto) auto = false;
                else {
                    let selected = generate_random();
                    while (selected === "Montagne" || selected === "Blitz" || selected === "Blackbeard" || selected === "Clash") selected = generate_random();
                    set_selected(selected);
                    auto = true;
                };
            }
        })
    }

    function set_selected(name) {
        let selected = attackers.find((v) => v.name === name);
        if (selected) {
            selected_element.querySelector("#op_type").innerText = "Attacker";
            selected_element.querySelector("img").src = selected.image_src;
            selected_element.querySelector("#op_name").innerText = selected.name;
        } else {
            selected = defenders.find((v) => v.name === name);
            selected_element.querySelector("#op_type").innerText = "Defender";
            selected_element.querySelector("img").src = selected.image_src;
            selected_element.querySelector("#op_name").innerText = selected.name;
        }

    }

    setInterval(() => {
        console.log(auto)
        if (auto) {
            let selected = generate_random();
            while (selected === "Montagne" || selected === "Blitz" || selected === "Blackbeard" || selected === "Clash") selected = generate_random();
            set_selected(selected);
        }
    }, 10 * 1000);
});


function shuffle(array) {
    let new_arr = array;
    let currentIndex = new_arr.length;
    while (currentIndex != 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [new_arr[currentIndex], new_arr[randomIndex]] = [
            new_arr[randomIndex], new_arr[currentIndex]];
    }
    return new_arr;
}