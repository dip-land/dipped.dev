use axum::http::StatusCode;
use maud::{Markup, html};

use crate::templates::{head, root, terminal, terminal_line};

pub fn build_status_page(content: Markup) -> Markup {
    root::main(
        vec![head::main(), head::status()],
        vec![
            root::nav(),
            root::main_section(vec![terminal::main(
                vec![
                    terminal_line::command("curl /"),
                    terminal_line::blank(),
                    content,
                    terminal_line::blank(),
                    terminal::divider("SUGGESTIONS"),
                    terminal_line::command("cat suggestions.txt"),
                    terminal_line::info("Check if the URL is correct"),
                    terminal_line::info("Try refreshing the page"),
                    terminal_line::info("Contact me if the problem persists"),
                    terminal_line::blank(),
                    terminal::divider("ACTIONS"),
                    terminal::button(terminal::ButtonOptions {
                        href: "/",
                        external: false,
                        content: "Go Home",
                        button_number: None,
                        disabled: false,
                        inline: false,
                        style: terminal::ButtonStyle::Action,
                    }),
                    terminal::button(terminal::ButtonOptions {
                        href: "",
                        external: false,
                        content: "Go Back",
                        button_number: None,
                        disabled: false,
                        inline: false,
                        style: terminal::ButtonStyle::Action,
                    }),
                    terminal_line::blank(),
                    terminal_line::command_cursor(),
                ],
                terminal::TerminalType::StatusPage,
            )]),
        ],
    )
}

pub fn status_403_handler() -> (StatusCode, Markup) {
    (
        StatusCode::FORBIDDEN,
        build_status_page(html! {
            h1 class="status_text" { "403" }
            (terminal_line::error("Error 403: Request Forbidden"))
        }),
    )
}

pub fn error_403_handler<E>(err: E) -> (StatusCode, Markup)
where
    E: std::error::Error,
{
    eprintln!("{:?}", err.to_string());
    status_403_handler()
}

pub fn status_404_handler() -> (StatusCode, Markup) {
    (
        StatusCode::FORBIDDEN,
        build_status_page(html! {
            h1 class="status_text" { "404" }
            (terminal_line::error("Error 404: Not Found"))
        }),
    )
}

pub fn error_404_handler<E>(err: E) -> (StatusCode, Markup)
where
    E: std::error::Error,
{
    eprintln!("{:?}", err.to_string());
    status_404_handler()
}

pub fn status_500_handler() -> (StatusCode, Markup) {
    (
        StatusCode::FORBIDDEN,
        build_status_page(html! {
            h1 class="status_text" { "500" }
            (terminal_line::error("Error 500: Internal Server Error"))
        }),
    )
}

pub fn error_500_handler<E>(err: E) -> (StatusCode, Markup)
where
    E: std::error::Error,
{
    eprintln!("{:?}", err.to_string());
    status_500_handler()
}
