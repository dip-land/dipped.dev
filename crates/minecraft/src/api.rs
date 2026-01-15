use app_state::{AppState, ServerData, SortingOptions};
use axum::{
    Json, Router,
    body::{self, Body},
    extract::{Path, Query, State},
    http::{Response, StatusCode, header},
    response::{Html, IntoResponse},
    routing::get,
};
use maud::Markup;
use std::fs::read_dir;
use std::path::Path as std_path;
use templates::status::{error_404_handler, status_403_handler, status_404_handler};
use tokio::fs::File;
use tokio_util::io::ReaderStream;

// use crate::{
//     McssServer, McssServerBackupHistory, McssServerBackupTemplate, McssServerBackups,
//     McssServerConfig, McssServerStats, McssServerStatsLatest, McssServerTaskJob,
//     McssServerTaskTiming, McssServerTasks, Server, ServerData, ServerDates, ServerFilterOptions,
//     ServerOnlineStatus, ServerSortOptions, ServerStatus, SortingOptions, WebConfig, WebConfigPack,
// };

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
            pack_download: server.pack_download,
            map_available: server.map_available,
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
        pack_download: server.pack_download,
        map_available: server.map_available,
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

    if !server.map_available {
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
            format!("attachment; filename=\"{}_world.zip\"", server.identifier),
        )
        .body(body)
        .unwrap()
        .into_response())
}
