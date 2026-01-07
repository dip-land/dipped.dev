use maud::{Markup, html};

use crate::minecraft::api::{Server, ServerStatus};

pub fn server_card(server: Server) -> Markup {
    let classlist;
    if server.status == ServerStatus::Current {
        classlist = "server current";
    } else if server.status == ServerStatus::Archived {
        classlist = "server archived";
    } else {
        classlist = "server deleted";
    }
    html! {
        a class=(classlist) href=(format!("/minecraft/{}", server.identifier)) {
            div class="server_background" style=(format!("background-image: url('/api/minecraft/icons/{}');", server.id)) {}
            div class="server_content" {
                img class="server_icon" src=(format!("/api/minecraft/icons/{}", server.id)) width="140px" height="140px" alt=(server.name) {}
                span class="server_name" { (server.name) }
            }
        }
    }
}
