use axum::{routing::get, Router};
use crate::{status_404_handler, utilities::create_page};

pub mod api;
mod dashboard;

pub async fn router() -> Router {
    Router::new()
        .route("/", get(create_page(
            &["html/head.html", "html/role_eater/head.html"], 
            &["html/nav.html", "html/role_eater/index.html"], None).await))
        .nest("/dashboard", dashboard::router().await)
        .fallback(status_404_handler)
}
