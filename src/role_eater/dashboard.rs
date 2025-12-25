use crate::{status_404_handler, utilities::create_page};
use axum::{Router, routing::get};

pub fn router() -> Router {
    Router::new()
        .route(
            "/",
            get(create_page(
                &["html/head.html", "html/role_eater/dashboard/head.html"],
                &["html/nav.html", "html/role_eater/dashboard/index.html"],
                None,
            )),
        )
        .route(
            "/{guild_id}",
            get(create_page(
                &[
                    "html/head.html",
                    "html/role_eater/dashboard/guild/head.html",
                ],
                &[
                    "html/nav.html",
                    "html/role_eater/dashboard/guild/index.html",
                ],
                None,
            )),
        )
        .route(
            "/{guild_id}/image",
            get(create_page(
                &[],
                &["html/role_eater/dashboard/guild/image.html"],
                None,
            )),
        )
        .route(
            "/{guild_id}/{user_id}",
            get(create_page(
                &["html/head.html", "html/role_eater/dashboard/user/head.html"],
                &["html/nav.html", "html/role_eater/dashboard/user/index.html"],
                None,
            )),
        )
        .route(
            "/{guild_id}/{user_id}/image",
            get(create_page(
                &[],
                &["html/role_eater/dashboard/user/image/index.html"],
                None,
            )),
        )
        .route(
            "/{guild_id}/{user_id}/chart",
            get(create_page(
                &[],
                &["html/role_eater/dashboard/user/image/chart.html"],
                None,
            )),
        )
        .fallback(status_404_handler)
}
