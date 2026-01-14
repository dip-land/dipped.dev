use crate::{
    AppState,
    minecraft::api::{Server, ServerOnlineStatus, ServerStatus, SortingOptions},
    templates::{
        head, root,
        status::status_404_handler,
        terminal::{self, ButtonOptions, TerminalCardOptions},
        terminal_line,
    },
};
use axum::{
    Router,
    extract::{Path, Query, State},
    response::IntoResponse,
    routing::get,
};
use maud::{Markup, html};
use std::path;
use tower_http::services::ServeDir;

pub mod api;

pub fn router(servers: Vec<Server>) -> Router<AppState> {
    let mut router = Router::new()
        .route("/", get(servers_page_handler))
        .route("/{name}", get(server_page_handler));

    for server in servers {
        let path = path::Path::new(&server.path);
        router = router
            .nest_service(
                format!("/maps/{}", server.identifier).as_str(),
                ServeDir::new(path.join("./map")),
            )
            .fallback(status_404_handler());
    }

    router.fallback(status_404_handler())
}

async fn servers_page_handler(
    State(state): State<AppState>,
    _sorting_options: Query<SortingOptions>,
) -> Markup {
    let servers = state.minecraft_servers.lock().await;
    let servers = servers.clone();
    let server_templates = servers
        .iter()
        .map(|server| {
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
        })
        .collect::<Vec<_>>();

    root::main(
        vec![head::main(), head::minecraft_home()],
        vec![
            root::nav(),
            root::main_section(vec![terminal::main(
                vec![
                    terminal_line::command("bash ~/minecraft"),
                    terminal_line::blank(),
                    terminal::grid(server_templates),
                    terminal_line::blank(),
                    terminal_line::command_cursor(),
                ],
                terminal::TerminalType::Normal,
            )]),
        ],
    )
}

async fn server_page_handler(
    State(state): State<AppState>,
    Path(identifier): Path<String>,
) -> impl IntoResponse {
    let servers = state.minecraft_servers.lock().await;
    let servers = servers.clone();
    let server = servers
        .iter()
        .find(|server| server.identifier == identifier);
    if server.is_none() {
        return status_404_handler().into_response();
    }
    let server = server.unwrap();

    let mut status = "Deleted";
    if ServerStatus::Current == server.status {
        if ServerOnlineStatus::Online == server.online {
            status = "Online";
        } else {
            status = "Offline";
        }
    }
    if ServerStatus::Archived == server.status {
        status = "Archived";
    }

    let mut main_group = vec![
        terminal_line::header(server.name.as_str()),
        terminal_line::output_alt(format!("Version: {}", server.version).as_str()),
        terminal_line::output_alt(format!("Status: {}", status).as_str()),
    ];

    if server.status == ServerStatus::Current {
        main_group.push(terminal_line::output_alt(
            format!("Players: {:?}", server.players.unwrap()).as_str(),
        ));
    }

    main_group.push(terminal_line::output_alt(
        format!("Start Date: {}", server.start_date).as_str(),
    ));
    main_group.push(terminal_line::output_alt(
        format!("End Date: {}", server.end_date).as_str(),
    ));

    root::main(
        vec![head::main(), head::minecraft_server()],
        vec![
            root::nav(),
            root::main_section(vec![terminal::main(
                vec![
                    terminal::inline_group(vec![
                        terminal::image(
                            format!("/api/minecraft/icons/{}", server.id).as_str(),
                            server.name.as_str(),
                            true,
                            "width: 200px;",
                        ),
                        terminal::group(main_group, false, "flex-direction: column; gap: 0.25rem;"),
                        terminal::group(
                            vec![
                                terminal::button(ButtonOptions {
                                    href: server.install_link.as_str(),
                                    external: true,
                                    content: "Install Mod Pack",
                                    button_number: None,
                                    disabled: false,
                                    inline: false,
                                    style: terminal::ButtonStyle::Default,
                                }),
                                terminal::button(ButtonOptions {
                                    href: server.view_pack_link.as_str(),
                                    external: true,
                                    content: "View Mod Pack",
                                    button_number: None,
                                    disabled: false,
                                    inline: false,
                                    style: terminal::ButtonStyle::Default,
                                }),
                                terminal::button(ButtonOptions {
                                    href: format!("/api/minecraft/worlds/{}", server.id).as_str(),
                                    external: true,
                                    content: "Download World File",
                                    button_number: None,
                                    disabled: !server.world_download,
                                    inline: false,
                                    style: terminal::ButtonStyle::Default,
                                }),
                            ],
                            false,
                            "flex-direction: column; gap: 0rem;",
                        ),
                    ]),
                    terminal_line::blank(),
                    html! {
                        div id="map_container" {
                            iframe id="map_frame" {}
                            div id="map_options" {
                                select id="selected_dimension" {
                                    option value="minecraft-overworld" selected { "Overworld" }
                                    option value="minecraft-the_nether" { "The Nether" }
                                    option value="minecraft-the_end" { "The End" }
                                }
                            }
                        }
                    },
                    terminal_line::command_cursor(),
                ],
                terminal::TerminalType::Normal,
            )]),
        ],
    )
    .into_response()
}
