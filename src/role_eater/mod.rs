use crate::{status_404_handler, utilities::create_page};
use axum::{Router, routing::get};

pub mod api;
mod dashboard;

pub fn router() -> Router {
    Router::new()
        .route(
            "/",
            get(create_page(
                &["html/head.html", "html/role_eater/head.html"],
                &["html/nav.html", "html/role_eater/index.html"],
                None,
            )),
        )
        .nest("/dashboard", dashboard::router())
        .fallback(status_404_handler)
}
