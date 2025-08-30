use std::{fs::read_dir, path };
use axum::{extract::{Path, Query}, http::HeaderMap, response::IntoResponse, routing::get, Router};
use tower_http::services::ServeDir;
use crate::{minecraft::api::{get_minecraft_servers, SortingOptions, get_minecraft_server}, status_404_handler, utilities::{create_page, PageTemplate, PageTemplatePosition}};
use askama::Template;

pub mod api;

pub async fn router() -> Router {
    let servers_path = dotenv!("SERVERS_PATH");

    let mut router = Router::new()
        .route("/", get(servers_page_handler))
        .route("/{name}", get(server_page_handler));

    let paths = read_dir(format!("{}", servers_path)).unwrap().map(|dir| dir.unwrap().path())
        .collect::<Vec<_>>();

    for dir_path in paths {
        let path_string = dir_path.to_str().unwrap();
        if path::Path::new(path_string).exists() {
            let identifier = dir_path.file_stem().unwrap().to_str().unwrap();
            router = router
                .nest_service(format!("/maps/{identifier}").as_str(), ServeDir::new(format!("{path_string}/map")))
                .fallback(status_404_handler);
        }
    }

    router.fallback(status_404_handler)
}

async fn servers_page_handler(sorting_options: Query<SortingOptions>) -> impl IntoResponse {
    let servers = get_minecraft_servers(sorting_options).await;
    let server_templates = servers.iter().map(|server| {
        let server = server.clone();
        let mut status = "current";
        if server.status == 0 {
            status = "deleted"
        }
        if server.status == 2 {
            status = "archived"
        }
        HomeServerHtmlTemplate {
            identifier: server.identifier,
            server_name: server.name,
            server_id: server.id,
            server_status: status.to_string()
        }.to_string()
    }).collect::<Vec<_>>();
    let main_template = ServersTemplate {
        server_templates: server_templates.join(""), 
    }.to_string();
    
    create_page(
        &["html/head.html", "html/minecraft/head.html"], 
        &["html/nav.html"],
        Some(&[
            PageTemplate {
                pos: PageTemplatePosition::BodyAppend,
                template: main_template
            },
        ])
    ).await
}

async fn server_page_handler(Path(server): Path<String>, headers: HeaderMap) -> impl IntoResponse {
    let mut ip: String = "localhost".to_string();
    if headers.get("cf-connecting-ip").is_some_and(|value| value != "null") {
        ip = headers.get("cf-connecting-ip").unwrap().to_str().unwrap().to_string()
    }

    let server_data = get_minecraft_server(server, Vec::new(), ip).await;

    if server_data.id == "" {
        return status_404_handler().await.into_response()
    }

    let mut players = "0".to_string();
    if server_data.players.is_some() {
        players = server_data.players.unwrap().to_string();
    }

    let mut status = "Deleted";
    let mut status_color = "red";
    if server_data.status == 1 {
        if server_data.online { 
            status = "Online";
            status_color = "green";
        } else {
            status = "Offline";
        }
    }
    if server_data.status == 2 { 
        status = "Archived"; 
        status_color = "orange";
        players = "0".to_string()
    }

    let template = ServerTemplate {
        pack_icon: format!("/api/minecraft/icons/{}", server_data.id), 
        pack_name: server_data.name,
        pack_version: server_data.version,
        server_status: status.to_string(),
        status_color: status_color.to_string(),
        player_count: players,
        server_ip: "".to_string(),
        server_start_date: server_data.server_dates.start,
        server_end_date: server_data.server_dates.end,
        pack_download_link: server_data.link.url,
        world_download_link: format!("/api/minecraft/worlds/{}", server_data.id).to_string(), 
        additional_sections: MapTemplate {}.to_string()
    }.to_string();
    
    create_page(
        &["html/head.html", "html/minecraft/server/head.html"], 
        &["html/nav.html"],
        Some(&[
            PageTemplate {
                pos: PageTemplatePosition::BodyAppend,
                template: template
            },
        ])
    ).await.into_response()
}

#[derive(Template)]
#[template(path = "../html/minecraft/index.html", escape = "none")]
struct ServersTemplate {
    server_templates: String,
}

#[derive(Template)]
#[template(path = "../html/minecraft/serverCardTemplate.html")]
struct HomeServerHtmlTemplate {
    identifier: String,
    server_id: String,
    server_name: String,
    server_status: String
}

#[derive(Template)]
#[template(path = "../html/minecraft/server/index.html", escape = "none")]
struct ServerTemplate {
    pack_icon: String,
    pack_name: String,
    pack_version: String,
    server_status: String,
    status_color: String,
    player_count: String,
    server_ip: String,
    server_start_date: String,
    server_end_date: String,
    pack_download_link: String,
    world_download_link: String,
    additional_sections: String
}

#[derive(Template)]
#[template(path = "../html/minecraft/server/map.html")]
struct MapTemplate {}
