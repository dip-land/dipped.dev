window.addEventListener("load", async () => {
	let guilds = window.localStorage.getItem("guilds");
	let server = await (
		await fetch(
			`/api/minecraft/servers/${location.pathname.replace("/minecraft/", "")}`,
			{ headers: { guilds } },
		)
	).json();

	if (server.status === "OKAY" && localStorage.getItem("access_token")) {
		const interval = setInterval(() => {
			if (guilds === null) location.reload();
			else {
				clearInterval(interval);
				location.reload();
			}
		}, 1000);
		return;
	}
	if (server.status === "NOT FOUND" || server.status === "OKAY") return;

	if (document.getElementById("map_frame")) {
		document.getElementById("map_frame").src =
			`/minecraft/maps/${server.identifier}/minecraft-overworld/index.html`;

		document
			.getElementById("selected_dimension")
			.addEventListener("change", (event) => {
				document.getElementById("map_frame").src =
					`/minecraft/maps/${server.identifier}/${event.target.value}/index.html`;
			});
	}

	// if (server.ip) {
	// 	serverIP.innerHTML =
	// 		server.ip +
	// 		`<span class="tooltiptext">Click the IP to copy to clipboard.</span>`;
	// 	serverIP.addEventListener("click", () => {
	// 		navigator.clipboard.writeText(server.ip);
	// 		serverIP.innerHTML = "Copied!";
	// 		serverIP.classList.toggle("green");
	// 		setTimeout(() => {
	// 			serverIP.innerHTML =
	// 				server.ip +
	// 				`<span class="tooltiptext">Click the IP to copy to clipboard.</span>`;
	// 			serverIP.classList.toggle("green");
	// 		}, 1500);
	// 	});
	// } else {
	// 	document.getElementById("ip-container").remove();
	// }

	if (server.status !== "Current") {
		document.getElementById("player_container")?.remove();
	}

	try {
		const availableMaps = await (
			await fetch(`/api/minecraft/maps/${server.id}`, { headers: { guilds } })
		).json();
		for (const map of availableMaps) {
			if (map.includes("minecraft:")) continue;
			document.getElementById("selected_dimension").innerHTML +=
				`<option value="${map.replace(":", "-")}">${map.replace(":", " ")}</option>`;
		}
	} catch (error) {
		document.getElementById("map_container").style.display = "none";
	}
});
