use axum::{Router};
use crate::{status_403_handler, minecraft::api as minecraft_api, role_eater::api as role_eater_api};

pub async fn router() -> Router {
    Router::new()
        .nest("/minecraft", minecraft_api::router().await)
        .nest("/role-eater", role_eater_api::router().await)
        .fallback(status_403_handler)
}
