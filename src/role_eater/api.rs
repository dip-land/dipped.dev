use axum::{routing::get, Router};
use crate::{status_403_handler, utilities::create_page};

pub async fn router() -> Router {
    Router::new()
        .route("/servers", get(create_page(&["html/head.html"], &["html/nav.html", "html/index.html"], None).await))
        .route("/{guild_id}", get(create_page(&["html/head.html"], &["html/nav.html", "html/index.html"], None).await))
        .route("/{guild_id}/{user_id}", get(create_page(&["html/head.html"], &["html/nav.html", "html/index.html"], None).await))
        .fallback(status_403_handler)
}
