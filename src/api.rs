use axum::{routing::get, Router};
use crate::utilities::{create_page};

pub async fn router() -> Router {
    Router::new()
        .route("/", get(create_page(&["html/head.html"], &["html/nav.html", "html/index.html"]).await))
        .route("/test", get(create_page(&["html/head.html"], &["html/nav.html", "html/index.html"]).await))
}

// Notes for me on Modules
// everything in modules is private by default
// add pub in front of everything I want to be public