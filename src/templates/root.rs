use maud::{Markup, html};

use crate::templates::caret;

pub fn main(head: Vec<Markup>, body: Vec<Markup>) -> Markup {
    html! {
        head {
            @for child in &head {
                (child)
            }
        }
        body {
            @for child in &body {
                (child)
            }
        }
    }
}

pub fn main_section(children: Vec<Markup>) -> Markup {
    html! {
        main {
            div class="ad_container" {}
            div class="content_container" {
                @for child in &children {
                    (child)
                }
            }
            div class="ad_container" {}
        }
    }
}

pub fn nav() -> Markup {
    html! {
        div class="notification_bar" {}
        script src="https://uptime.betterstack.com/widgets/announcement.js" data-id="182161" async type="text/javascript" {}
        nav {
            div class="left" {
                a id="nav_home_link" href="/" { "home" }
                a id="nav_projects_link" href="/projects" { "projects" }
                a id="nav_role_eater_link" href="/role-eater" { "role_eater" }
                a id="nav_minecraft_link" href="/minecraft" { "minecraft" }
                a href="https://status.dipped.dev/" { "status" }
            }
            div class="center" {}
            div class="right" {
                a class="login" target="popup" { "Login" }
                div class="user_popout" {
                    div id="user" class="user hidden" {
                        img id="user_nav_avatar" loading="lazy" alt="User Avatar" width="20px" height="20px" {}
                        span id="username" {}
                        (caret::main(true))
                    }
                    div id="nav_popout" class="popout hidden" {
                        div id="logout" { "Logout" }
                    }
                }
            }
        }
    }
}
