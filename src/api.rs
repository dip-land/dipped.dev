use crate::{
    AppState, minecraft::api as minecraft_api, role_eater::api as role_eater_api,
    templates::status::status_403_handler,
};
use axum::Router;

pub fn router() -> Router<AppState> {
    Router::<AppState>::new()
        .nest("/minecraft", minecraft_api::router())
        .nest("/role-eater", role_eater_api::router())
        .fallback(status_403_handler())
}
