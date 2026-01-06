use crate::{
    AppState,
    templates::{head, nav, root, status::status_404_handler, terminal, terminal_line},
    utilities::create_page,
};
use axum::{Router, routing::get};
use maud::Markup;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(generate_index()))
        .route(
            "/{guild_id}",
            get(create_page(
                &[
                    "html/head.html",
                    "html/role_eater/dashboard/guild/head.html",
                ],
                &[
                    "html/nav.html",
                    "html/role_eater/dashboard/guild/index.html",
                ],
                None,
            )),
        )
        .route(
            "/{guild_id}/image",
            get(create_page(
                &[],
                &["html/role_eater/dashboard/guild/image.html"],
                None,
            )),
        )
        .route(
            "/{guild_id}/{user_id}",
            get(create_page(
                &["html/head.html", "html/role_eater/dashboard/user/head.html"],
                &["html/nav.html", "html/role_eater/dashboard/user/index.html"],
                None,
            )),
        )
        .route(
            "/{guild_id}/{user_id}/image",
            get(create_page(
                &[],
                &["html/role_eater/dashboard/user/image/index.html"],
                None,
            )),
        )
        .route(
            "/{guild_id}/{user_id}/chart",
            get(create_page(
                &[],
                &["html/role_eater/dashboard/user/image/chart.html"],
                None,
            )),
        )
        .fallback(status_404_handler())
}

pub fn generate_index() -> Markup {
    root::main(
        vec![head::main(), head::role_eater_dashboard()],
        vec![
            nav::main(),
            root::main_section(vec![terminal::main(
                vec![
                    terminal_line::command("bash ~/role_eater/dashboard"),
                    terminal_line::blank(),
                    terminal::divider("YOUR SERVERS"),
                    terminal::grid(vec![]),
                    terminal_line::blank(),
                    terminal_line::command_cursor(),
                ],
                terminal::TerminalType::Normal,
            )]),
        ],
    )
}
