use crate::{
    minecraft::api as minecraft_api, role_eater::api as role_eater_api, status_403_handler,
};
use axum::Router;
use deadpool_diesel::postgres::Pool;

pub fn router() -> Router<(Pool, Pool)> {
    Router::<(Pool, Pool)>::new()
        .nest("/minecraft", minecraft_api::router())
        .nest("/role-eater", role_eater_api::router())
        .fallback(status_403_handler)
}
