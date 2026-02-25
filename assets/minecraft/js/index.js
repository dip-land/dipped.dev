window.addEventListener('load', async () => {
    let nav_minecraft_link = document.getElementById('nav_minecraft_link');
    nav_minecraft_link.classList.add('active');

    let buttons = document.getElementsByClassName('terminal_button');

    for (const button of buttons) {
        const href = button.getAttribute('data-href');
        const is_external = button.getAttribute('data-external');
        button.addEventListener('click', () => {
            if (href === "") {
                window.history.back();
                return;
            }
            if (is_external === 'true') {
                window.open(href, '_blank');
            } else {
                window.open(`${location.origin}${href}`, '_self');
            }
        })
    }
});
