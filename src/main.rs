use axum::{response::{IntoResponse}, routing::get, Router, http::StatusCode, ServiceExt, extract::Request};
use tower_http::{normalize_path::NormalizePathLayer, services::{ServeDir, ServeFile}};
use tower::layer::Layer;
use dotenv::dotenv;

mod utilities;
use utilities::{create_page};

// Route Modules
mod api;
mod minecraft;

#[tokio::main]
async fn main() {
     dotenv().ok();

    let app = NormalizePathLayer::trim_trailing_slash().layer(
        Router::new()
        .route("/", get(create_page(&["html/head.html"], &["html/nav.html", "html/index.html"], None).await))
        .nest("/api", api::router().await)
        .nest("/minecraft", minecraft::router().await)
        .nest_service("/favicon.ico", ServeFile::new("assets/media/images/favicon.ico"))
        .nest_service("/static", ServeDir::new("assets"))
        .nest_service("/static/vault", ServeDir::new("private"))
        .fallback(status_404_handler)
    );
    
    let listener = tokio::net::TcpListener::bind("127.0.0.1:6570").await.unwrap();
    println!("listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, ServiceExt::<Request>::into_make_service(app)).await.unwrap();
}

async fn status_403_handler() -> impl IntoResponse {
    (StatusCode::FORBIDDEN, create_page(&["html/head.html"], &["html/nav.html", "html/403.html"], None).await)
}

async fn status_404_handler() -> impl IntoResponse {
    (StatusCode::NOT_FOUND, create_page(&["html/head.html"], &["html/nav.html", "html/404.html"], None).await)
}

// Notes for me on Modules
// everything in modules is private by default
// add pub in front of everything I want to be public