use axum::response::Html;
use std::path::Path;
use tokio::{fs::File, io::{self, AsyncReadExt}};

pub async fn create_page(head_files: &[&str], body_files: &[&str]) -> Html<String> {
    let head_data = combine_files(head_files).await;
    let body_data = combine_files(body_files).await;
    Html(format!("<html>\n<head>\n{head_data}</head>\n<body>\n{body_data}</body>\n</html>"))
}

pub async fn combine_files(paths: &[&str]) -> String {
    let mut data = vec!["".to_string(); paths.len()];
    for path in paths {
        data.push(read_file(path).await.unwrap_or_else(|_| {"<h1>Error loading HTML file</h1>".to_string()}))
    }
    data.join(" ")
}

pub async fn read_file<P: AsRef<Path>>(path: P) -> io::Result<String> {
    let mut file = File::open(path).await?;
    let mut contents = String::new();
    file.read_to_string(&mut contents).await?;
    Ok(contents)
}