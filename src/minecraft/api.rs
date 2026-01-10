use crate::{
    AppState,
    templates::status::{error_404_handler, status_403_handler, status_404_handler},
};
use axum::{
    Json, Router,
    body::{self, Body},
    extract::{Path, Query, State},
    http::{Response, StatusCode, header},
    response::{Html, IntoResponse},
    routing::get,
};
use chrono::NaiveDate;
use maud::Markup;
use reqwest;
use serde::{Deserialize, Serialize};
use std::fs::read_dir;
use std::path::Path as std_path;
use tokio::{fs::File, io::AsyncReadExt};
use tokio_util::io::ReaderStream;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/servers", get(servers_route_handler))
        .route("/servers/{server}", get(server_route_handler))
        // TODO: add server stats route handler
        .route("/servers/{server}/stats", get(server_route_handler))
        .route("/icons/{server}", get(server_icon_route_handler))
        .route("/maps/{server}", get(server_map_route_handler))
        .route("/worlds/{server}", get(server_world_route_handler))
        .fallback(status_403_handler())
}

async fn servers_route_handler(
    State(state): State<AppState>,
    _sorting_options: Query<SortingOptions>,
) -> Result<Json<Vec<ServerData>>, (StatusCode, Html<String>)> {
    let servers = state.minecraft_servers.lock().await;
    let servers = servers.clone();
    let data: Vec<ServerData> = servers
        .iter()
        .map(|server| ServerData {
            id: server.clone().id,
            status: server.clone().status,
            online: server.clone().online,
            version: server.clone().version,
            name: server.clone().name,
            identifier: server.clone().identifier,
            start_date: server.clone().start_date,
            end_date: server.clone().end_date,
            install_link: server.clone().install_link,
            view_pack_link: server.clone().view_pack_link,
            players: server.players,
            world_download: server.world_download,
            pack_dowload: server.pack_dowload,
            map_avaliable: server.map_avaliable,
        })
        .collect();
    Ok(Json(data))
}

async fn server_route_handler(
    State(state): State<AppState>,
    Path(identifier): Path<String>,
) -> Result<Json<ServerData>, (StatusCode, Markup)> {
    let servers = state.minecraft_servers.lock().await;
    let servers = servers.clone();
    let server = servers
        .iter()
        .find(|server| server.identifier == identifier);
    if server.is_none() {
        return Err(status_403_handler());
    }

    let server = server.unwrap();

    Ok(Json(ServerData {
        id: server.clone().id,
        status: server.clone().status,
        online: server.clone().online,
        version: server.clone().version,
        name: server.clone().name,
        identifier,
        start_date: server.clone().start_date,
        end_date: server.clone().end_date,
        install_link: server.clone().install_link,
        view_pack_link: server.clone().view_pack_link,
        players: server.players,
        world_download: server.world_download,
        pack_dowload: server.pack_dowload,
        map_avaliable: server.map_avaliable,
    }))
}

async fn server_icon_route_handler(
    State(state): State<AppState>,
    Path(server_id): Path<String>,
) -> Result<Response<Body>, (StatusCode, Markup)> {
    let servers = state.minecraft_servers.lock().await;
    let servers = servers.clone();
    let server = servers.iter().find(|server| server.id == server_id);
    if server.is_none() {
        return Err(status_404_handler());
    }
    let server = server.unwrap();

    let path = std_path::new(&server.path).join("./server-icon-256.png");
    let file = File::open(path).await.map_err(error_404_handler)?;

    let stream = ReaderStream::new(file);
    let body = body::Body::from_stream(stream);

    Ok(Response::builder()
        .header(header::CONTENT_TYPE, "image/png")
        .header(
            header::CONTENT_DISPOSITION,
            "attachment; filename=\"server-icon-256.png\"",
        )
        .body(body)
        .unwrap()
        .into_response())
}

async fn server_map_route_handler(
    State(state): State<AppState>,
    Path(server_id): Path<String>,
) -> Result<Json<Vec<String>>, (StatusCode, Markup)> {
    let servers = state.minecraft_servers.lock().await;
    let servers = servers.clone();
    let server = servers.iter().find(|server| server.id == server_id);
    if server.is_none() {
        return Err(status_404_handler());
    }
    let server = server.unwrap();

    if server.map_avaliable == false {
        return Err(status_404_handler());
    }

    let paths = match read_dir(std_path::new(&server.path).join("./map")) {
        Ok(paths) => paths
            .map(|dir| {
                dir.unwrap()
                    .path()
                    .file_stem()
                    .unwrap()
                    .to_str()
                    .unwrap()
                    .to_string()
                    .replace("-", ":")
            })
            .collect::<Vec<_>>(),
        Err(_) => return Err(status_404_handler()),
    };

    Ok(Json(paths))
}

async fn server_world_route_handler(
    State(state): State<AppState>,
    Path(server_id): Path<String>,
) -> Result<Response<Body>, (StatusCode, Markup)> {
    let servers = state.minecraft_servers.lock().await;
    let servers = servers.clone();
    let server = servers.iter().find(|server| server.id == server_id);
    if server.is_none() {
        return Err(status_404_handler());
    }
    let server = server.unwrap();

    let path = std_path::new(&server.path).join("./world.zip");
    let file = File::open(path).await.map_err(error_404_handler)?;

    let stream = ReaderStream::new(file);
    let body = body::Body::from_stream(stream);

    Ok(Response::builder()
        .header(header::CONTENT_TYPE, "application/zip")
        .header(
            header::CONTENT_DISPOSITION,
            &format!("attachment; filename=\"{}_world.zip\"", server.identifier),
        )
        .body(body)
        .unwrap()
        .into_response())
}

pub async fn get_servers() -> Vec<Server> {
    let client = reqwest::Client::new();
    let res = client
        .get(format!(
            "http://{}:{}/api/v2/servers",
            dotenv!("INTERNAL_IP"),
            dotenv!("MCSS_PORT")
        ))
        .header("apiKey", dotenv!("MCSS_KEY"))
        .send()
        .await
        .unwrap();

    let mcss_servers = match res.json::<Vec<McssServer>>().await {
        Ok(v) => v,
        Err(err) => {
            println!("{:?}", err);
            Vec::new()
        }
    };

    let mut parsed_servers: Vec<Server> = Vec::new();
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
        let web_config = serde_json::from_str::<WebConfig>(web_config_contents.as_str()).unwrap();

        let mut server_link_type = "curseforge";
        if web_config.pack.url.contains("modrinth") {
            server_link_type = "modrinth";
        }
        let mut install_link = web_config.pack.download;
        if server_link_type == "curseforge" {
            install_link = install_link
                .replace("PACKID", &web_config.pack.id.as_str())
                .replace("FILEID", &web_config.pack.file_id.as_str())
        }

        let world_download = std_path::new(&server.path_to_folder)
            .join("./world.zip")
            .exists();
        let pack_dowload = std_path::new(&server.path_to_folder)
            .join("./pack.zip")
            .exists();
        let map_avaliable = std_path::new(&server.path_to_folder).join("./map").exists();
        parsed_servers.push(Server {
            id: server.server_id,
            status: ServerStatus::Current,
            online: ServerOnlineStatus::Offline,
            version: web_config.pack.version,
            name: server.name,
            identifier: server.folder_name,
            start_date: web_config.server.start,
            end_date: web_config.server.end,
            install_link: install_link,
            view_pack_link: web_config.pack.url,
            players: Some(0),
            path: server.path_to_folder,
            world_download,
            pack_dowload,
            map_avaliable,
        });
    }
    for server_dir in read_dir(dotenv!("ARCHIVED_SERVERS_PATH")).unwrap() {
        if server_dir.is_err() {
            continue;
        } else {
            let server_dir = server_dir.unwrap();
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
                serde_json::from_str::<McssServerConfig>(mcss_config_contents.as_str()).unwrap();

            let mut web_config_contents = String::new();
            web_config
                .read_to_string(&mut web_config_contents)
                .await
                .unwrap();
            let web_config =
                serde_json::from_str::<WebConfig>(web_config_contents.as_str()).unwrap();

            let mut status = ServerStatus::Archived;
            if std_path::new(&server_dir.path()).join("./mods").exists() == false {
                status = ServerStatus::Deleted
            }

            let mut server_link_type = "curseforge";
            if web_config.pack.url.contains("modrinth") {
                server_link_type = "modrinth";
            }
            let mut install_link = web_config.pack.download;
            if server_link_type == "curseforge" {
                install_link = install_link
                    .replace("PACKID", &web_config.pack.id.as_str())
                    .replace("FILEID", &web_config.pack.file_id.as_str())
            }

            let world_download = std_path::new(&server_dir.path())
                .join("./world.zip")
                .exists();
            let pack_dowload = std_path::new(&server_dir.path())
                .join("./pack.zip")
                .exists();
            let map_avaliable = std_path::new(&server_dir.path()).join("./map").exists();
            parsed_servers.push(Server {
                id: mcss_config.guid,
                status: status,
                online: ServerOnlineStatus::Offline,
                version: web_config.pack.version,
                name: mcss_config.name,
                identifier: server_dir.file_name().into_string().unwrap(),
                start_date: web_config.server.start,
                end_date: web_config.server.end,
                install_link: install_link,
                view_pack_link: web_config.pack.url,
                players: Some(0),
                path: server_dir.path().to_str().unwrap().to_string(),
                world_download,
                pack_dowload,
                map_avaliable,
            });
        }
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
    return parsed_servers;
}

pub async fn get_server_stats(id: String) -> McssServerStats {
    let client = reqwest::Client::new();
    let res = client
        .get(format!(
            "http://{}:{}/api/v2/servers/{}/stats",
            dotenv!("INTERNAL_IP"),
            dotenv!("MCSS_PORT"),
            id
        ))
        .header("apiKey", dotenv!("MCSS_KEY"))
        .send()
        .await
        .unwrap();
    res.json::<McssServerStats>().await.unwrap()
}

#[derive(Serialize, Deserialize, Copy, Clone, Debug, PartialEq, PartialOrd, Eq)]
pub enum ServerStatus {
    Deleted,
    Current,
    Archived,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, PartialOrd, Eq)]
pub enum ServerOnlineStatus {
    Offline,
    Online,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum ServerSortOptions {
    NameAscending,
    NameDescending,
    StartDateAscending,
    StartDateDescending,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum ServerFilterOptions {
    All,
    Current,
    Archived,
    Deleted,
}

#[derive(Deserialize, Clone)]
pub struct SortingOptions {
    // None, all, current, archived
    pub filter: Option<String>,
    // None, default, asc, desc
    pub sort: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct McssServer {
    pub server_id: String,
    pub status: i32,
    pub name: String,
    pub description: String,
    pub path_to_folder: String,
    pub folder_name: String,
    #[serde(rename = "type", alias = "type")]
    pub server_type: String,
    pub creation_date: String,
    pub is_set_to_auto_start: bool,
    pub force_save_on_stop: bool,
    pub keep_online: i32,
    pub java_allocated_memory: i64,
    pub java_startup_line: String,
    pub server_permissions: Vec<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct McssServerStats {
    pub latest: McssServerStatsLatest,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct McssServerStatsLatest {
    pub cpu: Option<u8>,
    pub memory_used: Option<i32>,
    pub memory_limit: Option<i32>,
    pub players_online: Option<u8>,
    pub player_limit: Option<u8>,
    pub start_date: Option<i32>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct WebConfig {
    pub pack: WebConfigPack,
    pub server: ServerDates,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct WebConfigPack {
    pub id: String,
    #[serde(rename = "fileId")]
    pub file_id: String,
    pub version: String,
    pub download: String,
    pub url: String,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, PartialOrd, Eq)]
pub struct ServerDates {
    pub start: String,
    pub end: String,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct McssServerConfig {
    pub guid: String,
    pub server_type_guid: String,
    pub name: String,
    pub description: String,
    pub creation_date: String,
    pub autostart: bool,
    pub force_save_on_stop: bool,
    pub stop_prevention: String,
    pub startup_methode: String,
    pub allocated_memory: i64,
    pub allocated_memory_suffix: String,
    pub startup_line: String,
    pub startup_bat_filename: Option<String>,
    pub server_file_checksum: String,
    pub server_file_version: String,
    pub java_path_override: String,
    pub tasks: McssServerTasks,
    pub backups: McssServerBackups,
    pub sub_servers: Vec<String>,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct McssServerTasks {
    pub scheduled_tasks: Vec<McssServerTask>,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct McssServerTask {
    pub guid: String,
    pub name: String,
    pub player_requirement: String,
    pub timing: McssServerTaskTiming,
    pub job: Option<McssServerTaskJob>,
    pub jobs: Vec<McssServerTaskJob>,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct McssServerTaskTiming {
    pub time: String,
    pub repeat: bool,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct McssServerTaskJob {
    pub commands: Option<Vec<String>>,
    pub delay: Option<i64>,
    pub job_id: String,
    pub enabled: bool,
    pub order: i32,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct McssServerBackups {
    pub backup_templates: Vec<McssServerBackupTemplate>,
    pub backup_history: Vec<McssServerBackupHistory>,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct McssServerBackupTemplate {
    pub identifier: String,
    pub template_name: String,
    pub destination: String,
    pub compression: String,
    pub protocol: String,
    pub previous_status: String,
    pub delete_old_backups: bool,
    pub suspend_server: bool,
    pub last_run: String,
    pub file_blacklist: Vec<String>,
    pub folder_blacklist: Vec<String>,
}

// This is probably not the correct layout of a backup but its better than nothing
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct McssServerBackupHistory {
    pub name: String,
    pub destination: String,
    pub status: String,
    pub protocol: String,
    pub log_message: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Server {
    pub id: String,
    pub status: ServerStatus,
    pub online: ServerOnlineStatus,
    pub version: String,
    pub name: String,
    pub identifier: String,
    pub start_date: String,
    pub end_date: String,
    pub install_link: String,
    pub view_pack_link: String,
    pub players: Option<u8>,
    pub path: String,
    pub world_download: bool,
    pub pack_dowload: bool,
    pub map_avaliable: bool,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ServerData {
    pub id: String,
    pub status: ServerStatus,
    pub online: ServerOnlineStatus,
    pub version: String,
    pub name: String,
    pub identifier: String,
    pub start_date: String,
    pub end_date: String,
    pub install_link: String,
    pub view_pack_link: String,
    pub players: Option<u8>,
    pub world_download: bool,
    pub pack_dowload: bool,
    pub map_avaliable: bool,
}
