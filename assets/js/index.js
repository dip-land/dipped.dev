window.addEventListener('load', async () => {
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());

    gtag('config', 'G-LZR1KW152J');
    gtag('consent', 'default', {
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied',
        'analytics_storage': 'denied'
    });

    let terminal_path = document.getElementById('terminal_path');
    if (terminal_path && location.pathname !== "/") {
        terminal_path.innerText = `~${location.pathname}`
    }

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

    let content = document.getElementById('terminal_content');
    let line_count_element = document.getElementById('line_count');

    if (content && line_count_element) line_count_element.innerText = `${getNestedElements(content).length} lines`;

    const targetNode = document.getElementById("terminal_content");
    const config = { attributes: false, childList: true, subtree: true };

    const callback = (mutationList, observer) => {
        for (const mutation of mutationList) {
            if (mutation.type === "childList") {
                let content = document.getElementById('terminal_content');
                let line_count_element = document.getElementById('line_count');

                if (line_count_element && content) line_count_element.innerText = `${getNestedElements(content).length} lines`;
            } else if (mutation.type === "attributes") {
                console.log(`The ${mutation.attributeName} attribute was modified.`);
            }
        }
    };


    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);

    setTimeout(() => {
        observer.disconnect();
    }, 30 * 1000);
});

function getNestedElements(node) {
    const elements = [];
    const children = node.childNodes;

    for (let i = 0; i < children.length; i++) {
        if (children[i].nodeType === document.ELEMENT_NODE) {
            elements.push(children[i], ...getNestedElements(children[i]));
        }
    }
    return elements;
}
