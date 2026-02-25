use axum::{Router, ServiceExt, extract::Request};
use chrono::NaiveDate;
use dotenvy::{dotenv, var};
use futures::future::join_all;
use std::fs::read_dir;
use std::path::Path as std_path;
use std::{env, path::Path, sync::Arc};
use templates::default_nav;
use templates::status::status_404_handler;
use tokio::sync::Mutex;
use tokio::{fs::File, io::AsyncReadExt};
use tower::layer::Layer;
use tower_http::{
    normalize_path::NormalizePathLayer,
    services::{ServeDir, ServeFile},
};

pub mod api;
pub mod dashboard;
pub mod structs;

#[derive(Clone)]
pub struct AppState {
    pub servers: Arc<Mutex<Vec<structs::Server>>>,
}

#[tokio::main]
async fn main() {
    dotenv().ok();

    let args: Vec<String> = env::args().collect();
    let port = var("MINECRAFT_WEB_PORT").unwrap();
    let mut port = port.as_str();

    if args.len() >= 3 {
        port = args[2].as_str();
    }

    #[cfg(debug_assertions)]
    debug_fn();

    let servers = join_all(get_servers().await.iter().map(|server| async {
        let mut server_online_status = structs::ServerOnlineStatus::Offline;
        let mut player_count = 0;
        if let structs::ServerStatus::Current = server.status {
            let server_stats = get_server_stats(server.clone().id).await;
            player_count = server_stats.latest.players_online.unwrap();
            server_online_status = structs::ServerOnlineStatus::Online;
        }

        structs::Server {
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

    let state = AppState {
        servers: Arc::new(Mutex::new(servers.clone())),
    };

    let shared_assets_path = &var("SHARED_ASSETS_PATH").unwrap();
    let assets_path = &var("MINECRAFT_ASSETS_PATH").unwrap();

    let shared_assets_path = Path::new(shared_assets_path);
    let assets_path = Path::new(assets_path);
    let favicon_path = &shared_assets_path.join("media/images/favicon.ico");

    let favicon_service = ServeFile::new(favicon_path);
    let shared_asset_service = ServeDir::new(shared_assets_path);
    let asset_service = ServeDir::new(assets_path);

    let app = NormalizePathLayer::trim_trailing_slash().layer(
        Router::<AppState>::new()
            .merge(dashboard::router(servers))
            .nest("/api", api::router())
            .nest_service("/favicon.ico", favicon_service)
            .nest_service("/shared", shared_asset_service)
            .nest_service("/static", asset_service)
            .fallback(status_404_handler(default_nav()))
            .with_state(state),
    );

    let address = format!("127.0.0.1:{}", port);
    let listener = tokio::net::TcpListener::bind(address).await.unwrap();
    println!("listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, ServiceExt::<Request>::into_make_service(app))
        .await
        .unwrap();
}

pub async fn get_servers() -> Vec<structs::Server> {
    let client = reqwest::Client::new();
    let res = client
        .get(format!("http://{}/api/v2/servers", var("MCSS_IP").unwrap(),))
        .header("apiKey", var("MCSS_KEY").unwrap())
        .send()
        .await
        .unwrap();

    let mcss_servers = match res.json::<Vec<structs::McssServer>>().await {
        Ok(v) => v,
        Err(err) => {
            println!("{:?}", err);
            Vec::new()
        }
    };

    let mut parsed_servers: Vec<structs::Server> = Vec::new();
    for server in mcss_servers {
        let web_config =
            File::open(std_path::new(&server.path_to_folder).join("./webConfig.json")).await;
        if web_config.is_err() {
            continue;
        }

        let mut web_config = web_config.unwrap();

        let mut web_config_contents = String::new();
        web_config
            .read_to_string(&mut web_config_contents)
            .await
            .unwrap();
        let web_config =
            serde_json::from_str::<structs::WebConfig>(web_config_contents.as_str()).unwrap();

        let mut server_link_type = "curseforge";
        if web_config.pack.url.contains("modrinth") {
            server_link_type = "modrinth";
        }
        let mut install_link = web_config.pack.download;
        if server_link_type == "curseforge" {
            install_link = install_link
                .replace("PACKID", web_config.pack.id.as_str())
                .replace("FILEID", web_config.pack.file_id.as_str())
        }

        let world_download = std_path::new(&server.path_to_folder)
            .join("./world.zip")
            .exists();
        let pack_download = std_path::new(&server.path_to_folder)
            .join("./pack.zip")
            .exists();
        let map_available = std_path::new(&server.path_to_folder).join("./map").exists();
        parsed_servers.push(structs::Server {
            id: server.server_id,
            status: structs::ServerStatus::Current,
            online: structs::ServerOnlineStatus::Offline,
            version: web_config.pack.version,
            name: server.name,
            identifier: server.folder_name,
            start_date: web_config.server.start,
            end_date: web_config.server.end,
            install_link,
            view_pack_link: web_config.pack.url,
            players: Some(0),
            path: server.path_to_folder,
            world_download,
            pack_download,
            map_available,
        });
    }
    for server_dir in read_dir(var("ARCHIVED_SERVERS_PATH").unwrap())
        .unwrap()
        .flatten()
    {
        let mcss_config_path = &server_dir.path().join("./mcss_server_config.json");
        let web_config_path = &server_dir.path().join("./webConfig.json");
        let mcss_config = File::open(mcss_config_path).await;
        let web_config = File::open(web_config_path).await;
        if mcss_config.is_err() || web_config.is_err() {
            continue;
        }

        let mut mcss_config = mcss_config.unwrap();
        let mut web_config = web_config.unwrap();

        let mut mcss_config_contents = String::new();
        mcss_config
            .read_to_string(&mut mcss_config_contents)
            .await
            .unwrap();
        let mcss_config =
            serde_json::from_str::<structs::McssServerConfig>(mcss_config_contents.as_str())
                .unwrap();

        let mut web_config_contents = String::new();
        web_config
            .read_to_string(&mut web_config_contents)
            .await
            .unwrap();
        let web_config =
            serde_json::from_str::<structs::WebConfig>(web_config_contents.as_str()).unwrap();

        let mut status = structs::ServerStatus::Archived;
        if !std_path::new(&server_dir.path()).join("./mods").exists() {
            status = structs::ServerStatus::Deleted
        }

        let mut server_link_type = "curseforge";
        if web_config.pack.url.contains("modrinth") {
            server_link_type = "modrinth";
        }
        let mut install_link = web_config.pack.download;
        if server_link_type == "curseforge" {
            install_link = install_link
                .replace("PACKID", web_config.pack.id.as_str())
                .replace("FILEID", web_config.pack.file_id.as_str())
        }

        let world_download = std_path::new(&server_dir.path())
            .join("./world.zip")
            .exists();
        let pack_download = std_path::new(&server_dir.path())
            .join("./pack.zip")
            .exists();
        let map_available = std_path::new(&server_dir.path()).join("./map").exists();
        parsed_servers.push(structs::Server {
            id: mcss_config.guid,
            status,
            online: structs::ServerOnlineStatus::Offline,
            version: web_config.pack.version,
            name: mcss_config.name,
            identifier: server_dir.file_name().into_string().unwrap(),
            start_date: web_config.server.start,
            end_date: web_config.server.end,
            install_link,
            view_pack_link: web_config.pack.url,
            players: Some(0),
            path: server_dir.path().to_str().unwrap().to_string(),
            world_download,
            pack_download,
            map_available,
        });
    }
    parsed_servers.sort_by(|a, b| {
        let a_values: Vec<u32> = a
            .start_date
            .split("/")
            .map(|v| v.parse::<u32>().unwrap())
            .collect();
        let a_date = NaiveDate::from_ymd_opt(a_values[2] as i32, a_values[0], a_values[1]).unwrap();
        let b_values: Vec<u32> = b
            .start_date
            .split("/")
            .map(|v| v.parse::<u32>().unwrap())
            .collect();
        let b_date = NaiveDate::from_ymd_opt(b_values[2] as i32, b_values[0], b_values[1]).unwrap();
        b_date.cmp(&a_date)
    });
    parsed_servers
}

pub async fn get_server_stats(id: String) -> structs::McssServerStats {
    let client = reqwest::Client::new();
    let res = client
        .get(format!(
            "http://{}/api/v2/servers/{}/stats",
            var("MCSS_IP").unwrap(),
            id
        ))
        .header("apiKey", var("MCSS_KEY").unwrap())
        .send()
        .await
        .unwrap();
    res.json::<structs::McssServerStats>().await.unwrap()
}

#[cfg(debug_assertions)]
fn debug_fn() {
    use glob::glob;
    use grass;
    use std::{fs, path::PathBuf};

    let shared_assets = glob(format!("{}/**/*.scss", var("SHARED_ASSETS_PATH").unwrap()).as_str())
        .unwrap()
        .filter_map(Result::ok);
    let assets = glob(format!("{}/**/*.scss", var("MINECRAFT_ASSETS_PATH").unwrap()).as_str())
        .unwrap()
        .filter_map(Result::ok);

    let shared_assets: Vec<PathBuf> = shared_assets.collect();
    let assets: Vec<PathBuf> = assets.collect();

    let all_assets = [&shared_assets[..], &assets[..]].concat();

    for path in all_assets {
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
}
