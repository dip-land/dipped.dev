#[macro_use]
extern crate dotenv_codegen;
extern crate dotenv;

use axum::{Router, ServiceExt, extract::Request, routing::get};
use deadpool_diesel::postgres::Pool;
use dotenv::dotenv;
use futures::future::join_all;
use maud::Markup;
use std::{env, path::Path, sync::Arc};
use tokio::sync::Mutex;
use tower::layer::Layer;
use tower_http::{
    normalize_path::NormalizePathLayer,
    services::{ServeDir, ServeFile},
};

pub mod models;
pub mod schema;
pub mod templates;
pub mod utilities;

use crate::{
    minecraft::api::{Server, ServerOnlineStatus, ServerStatus, get_server_stats, get_servers},
    templates::{head, root, status::status_404_handler, terminal, terminal_line},
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
    dotenv().ok();

    let args: Vec<String> = env::args().collect();
    let mut port = dotenv!("WEB_PORT");

    if args.len() >= 3 {
        port = args[2].as_str();
    }

    #[cfg(debug_assertions)]
    debug_fn();

    let servers = join_all(get_servers().await.iter().map(|server| async {
        let mut server_online_status = ServerOnlineStatus::Offline;
        let mut player_count = 0;
        if let ServerStatus::Current = server.status {
            let server_stats = get_server_stats(server.clone().id).await;
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
            pack_download: server.pack_download,
            map_available: server.map_available,
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

    let assets_path = Path::new(dotenv!("ASSETS_PATH"));
    let favicon_path = &assets_path.join("media/images/favicon.ico");
    let vault_path = &assets_path.join("vault");

    let mut router = Router::<AppState>::new();
    if (dotenv!("MINECRAFT_ROUTES_ENABLED") == "True") {
        router = router.nest("/minecraft", minecraft::router(servers.clone()));
    }
    if (dotenv!("ROLE_EATER_ROUTES_ENABLED") == "True") {
        router = router.nest("/role-eater", role_eater::router());
    }

    let app = NormalizePathLayer::trim_trailing_slash().layer(
        router
            .route("/", get(generate_index()))
            .nest("/api", api::router())
            .nest_service("/favicon.ico", ServeFile::new(favicon_path))
            .nest_service("/static", ServeDir::new(assets_path))
            .nest_service("/static/vault", ServeDir::new(vault_path))
            .fallback(status_404_handler())
            .with_state(state),
    );

    let address = format!("127.0.0.1:{}", port);
    let listener = tokio::net::TcpListener::bind(address).await.unwrap();
    println!("listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, ServiceExt::<Request>::into_make_service(app))
        .await
        .unwrap();
}

pub fn generate_index() -> Markup {
    root::main(
        vec![head::main()],
        vec![
            root::nav(),
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

#[cfg(debug_assertions)]
fn debug_fn() {
    use glob::glob;
    use grass;
    use std::fs;

    for entry in glob(format!("{}**/*.scss", dotenv!("CSS_PATH")).as_str())
        .expect("Failed to read glob pattern")
    {
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
}
