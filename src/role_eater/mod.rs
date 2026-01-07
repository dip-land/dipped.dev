use crate::{
    AppState,
    templates::{head, root, status::status_404_handler, terminal, terminal_line},
};
use axum::{Router, routing::get};
use maud::Markup;

pub mod api;
mod dashboard;

pub fn router() -> Router<AppState> {
    Router::<AppState>::new()
        .route("/", get(generate_index()))
        .nest("/dashboard", dashboard::router())
        .fallback(status_404_handler())
}

pub fn generate_index() -> Markup {
    root::main(
        vec![head::main()],
        vec![
            root::nav(),
            root::main_section(vec![terminal::main(
                vec![
                    terminal_line::command("bash ~/role_eater"),
                    terminal_line::blank(),
                    terminal::divider("ROLE EATER"),
                    terminal::inline_group(vec![
                        terminal::image(
                            "/static/media/images/role-eater.gif",
                            "Role Eater Icon",
                            true,
                            "width: 120px;",
                        ),
                        terminal::group(
                            vec![
                                terminal_line::output("A stat-tracking role-creation Discord bot."),
                                terminal::inline_group(vec![
                                    terminal::button(terminal::ButtonOptions {
                                        href: "/role-eater/dashboard",
                                        external: false,
                                        content: "dashboard ",
                                        button_number: Some(1),
                                        disabled: false,
                                        inline: true,
                                        style: terminal::ButtonStyle::Default,
                                    }),
                                    terminal::button(terminal::ButtonOptions {
                                        href: "/role-eater",
                                        external: false,
                                        content: "invite bot ",
                                        button_number: Some(2),
                                        disabled: true,
                                        inline: true,
                                        style: terminal::ButtonStyle::Default,
                                    }),
                                    terminal::button(terminal::ButtonOptions {
                                        href: "https://discord.gg/pHWbSYd96G",
                                        external: true,
                                        content: "support server ",
                                        button_number: Some(3),
                                        disabled: false,
                                        inline: true,
                                        style: terminal::ButtonStyle::Default,
                                    }),
                                    terminal::button(terminal::ButtonOptions {
                                        href: "https://github.com/dip-land/dipped.dev",
                                        external: true,
                                        content: "github ",
                                        button_number: Some(4),
                                        disabled: false,
                                        inline: true,
                                        style: terminal::ButtonStyle::Default,
                                    }),
                                ]),
                            ],
                            true,
                            "flex-direction: column;",
                        ),
                    ]),
                    terminal_line::blank(),
                    terminal_line::command_cursor(),
                ],
                terminal::TerminalType::Normal,
            )]),
        ],
    )
}
