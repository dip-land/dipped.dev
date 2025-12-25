use crate::{status_403_handler, status_404_handler};
use axum::{
    Json, Router, body,
    extract::{Path, Query},
    http::{Response, header},
    response::IntoResponse,
    routing::get,
};
use deadpool_diesel::postgres::Pool;
use reqwest;
use serde::{Deserialize, Serialize};
use std::cmp::Ordering;
use std::fs::read_dir;
use tokio::{
    fs::{File, metadata},
    io::AsyncReadExt,
    join,
};
use tokio_util::io::ReaderStream;

pub fn router() -> Router<(Pool, Pool)> {
    Router::new()
        .route("/servers", get(servers_route_handler))
        .route("/servers/{server}", get(server_route_handler))
        .route("/icons/{server}", get(server_icon_route_handler))
        .route("/maps/{server}", get(server_map_route_handler))
        .route("/worlds/{server}", get(server_world_route_handler))
        .fallback(status_403_handler)
}

async fn servers_route_handler(sorting_options: Query<SortingOptions>) -> impl IntoResponse {
    Json(get_minecraft_servers(sorting_options).await)
}

async fn server_route_handler(
    Path(identifier): Path<String>,
    headers: header::HeaderMap,
) -> impl IntoResponse {
    let mut guilds: Vec<String> = Vec::new();
    if headers.get("guilds").is_some_and(|value| value != "null") {
        guilds =
            serde_json::from_str::<Vec<String>>(headers.get("guilds").unwrap().to_str().unwrap())
                .unwrap()
    }
    let mut ip: String = "localhost".to_string();
    if headers
        .get("cf-connecting-ip")
        .is_some_and(|value| value != "null")
    {
        ip = headers
            .get("cf-connecting-ip")
            .unwrap()
            .to_str()
            .unwrap()
            .to_string()
    }

    let server = get_minecraft_server(identifier, guilds, ip).await;
    if server.id == "" {
        return status_403_handler().await.into_response();
    }

    Json(server).into_response()
}

async fn server_icon_route_handler(Path(server_id): Path<String>) -> impl IntoResponse {
    let client = reqwest::Client::new();
    let req = client
        .get(format!(
            "http://{}:{}/api/v2/servers",
            dotenv!("INTERNAL_IP"),
            dotenv!("MCSS_PORT")
        ))
        .header("apiKey", dotenv!("MCSS_KEY"))
        .send()
        .await
        .unwrap()
        .json::<Vec<McssServer>>();

    let server = match req.await {
        Ok(server) => match server
            .into_iter()
            .find(|server| server.server_id == server_id)
        {
            Some(server) => server,
            None => return status_404_handler().await.into_response(),
        },
        Err(_) => return status_404_handler().await.into_response(),
    };
    let path = &format!("{}server-icon-256.png", server.path_to_folder);
    let file = match File::open(path).await {
        Ok(file) => file,
        Err(_) => return status_404_handler().await.into_response(),
    };

    let stream = ReaderStream::new(file);
    let body = body::Body::from_stream(stream);

    Response::builder()
        .header(header::CONTENT_TYPE, "image/png")
        .header(
            header::CONTENT_DISPOSITION,
            "attachment; filename=\"server-icon-256.png\"",
        )
        .body(body)
        .unwrap()
        .into_response()
}

async fn server_map_route_handler(Path(server_id): Path<String>) -> impl IntoResponse {
    let client = reqwest::Client::new();
    let req = client
        .get(format!(
            "http://{}:{}/api/v2/servers",
            dotenv!("INTERNAL_IP"),
            dotenv!("MCSS_PORT")
        ))
        .header("apiKey", dotenv!("MCSS_KEY"))
        .send()
        .await
        .unwrap()
        .json::<Vec<McssServer>>();

    let server = match req.await {
        Ok(server) => match server
            .into_iter()
            .find(|server| server.server_id == server_id)
        {
            Some(server) => server,
            None => return status_404_handler().await.into_response(),
        },
        Err(_) => return status_404_handler().await.into_response(),
    };

    let paths = match read_dir(format!("{}map", server.path_to_folder)) {
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
        Err(_) => return status_404_handler().await.into_response(),
    };

    Json(paths).into_response()
}

async fn server_world_route_handler(Path(server_id): Path<String>) -> impl IntoResponse {
    let client = reqwest::Client::new();
    let req = client
        .get(format!(
            "http://{}:{}/api/v2/servers",
            dotenv!("INTERNAL_IP"),
            dotenv!("MCSS_PORT")
        ))
        .header("apiKey", dotenv!("MCSS_KEY"))
        .send()
        .await
        .unwrap()
        .json::<Vec<McssServer>>();

    let server = match req.await {
        Ok(server) => match server
            .into_iter()
            .find(|server| server.server_id == server_id)
        {
            Some(server) => server,
            None => return status_404_handler().await.into_response(),
        },
        Err(_) => return status_404_handler().await.into_response(),
    };

    let path = &format!("{}world.zip", server.path_to_folder);
    let file = match File::open(path).await {
        Ok(file) => file,
        Err(_) => return status_404_handler().await.into_response(),
    };

    let stream = ReaderStream::new(file);
    let body = body::Body::from_stream(stream);

    Response::builder()
        .header(header::CONTENT_TYPE, "application/zip")
        .header(
            header::CONTENT_DISPOSITION,
            &format!("attachment; filename=\"{}_world.zip\"", server.folder_name),
        )
        .body(body)
        .unwrap()
        .into_response()
}

pub async fn get_minecraft_servers(sorting_options: Query<SortingOptions>) -> Vec<ServerData> {
    let client = reqwest::Client::new();
    let req = client
        .get(format!(
            "http://{}:{}/api/v2/servers",
            dotenv!("INTERNAL_IP"),
            dotenv!("MCSS_PORT")
        ))
        .header("apiKey", dotenv!("MCSS_KEY"))
        .send()
        .await
        .unwrap()
        .json::<Vec<McssServer>>();
    let servers = req
        .await
        .unwrap()
        .into_iter()
        .map(server_mapper)
        .collect::<Vec<_>>();
    let mut awaited_servers: Vec<ServerData> = Vec::new();
    for server in servers {
        awaited_servers.push(server.await);
    }
    // Sort
    if sorting_options
        .sort
        .as_deref()
        .is_some_and(|sort| sort == "asc")
    {
        awaited_servers.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    }
    if sorting_options
        .sort
        .as_deref()
        .is_some_and(|sort| sort == "desc")
    {
        awaited_servers.sort_by(|a, b| b.name.to_lowercase().cmp(&a.name.to_lowercase()));
    }
    if sorting_options.sort.as_deref().is_none()
        || sorting_options
            .sort
            .as_deref()
            .is_some_and(|sort| sort == "default" || sort == "na")
    {
        awaited_servers.sort_by(|a, b| a.cmp(b));
    }
    // Filter
    if sorting_options
        .filter
        .as_deref()
        .is_some_and(|filter| filter == "deleted")
    {
        awaited_servers = awaited_servers
            .into_iter()
            .filter(|server| server.status == 0)
            .collect::<Vec<_>>();
    }
    if sorting_options
        .filter
        .as_deref()
        .is_some_and(|filter| filter == "current")
    {
        awaited_servers = awaited_servers
            .into_iter()
            .filter(|server| server.status == 1)
            .collect::<Vec<_>>();
    }
    if sorting_options
        .filter
        .as_deref()
        .is_some_and(|filter| filter == "archived")
    {
        awaited_servers = awaited_servers
            .into_iter()
            .filter(|server| server.status == 2)
            .collect::<Vec<_>>();
    }
    awaited_servers
}

pub async fn server_mapper(server: McssServer) -> ServerData {
    let mut online = false;
    if server.status == 1 {
        online = true
    }
    let mut server_status = 1; // default is current
    if &server.description == "archived" {
        server_status = 2
    }
    if &server.description == "deleted" {
        server_status = 0
    }

    let file = File::open(format!("{}webConfig.json", server.path_to_folder)).await;
    if file.is_err() {
        return ServerData {
            id: server.server_id,
            status: server_status,
            online: online,
            version: "Invalid".to_string(),
            name: server.name,
            identifier: server.folder_name,
            server_dates: ServerDates {
                start: "Invalid".to_string(),
                end: "Invalid".to_string(),
            },
            link: ServerLink {
                t: "Invalid".to_string(),
                url: "Invalid".to_string(),
            },
        };
    }
    let mut contents = String::new();
    file.unwrap().read_to_string(&mut contents).await.unwrap();
    let web_config = serde_json::from_str::<WebConfig>(contents.as_str()).unwrap();
    let mut link_type = "curseforge";
    if web_config.pack.url.contains("modrinth") {
        link_type = "modrinth"
    }
    let mut link = web_config.pack.url;
    if link_type == "curseforge" {
        link = format!(
            "curseforge://install?addonId={}&fileId={}/",
            web_config.pack.id, web_config.pack.file_id
        )
    }

    ServerData {
        id: server.server_id,
        status: server_status,
        online: online,
        version: web_config.pack.version,
        name: server.name,
        identifier: server.folder_name,
        server_dates: web_config.server,
        link: ServerLink {
            t: link_type.to_string(),
            url: link,
        },
    }
}

pub async fn get_minecraft_server(
    identifier: String,
    guilds: Vec<String>,
    ip: String,
) -> ExtendedServerData {
    let servers = get_minecraft_servers(Query(SortingOptions {
        filter: None,
        sort: None,
    }))
    .await;
    let server = match servers
        .into_iter()
        .find(|server| server.identifier == identifier)
    {
        Some(server) => server,
        None => {
            return ExtendedServerData {
                id: "".to_string(),
                status: 0,
                online: false,
                version: "".to_string(),
                name: "".to_string(),
                identifier: "".to_string(),
                server_dates: ServerDates {
                    start: "".to_string(),
                    end: "".to_string(),
                },
                link: ServerLink {
                    t: "".to_string(),
                    url: "".to_string(),
                },
                ip: None,
                players: None,
                world_download: None,
                internal_pack_download: None,
            };
        }
    };

    let client = reqwest::Client::new();
    let (server_req, stats_req) = join!(
        client
            .get(format!(
                "http://{}:{}/api/v2/servers/{}",
                dotenv!("INTERNAL_IP"),
                dotenv!("MCSS_PORT"),
                server.id
            ))
            .header("apiKey", dotenv!("MCSS_KEY"))
            .send()
            .await
            .unwrap()
            .json::<McssServer>(),
        client
            .get(format!(
                "http://{}:{}/api/v2/servers/{}/stats",
                dotenv!("INTERNAL_IP"),
                dotenv!("MCSS_PORT"),
                server.id
            ))
            .header("apiKey", dotenv!("MCSS_KEY"))
            .send()
            .await
            .unwrap()
            .json::<McssServerStats>()
    );

    let server_req_clone = server_req.iter().clone().collect::<Vec<_>>();
    let server_req = server_req_clone.first().unwrap();

    let mut parsed_ip: Option<String> = None;
    // if guilds.into_iter().find(|guild| guild == dotenv!("SERVER_ID")).is_some() {
    //     if ip == dotenv!("ORIGIN") || ip == "localhost".to_string() {
    //         parsed_ip = Some(format!("{}:{}", dotenv!("INTERNAL_IP"), server_description.port.unwrap()).to_string())
    //     } else {
    //         parsed_ip = Some(format!("{}:{}", dotenv!("EXTERNAL_IP"), server_description.port.unwrap()).to_string())
    //     }
    // }

    ExtendedServerData {
        id: server.id,
        status: server.status,
        online: server.online,
        version: server.version,
        name: server.name,
        identifier: server.identifier,
        server_dates: server.server_dates,
        link: server.link,
        ip: parsed_ip,
        players: Some(stats_req.unwrap().latest.players_online.unwrap()),
        world_download: Some(
            metadata(format!("{}world.zip", server_req.path_to_folder))
                .await
                .is_ok(),
        ),
        internal_pack_download: Some(
            metadata(format!("{}pack.zip", server_req.path_to_folder))
                .await
                .is_ok(),
        ),
    }
}

#[derive(Deserialize, Clone)]
pub struct SortingOptions {
    // None, all, current, archived
    filter: Option<String>,
    // None, default, asc, desc
    sort: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct McssServer {
    server_id: String,
    status: i32,
    name: String,
    description: String,
    path_to_folder: String,
    folder_name: String,
    #[serde(rename = "type", alias = "type")]
    t: String,
    creation_date: String,
    is_set_to_auto_start: bool,
    force_save_on_stop: bool,
    keep_online: i32,
    java_allocated_memory: i32,
    java_startup_line: String,
    server_permissions: Vec<String>,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct McssServerStats {
    latest: McssServerStatsLatest,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct McssServerStatsLatest {
    cpu: Option<u8>,
    memory_used: Option<i32>,
    memory_limit: Option<i32>,
    players_online: Option<u8>,
    player_limit: Option<u8>,
    start_date: Option<i32>,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, PartialOrd, Eq)]
pub struct ServerData {
    pub id: String,
    pub status: u8,
    online: bool,
    version: String,
    pub name: String,
    pub identifier: String,
    #[serde(rename = "serverDates")]
    server_dates: ServerDates,
    link: ServerLink,
}

impl Ord for ServerData {
    fn cmp(&self, other: &Self) -> Ordering {
        self.status
            .cmp(&other.status)
            .then(self.name.to_lowercase().cmp(&other.name.to_lowercase()))
    }
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, PartialOrd, Eq)]
pub struct ExtendedServerData {
    pub id: String,
    pub status: u8,
    pub online: bool,
    pub version: String,
    pub name: String,
    pub identifier: String,
    #[serde(rename = "serverDates")]
    pub server_dates: ServerDates,
    pub link: ServerLink,
    pub ip: Option<String>,
    pub players: Option<u8>,
    // World download available
    pub world_download: Option<bool>,
    // Curseforge or other external mod loader has pack
    // external_pack_download: bool,
    // internal server has pack
    pub internal_pack_download: Option<bool>,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, PartialOrd, Eq)]
pub struct ServerDates {
    pub start: String,
    pub end: String,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, PartialOrd, Eq)]
pub struct ServerLink {
    #[serde(rename = "type")]
    pub t: String,
    pub url: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct WebConfig {
    pack: WebConfigPack,
    server: ServerDates,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct WebConfigPack {
    id: String,
    #[serde(rename = "fileId")]
    file_id: String,
    version: String,
    download: String,
    url: String,
}
