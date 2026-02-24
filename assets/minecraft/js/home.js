window.addEventListener("load", async () => {
	const params = new URLSearchParams(
		window.location.hash.slice(1) + window.location.search,
	);
	const sort = params.get("sort") || "na";
	const filter = params.get("filter") || "na";
	document.getElementById("sort").value = sort;
	document.getElementById("filter").value = filter;
	document.getElementById("reset").addEventListener("click", () => {
		location.replace(location.href.replace(location.search, ""));
	});
});
