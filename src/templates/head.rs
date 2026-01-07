use maud::{Markup, html};

pub fn main() -> Markup {
    html! {
        meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" {}
        link rel="preconnect" href="https://discord.com" {}
        script defer src="/static/plugins/notification/index.js" {}
        script async src="/static/js/auth.js" {}
        script async src="https://www.googletagmanager.com/gtag/js?id=G-LZR1KW152J" {}
        link rel="stylesheet" type="text/css" href="/static/css/index.css" {}
    }
}

pub fn status() -> Markup {
    html! {
        script async src="/static/js/status.js" {}
    }
}

pub fn minecraft_home() -> Markup {
    html! {
        link rel="stylesheet" type="text/css" href="/static/css/minecraft/index.css" {}
    }
}

pub fn minecraft_server() -> Markup {
    html! {
        link rel="stylesheet" type="text/css" href="/static/css/minecraft/server.css" {}
        script async src="/static/js/minecraft/servers.js" {}
    }
}

pub fn role_eater_dashboard() -> Markup {
    html! {
        script async src="/static/js/roleEater/dashboard.js" {}
        link rel="stylesheet" type="text/css" href="/static/css/roleEater/dashboard.css" {}
    }
}