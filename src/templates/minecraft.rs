use maud::Markup;

use crate::{
    minecraft::api::{Server, ServerStatus},
    templates::terminal::{self, TerminalCardOptions},
};

pub fn server_card(server: Server) -> Markup {
    let classlist;
    if server.status == ServerStatus::Current {
        classlist = "server current";
    } else if server.status == ServerStatus::Archived {
        classlist = "server archived";
    } else {
        classlist = "server deleted";
    }
    terminal::terminal_card(TerminalCardOptions {
        classlist,
        href: &format!("/minecraft/{}", server.identifier),
        background_src: &format!("/api/minecraft/icons/{}", server.id),
        icon_src: &format!("/api/minecraft/icons/{}", server.id),
        icon_alt: &server.name,
        content: &server.name,
    })
}
