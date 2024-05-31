window.addEventListener('load', async () => {
    const params = new URLSearchParams(window.location.hash.slice(1) + window.location.search);
    const sort = params.get('sort') || 'asc';
    const status = params.get('status') || '';
    document.getElementById('sort').value = sort;
    document.getElementById('status').value = status;
    document.getElementById('reset').addEventListener('click', () => {
        location.replace(location.href.replace(location.search, ''));
    });

    let servers = await (await fetch(`/api/minecraft/servers`, { headers: { sort, status } })).json();
    if (document.getElementById('auth')) document.getElementById('auth-container').remove();
    if (servers.html && document.getElementById('servers')) document.getElementById('servers').innerHTML = servers.html;
});
