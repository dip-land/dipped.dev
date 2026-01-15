window.addEventListener('load', async () => {
    let template = document.getElementById("operator_template");
    let attacker_grid = document.getElementById("attacker_grid");
    let defender_grid = document.getElementById("defender_grid");

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

    let selected_attackers = [];
    let selected_defenders = [];

    if (localStorage.getItem("attackers")) {
        selected_attackers = JSON.parse(localStorage.getItem("attackers"));
    }

    if (localStorage.getItem("defenders")) {
        selected_defenders = JSON.parse(localStorage.getItem("defenders"));
    }

    for (const attacker of attackers) {
        let element = template.content.cloneNode(true).children[0];
        element.querySelector("img").src = attacker.image_src;
        element.querySelector("span").innerText = attacker.name;
        element.id = `operator_${attacker.name}`;
        if (!selected_attackers.includes(attacker.name)) element.classList.add("not_selected");
        attacker_grid.appendChild(element);
        element.addEventListener("click", () => {
            if (selected_attackers.includes(attacker.name)) {
                let index = selected_attackers.findIndex((v) => v === attacker.name);
                selected_attackers.splice(index, 1);
                element.classList.add("not_selected");
            } else {
                selected_attackers.push(attacker.name);
                element.classList.remove("not_selected");
            }
        });
    }

    for (const defender of defenders) {
        let element = template.content.cloneNode(true).children[0];
        element.querySelector("img").src = defender.image_src;
        element.querySelector("span").innerText = defender.name;
        element.id = `operator_${defender.name}`;
        if (!selected_defenders.includes(defender.name)) element.classList.add("not_selected");
        defender_grid.appendChild(element);
        element.addEventListener("click", () => {
            if (selected_defenders.includes(defender.name)) {
                let index = selected_defenders.findIndex((v) => v === defender.name);
                selected_defenders.splice(index, 1);
                element.classList.add("not_selected");
            } else {
                selected_defenders.push(defender.name);
                element.classList.remove("not_selected");
            }
        });
    }

    let all_attackers_selected = selected_attackers.length === attackers.length;
    let all_defenders_selected = selected_defenders.length === defenders.length;

    let buttons = document.getElementsByClassName('terminal_button');

    for (const button of buttons) {
        const href = button.getAttribute('data-href');
        button.addEventListener('click', () => {
            if (href === "save_selection") {
                localStorage.setItem("attackers", JSON.stringify(selected_attackers));
                localStorage.setItem("defenders", JSON.stringify(selected_defenders));
            }
            if (href === "select_all_attackers") {
                all_attackers_selected = selected_attackers.length === attackers.length
                if (all_attackers_selected) {
                    selected_attackers = [];
                    for (const element of attacker_grid.children) {
                        element.classList.add("not_selected");
                    }
                } else {
                    selected_attackers = attackers.map((v) => v.name);
                    for (const element of attacker_grid.children) {
                        element.classList.remove("not_selected");
                    }
                }
            }
            if (href === "select_all_defenders") {
                all_defenders_selected = selected_defenders.length === defenders.length
                if (all_defenders_selected) {
                    selected_defenders = [];
                    for (const element of defender_grid.children) {
                        element.classList.add("not_selected");
                    }
                } else {
                    selected_defenders = defenders.map((v) => v.name);
                    for (const element of defender_grid.children) {
                        element.classList.remove("not_selected");
                    }
                }
            }
        })
    }
});
