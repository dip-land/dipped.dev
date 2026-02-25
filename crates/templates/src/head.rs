use maud::{Markup, html};

pub fn main() -> Markup {
    html! {
        meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" {}
        link rel="preconnect" href="https://discord.com" {}
        script defer src="/static/plugins/notification/index.js" {}
        script async src="/static/js/auth.js" {}
        script async src="/static/js/index.js" {}
        script async src="/shared/js/index.js" {}
        script async src="https://www.googletagmanager.com/gtag/js?id=G-LZR1KW152J" {}
        link rel="stylesheet" type="text/css" href="/shared/css/index.css" {}
    }
}

pub fn status() -> Markup {
    html! {
        script async src="/static/js/status.js" {}
    }
}

pub fn minecraft_home() -> Markup {
    html! {
        link rel="stylesheet" type="text/css" href="/static/css/index.css" {}
    }
}

pub fn minecraft_server() -> Markup {
    html! {
        link rel="stylesheet" type="text/css" href="/static/css/server.css" {}
        script async src="/static/js/servers.js" {}
    }
}


pub fn role_eater() -> Markup {
    html! {
        meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" {}
        link rel="preconnect" href="https://discord.com" {}
        script async src="/static/js/auth.js" {}
        script async src="/static/js/index.js" {}
        script async src="/shared/js/index.js" {}
        script async src="https://www.googletagmanager.com/gtag/js?id=G-LZR1KW152J" {}
        link rel="stylesheet" type="text/css" href="/shared/css/index.css" {}
    }
}
pub fn role_eater_dashboard() -> Markup {
    html! {
        script async src="/static/js/dashboard.js" {}
        link rel="stylesheet" type="text/css" href="/static/css/dashboard.css" {}
    }
}

pub fn role_eater_guild() -> Markup {
    html! {
        script async src="/static/js/guild.js" {}
        script async src="https://cdn.jsdelivr.net/npm/echarts@6.0.0/dist/echarts.min.js" {}
        script async src="https://cdn.jsdelivr.net/npm/chart.js" {}
        link rel="stylesheet" type="text/css" href="/static/css/guild/index.css" {}
    }
}

pub fn r6_main() -> Markup {
    html! {
        meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" {}
        script async src="/static/js/nav.js" {}
        script async src="/static/js/index.js" {}
        script async src="/shared/js/index.js" {}
        script async src="https://www.googletagmanager.com/gtag/js?id=G-LZR1KW152J" {}
        link rel="stylesheet" type="text/css" href="/shared/css/index.css" {}
        link rel="stylesheet" type="text/css" href="/static/css/index.css" {}
    }
}

pub fn r6_random() -> Markup {
    html! {
        meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" {}
        script async src="/static/js/nav.js" {}
        script async src="/static/js/random.js" {}
        script async src="/shared/js/index.js" {}
        script async src="https://www.googletagmanager.com/gtag/js?id=G-LZR1KW152J" {}
        link rel="stylesheet" type="text/css" href="/shared/css/index.css" {}
        link rel="stylesheet" type="text/css" href="/static/css/index.css" {}
    }
}

pub fn r6_ffa() -> Markup {
    html! {
        meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" {}
        script async src="/static/js/nav.js" {}
        script async src="/static/js/ffa.js" {}
        script async src="/shared/js/index.js" {}
        script async src="https://www.googletagmanager.com/gtag/js?id=G-LZR1KW152J" {}
        link rel="stylesheet" type="text/css" href="/shared/css/index.css" {}
        link rel="stylesheet" type="text/css" href="/static/css/index.css" {}
    }
}
