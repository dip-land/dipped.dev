use axum::{response::{Html, IntoResponse}, routing::get, Router, http::StatusCode};
use std::path::Path;
use tokio::fs::File;
use tokio::io::{self, AsyncReadExt};
use tower_http::services::{ServeDir, ServeFile};

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/", get(create_page(&["html/head.html"], &["html/nav.html", "html/index.html"]).await))
        .nest_service("/favicon.ico", ServeFile::new("assets/media/images/favicon.ico"))
        .nest_service("/static", ServeDir::new("assets"))
        .fallback(notfound_handler);
    

    let listener = tokio::net::TcpListener::bind("127.0.0.1:6570").await.unwrap();
    println!("listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}

async fn notfound_handler() -> impl IntoResponse {
    (StatusCode::NOT_FOUND, create_page(&["html/head.html"], &["html/nav.html", "html/404.html"]).await)
}

async fn create_page(head_files: &[&str], body_files: &[&str]) -> Html<String> {
    let head_data = combine_files(head_files).await;
    let body_data = combine_files(body_files).await;
    return Html(format!("<html>\n<head>\n{head_data}</head>\n<body>\n{body_data}</body>\n</html>"))
}

async fn combine_files(paths: &[&str]) -> String {
    let mut data = vec!["".to_string(); paths.len()];
    for path in paths {
        data.push(read_file(path).await.unwrap_or_else(|_| {"<h1>Error loading HTML file</h1>".to_string()}))
    }
    return data.join(" ");
}

async fn read_file<P: AsRef<Path>>(path: P) -> io::Result<String> {
    let mut file = File::open(path).await?;
    let mut contents = String::new();
    file.read_to_string(&mut contents).await?;
    Ok(contents)
}