use axum::{Router, ServiceExt, extract::Request, http::StatusCode, response::Html, routing::get};
use dotenv::dotenv;
use tower::layer::Layer;
use tower_http::{
    normalize_path::NormalizePathLayer,
    services::{ServeDir, ServeFile},
};
#[macro_use]
extern crate dotenv_codegen;

pub mod models;
pub mod schema;
pub mod utilities;
use utilities::create_page;

// Route Modules
pub mod api;
pub mod minecraft;
pub mod role_eater;

#[tokio::main]
async fn main() {
    dotenv().ok();

    let guild_manager = deadpool_diesel::postgres::Manager::new(
        format!(
            "postgresql://{}:{}@localhost/role_eater?options=-csearch_path%3D{}",
            dotenv!("PG_USER"),
            dotenv!("PG_PASSWORD"),
            "guilds"
        )
        .as_str(),
        deadpool_diesel::Runtime::Tokio1,
    );
    let guild_pool = deadpool_diesel::postgres::Pool::builder(guild_manager)
        .build()
        .unwrap();

    let user_manager = deadpool_diesel::postgres::Manager::new(
        format!(
            "postgresql://{}:{}@localhost/role_eater?options=-csearch_path%3D{}",
            dotenv!("PG_USER"),
            dotenv!("PG_PASSWORD"),
            "users"
        )
        .as_str(),
        deadpool_diesel::Runtime::Tokio1,
    );
    let user_pool = deadpool_diesel::postgres::Pool::builder(user_manager)
        .build()
        .unwrap();

    let app = NormalizePathLayer::trim_trailing_slash().layer(
        Router::new()
            .route(
                "/",
                get(create_page(
                    &["html/head.html"],
                    &["html/nav.html", "html/index.html"],
                    None,
                )),
            )
            .nest("/api", api::router().with_state((guild_pool, user_pool)))
            .nest("/minecraft", minecraft::router())
            .nest("/role-eater", role_eater::router())
            .nest_service(
                "/favicon.ico",
                ServeFile::new("assets/media/images/favicon.ico"),
            )
            .nest_service("/static", ServeDir::new("assets"))
            .nest_service("/static/vault", ServeDir::new("private"))
            .fallback(status_404_handler),
    );

    let listener = tokio::net::TcpListener::bind("127.0.0.1:6570")
        .await
        .unwrap();
    println!("listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, ServiceExt::<Request>::into_make_service(app))
        .await
        .unwrap();
}

pub async fn status_403_handler() -> (StatusCode, Html<String>) {
    (
        StatusCode::FORBIDDEN,
        create_page(
            &["html/head.html"],
            &["html/nav.html", "html/status_codes/403.html"],
            None,
        ),
    )
}

pub async fn status_404_handler() -> (StatusCode, Html<String>) {
    (
        StatusCode::NOT_FOUND,
        create_page(
            &["html/head.html"],
            &["html/nav.html", "html/status_codes/404.html"],
            None,
        ),
    )
}

pub async fn status_500_handler() -> (StatusCode, Html<String>) {
    (
        StatusCode::INTERNAL_SERVER_ERROR,
        create_page(
            &["html/head.html"],
            &["html/nav.html", "html/status_codes/500.html"],
            None,
        ),
    )
}

pub fn status_403_error<E>(err: E) -> (StatusCode, Html<String>)
where
    E: std::error::Error,
{
    eprintln!("{:?}", err.to_string());
    (
        StatusCode::FORBIDDEN,
        create_page(
            &["html/head.html"],
            &["html/nav.html", "html/status_codes/403.html"],
            None,
        ),
    )
}

pub fn status_404_error<E>(err: E) -> (StatusCode, Html<String>)
where
    E: std::error::Error,
{
    eprintln!("{:?}", err.to_string());
    (
        StatusCode::NOT_FOUND,
        create_page(
            &["html/head.html"],
            &["html/nav.html", "html/status_codes/404.html"],
            None,
        ),
    )
}

pub fn status_500_error<E>(err: E) -> (StatusCode, Html<String>)
where
    E: std::error::Error,
{
    eprintln!("{:?}", err.to_string());
    (
        StatusCode::INTERNAL_SERVER_ERROR,
        create_page(
            &["html/head.html"],
            &["html/nav.html", "html/status_codes/500.html"],
            None,
        ),
    )
}
