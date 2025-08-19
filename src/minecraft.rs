use axum::{extract, response::{ IntoResponse}, routing::get, Router};
use crate::{status_404_handler, utilities::{create_page, PageTemplate, PageTemplatePosition}};
use askama::Template;

pub async fn router() -> Router {
    Router::new()
        .route("/", get(create_page(
            &["html/head.html", "html/minecraft/head.html"], 
            &["html/nav.html", "html/minecraft/index.html"],
            None
        ).await))
        .route("/{name}", get(server_page_handler))
        .fallback(status_404_handler)
}

async fn server_page_handler(extract::Path(name): extract::Path<String>) -> impl IntoResponse {
    let template = ServerTemplate {
        pack_icon: "test".to_string(), 
        pack_name: name.to_string(),
        pack_version: "test".to_string(),
        server_status: "test".to_string(),
        player_count: "test".to_string(),
        server_ip: "test".to_string(),
        server_start_date: "test".to_string(),
        server_end_date: "test".to_string(),
        pack_download_link: "test".to_string(),
        world_download_link: "test".to_string(), 
    }.to_string();

    let template2 = ServerTemplate {
        pack_icon: "test".to_string(), 
        pack_name: "template 2".to_string(),
        pack_version: "test".to_string(),
        server_status: "test".to_string(),
        player_count: "test".to_string(),
        server_ip: "test".to_string(),
        server_start_date: "test".to_string(),
        server_end_date: "test".to_string(),
        pack_download_link: "test".to_string(),
        world_download_link: "test".to_string(), 
    }.to_string();

    let template3 = ServerTemplate {
        pack_icon: "test".to_string(), 
        pack_name: "template 3".to_string(),
        pack_version: "test".to_string(),
        server_status: "test".to_string(),
        player_count: "test".to_string(),
        server_ip: "test".to_string(),
        server_start_date: "test".to_string(),
        server_end_date: "test".to_string(),
        pack_download_link: "test".to_string(),
        world_download_link: "test".to_string(), 
    }.to_string();
    let template4 = ServerTemplate {
        pack_icon: "test".to_string(), 
        pack_name: "template 4".to_string(),
        pack_version: "test".to_string(),
        server_status: "test".to_string(),
        player_count: "test".to_string(),
        server_ip: "test".to_string(),
        server_start_date: "test".to_string(),
        server_end_date: "test".to_string(),
        pack_download_link: "test".to_string(),
        world_download_link: "test".to_string(), 
    }.to_string();
    
    create_page(
        &["html/head.html", "html/minecraft/head.html"], 
        &["html/nav.html"],
        Some(&[
            PageTemplate {
                pos: PageTemplatePosition::BodyAppend,
                template: template
            },
            PageTemplate {
                pos: PageTemplatePosition::BodyAppend,
                template: template2
            },
            PageTemplate {
                pos: PageTemplatePosition::BodyPrepend,
                template: template3
            },
            PageTemplate {
                pos: PageTemplatePosition::BodyPrepend,
                template: template4
            }
        ])
    ).await
}

#[derive(Template)]
#[template(path = "../html/minecraft/server.html")]
struct ServerTemplate {
    pack_icon: String,
    pack_name: String,
    pack_version: String,
    server_status: String,
    player_count: String,
    server_ip: String,
    server_start_date: String,
    server_end_date: String,
    pack_download_link: String,
    world_download_link: String,
}

// Notes for me on Modules
// everything in modules is private by default
// add pub in front of everything I want to be public