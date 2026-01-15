window.addEventListener('load', async () => {
    let nav_home_link = document.getElementById('nav_home_link');
    let nav_projects_link = document.getElementById('nav_projects_link');
    let nav_role_eater_link = document.getElementById('nav_role_eater_link');
    let nav_minecraft_link = document.getElementById('nav_minecraft_link');

    if (nav_home_link && location.pathname === '/') {
        nav_home_link.classList.add('active');
    } else if (nav_projects_link && location.pathname.includes('projects')) {
        nav_projects_link.classList.add('active');
    } else if (nav_role_eater_link && location.pathname.includes('role-eater')) {
        nav_role_eater_link.classList.add('active');
    } else if (nav_minecraft_link && location.pathname.includes('minecraft')) {
        nav_minecraft_link.classList.add('active');
    }

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
