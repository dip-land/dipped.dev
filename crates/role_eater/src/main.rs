use axum::{Router, ServiceExt, extract::Request};
use dotenvy::{dotenv, var};
use sea_orm::{Database, DatabaseConnection, DbErr};
use std::sync::Arc;
use std::{env, path::Path};
use templates::default_nav;
use templates::status::status_404_handler;
use tokio::sync::Mutex;
use tower::layer::Layer;
use tower_http::{
    normalize_path::NormalizePathLayer,
    services::{ServeDir, ServeFile},
};

pub mod api;
pub mod dashboard;
pub mod db;
pub mod role_eater;
pub mod structs;

#[derive(Clone)]
pub struct AppState {
    pub dbc: Arc<Mutex<DatabaseConnection>>,
}

#[tokio::main]
async fn main() {
    dotenv().ok();

    let args: Vec<String> = env::args().collect();
    let port = var("ROLE_EATER_WEB_PORT").unwrap();
    let mut port = port.as_str();

    if args.len() >= 3 {
        port = args[2].as_str();
    }

    #[cfg(debug_assertions)]
    debug_fn();

    let dbc = Database::connect(var("DATABASE_URL").unwrap())
        .await
        .unwrap();

    let state = AppState {
        dbc: Arc::new(Mutex::new(dbc)),
    };

    let shared_assets_path = &var("SHARED_ASSETS_PATH").unwrap();
    let assets_path = &var("ROLE_EATER_ASSETS_PATH").unwrap();

    let shared_assets_path = Path::new(shared_assets_path);
    let assets_path = Path::new(assets_path);
    let favicon_path = &shared_assets_path.join("media/images/favicon.ico");

    let favicon_service = ServeFile::new(favicon_path);
    let shared_asset_service = ServeDir::new(shared_assets_path);
    let asset_service = ServeDir::new(assets_path);

    let app = NormalizePathLayer::trim_trailing_slash().layer(
        Router::<AppState>::new()
            .merge(role_eater::router())
            .nest("/api", api::router())
            .nest_service("/favicon.ico", favicon_service)
            .nest_service("/shared", shared_asset_service)
            .nest_service("/static", asset_service)
            .fallback(status_404_handler(default_nav()))
            .with_state(state),
    );

    let address = format!("127.0.0.1:{}", port);
    let listener = tokio::net::TcpListener::bind(address).await.unwrap();
    println!("listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, ServiceExt::<Request>::into_make_service(app))
        .await
        .unwrap();
}

pub async fn check_db(app_state: AppState) -> Result<DatabaseConnection, DbErr> {
    let mut dbc = app_state.dbc.lock().await;
    if dbc.ping().await.is_err() {
        *dbc = Database::connect(var("DATABASE_URL").unwrap()).await?;
    }
    Ok(dbc.clone())
}

#[cfg(debug_assertions)]
fn debug_fn() {
    use glob::glob;
    use grass;
    use std::{fs, path::PathBuf};

    let shared_assets = glob(format!("{}/**/*.scss", var("SHARED_ASSETS_PATH").unwrap()).as_str())
        .unwrap()
        .filter_map(Result::ok);
    let assets = glob(format!("{}/**/*.scss", var("ROLE_EATER_ASSETS_PATH").unwrap()).as_str())
        .unwrap()
        .filter_map(Result::ok);

    let shared_assets: Vec<PathBuf> = shared_assets.collect();
    let assets: Vec<PathBuf> = assets.collect();

    let all_assets = [&shared_assets[..], &assets[..]].concat();

    for path in all_assets {
        let scss = fs::read_to_string(&path).unwrap();
        match grass::from_string(scss, &grass::Options::default()) {
            Ok(css) => {
                let path = path.to_str().unwrap().replace(".scss", ".css");
                match fs::write(&path, css) {
                    Ok(_) => {
                        println!("Wrote File {:?}", path);
                    }
                    Err(e) => println!("{:?}", e),
                }
            }
            Err(e) => println!("{:?} {:?}", &path, e),
        }
    }
}
