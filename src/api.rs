use crate::{
    AppState, minecraft::api as minecraft_api, role_eater::api as role_eater_api,
    templates::status::status_403_handler,
};
use axum::Router;

pub fn router() -> Router<AppState> {
    let mut router = Router::<AppState>::new();
    if (dotenv!("MINECRAFT_API_ENABLED") == "True") {
        router = router.nest("/minecraft", minecraft_api::router());
    }
    if (dotenv!("ROLE_EATER_API_ENABLED") == "True") {
        router = router.nest("/role-eater", role_eater_api::router());
    }
    router.fallback(status_403_handler())
}
