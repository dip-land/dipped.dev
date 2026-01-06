use std::{fs, sync::Arc};

use axum::{Router, ServiceExt, extract::Request, routing::get};
use deadpool_diesel::postgres::Pool;
use dotenv::dotenv;
use futures::future::join_all;
use glob::glob;
use grass;
use maud::Markup;
use tokio::sync::Mutex;
use tower::layer::Layer;
use tower_http::{
    normalize_path::NormalizePathLayer,
    services::{ServeDir, ServeFile},
};
#[macro_use]
extern crate dotenv_codegen;

pub mod models;
pub mod schema;
pub mod templates;
pub mod utilities;

use crate::{
    minecraft::api::{Server, ServerOnlineStatus, ServerStatus, get_server_stats, get_servers},
    templates::{head, nav, root, status::status_404_handler, terminal, terminal_line},
};

// Route Modules
pub mod api;
pub mod minecraft;
pub mod role_eater;

#[derive(Clone)]
pub struct AppState {
    pub minecraft_servers: Arc<Mutex<Vec<Server>>>,
    pub guild_pool: Pool,
    pub user_pool: Pool,
}

#[tokio::main]
async fn main() {
    for entry in glob(format!("{}**/*.scss", dotenv!("CSS_PATH")).as_str()).expect("Failed to read glob pattern") {
        match entry {
            Ok(path) => {
                let scss = fs::read_to_string(&path).unwrap();
                match grass::from_string(scss, &grass::Options::default()) {
                    Ok(css) => {
                        let path = path.to_str().unwrap().replace(".scss", ".css");
                        match fs::write(&path, css) {
                            Ok(_) => {
                                println!("Wrote File {:?}", path);
                            }
                            Err(e) => println!("{:?}", e),
                        }
                    }
                    Err(e) => println!("{:?} {:?}", &path, e),
                }
            }
            Err(e) => println!("{:?}", e),
        }
    }

    dotenv().ok();

    let servers = join_all(get_servers().await.iter().map(|server| async {
        let mut server_online_status = ServerOnlineStatus::Offline;
        let mut player_count = 0;
        if let ServerStatus::Current = server.status {
            let server_stats = Some(get_server_stats(server.clone().id).await).unwrap();
            player_count = server_stats.latest.players_online.unwrap();
            server_online_status = ServerOnlineStatus::Online;
        }

        Server {
            id: server.clone().id,
            status: server.clone().status,
            online: server_online_status,
            version: server.clone().version,
            name: server.clone().name,
            identifier: server.clone().identifier,
            start_date: server.clone().start_date,
            end_date: server.clone().end_date,
            install_link: server.clone().install_link,
            view_pack_link: server.clone().view_pack_link,
            players: Some(player_count),
            path: server.clone().path,
            world_download: server.world_download,
            pack_dowload: server.pack_dowload,
            map_avaliable: server.map_avaliable,
        }
    }))
    .await;

    let guild_manager = deadpool_diesel::postgres::Manager::new(
        format!(
            "postgresql://{}:{}@{}/{}?options=-csearch_path%3D{}",
            dotenv!("PG_USER"),
            dotenv!("PG_PASSWORD"),
            dotenv!("PG_HOST"),
            dotenv!("PG_DB"),
            "guilds"
        )
        .as_str(),
        deadpool_diesel::Runtime::Tokio1,
    );
    let guild_pool = deadpool_diesel::postgres::Pool::builder(guild_manager)
        .build()
        .unwrap();

    let user_manager = deadpool_diesel::postgres::Manager::new(
        format!(
            "postgresql://{}:{}@{}/{}?options=-csearch_path%3D{}",
            dotenv!("PG_USER"),
            dotenv!("PG_PASSWORD"),
            dotenv!("PG_HOST"),
            dotenv!("PG_DB"),
            "users"
        )
        .as_str(),
        deadpool_diesel::Runtime::Tokio1,
    );
    let user_pool = deadpool_diesel::postgres::Pool::builder(user_manager)
        .build()
        .unwrap();

    let state = AppState {
        minecraft_servers: Arc::new(Mutex::new(servers.clone())),
        guild_pool,
        user_pool,
    };

    let app = NormalizePathLayer::trim_trailing_slash().layer(
        Router::<AppState>::new()
            .route("/", get(generate_index()))
            .nest("/api", api::router())
            .nest("/minecraft", minecraft::router(servers.clone()))
            .nest("/role-eater", role_eater::router())
            .nest_service(
                "/favicon.ico",
                ServeFile::new("assets/media/images/favicon.ico"),
            )
            .nest_service("/static", ServeDir::new("assets"))
            .nest_service("/static/vault", ServeDir::new("private"))
            .fallback(status_404_handler())
            .with_state(state),
    );

    let listener = tokio::net::TcpListener::bind("127.0.0.1:6570")
        .await
        .unwrap();
    println!("listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, ServiceExt::<Request>::into_make_service(app))
        .await
        .unwrap();
}

pub fn generate_index() -> Markup {
    root::main(
        vec![head::main()],
        vec![
            nav::main(),
            root::main_section(vec![terminal::main(
                vec![
                    terminal_line::command("bash ~/startup.sh"),
                    terminal_line::blank(),
                    terminal_line::header("Hi, I'm SeaBass (dipped.)"),
                    terminal::inline_group(vec![
                        terminal::image(
                            "/static/media/images/blip.png",
                            "seb",
                            true,
                            "width: 120px;",
                        ),
                        terminal::group(
                            vec![
                                terminal_line::output(
                                    "I'm a person and I don't know what to put here.",
                                ),
                                terminal::inline_group(vec![
                                    terminal::button(terminal::ButtonOptions {
                                        href: "/",
                                        external: false,
                                        content: "home ",
                                        button_number: Some(1),
                                        disabled: false,
                                        inline: true,
                                        style: terminal::ButtonStyle::Default,
                                    }),
                                    terminal::button(terminal::ButtonOptions {
                                        href: "/projects",
                                        external: false,
                                        content: "projects ",
                                        button_number: Some(2),
                                        disabled: false,
                                        inline: true,
                                        style: terminal::ButtonStyle::Default,
                                    }),
                                    terminal::button(terminal::ButtonOptions {
                                        href: "/role-eater",
                                        external: false,
                                        content: "role_eater ",
                                        button_number: Some(3),
                                        disabled: false,
                                        inline: true,
                                        style: terminal::ButtonStyle::Default,
                                    }),
                                    terminal::button(terminal::ButtonOptions {
                                        href: "/minecraft",
                                        external: false,
                                        content: "minecraft ",
                                        button_number: Some(4),
                                        disabled: false,
                                        inline: true,
                                        style: terminal::ButtonStyle::Default,
                                    }),
                                    terminal::button(terminal::ButtonOptions {
                                        href: "https://status.dipped.dev",
                                        external: true,
                                        content: "status ",
                                        button_number: Some(5),
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
