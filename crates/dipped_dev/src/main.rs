use axum::{Router, ServiceExt, extract::Request, routing::get};
use dotenvy::{dotenv, var};
use maud::Markup;
use std::{env, path::Path};
use templates::{
    default_nav, head, main as template_main, main_section, status::status_404_handler, terminal,
    terminal_line,
};
use tower::layer::Layer;
use tower_http::{
    normalize_path::NormalizePathLayer,
    services::{ServeDir, ServeFile},
};

#[tokio::main]
async fn main() {
    dotenv().ok();

    let args: Vec<String> = env::args().collect();
    let port: String = var("MAIN_WEB_PORT").unwrap();
    let mut port: &str = port.as_str();

    if args.len() >= 3 {
        port = args[2].as_str();
    }

    #[cfg(debug_assertions)]
    debug_fn();

    let shared_assets_path: &String = &var("SHARED_ASSETS_PATH").unwrap();
    let assets_path: &String = &var("MAIN_ASSETS_PATH").unwrap();
    let vault_path: &String = &var("VAULT_ASSETS_PATH").unwrap();

    let shared_assets_path: &Path = Path::new(shared_assets_path);
    let assets_path: &Path = Path::new(assets_path);
    let favicon_path: &std::path::PathBuf = &shared_assets_path.join("media/images/favicon.ico");
    let vault_path: &Path = Path::new(vault_path);

    let favicon_service: ServeFile = ServeFile::new(favicon_path);
    let shared_asset_service: ServeDir = ServeDir::new(shared_assets_path);
    let asset_service: ServeDir = ServeDir::new(assets_path);
    let vault_service: ServeDir = ServeDir::new(vault_path);

    let app: tower_http::normalize_path::NormalizePath<Router> =
        NormalizePathLayer::trim_trailing_slash().layer(
            Router::new()
                .route("/", get(generate_index()))
                .nest_service("/favicon.ico", favicon_service)
                .nest_service("/shared", shared_asset_service)
                .nest_service("/static", asset_service)
                .nest_service("/static/vault", vault_service)
                .fallback(status_404_handler(default_nav())),
        );

    let address: String = format!("127.0.0.1:{}", port);
    let listener: tokio::net::TcpListener = tokio::net::TcpListener::bind(address).await.unwrap();
    println!("listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, ServiceExt::<Request>::into_make_service(app))
        .await
        .unwrap();
}

pub fn generate_index() -> Markup {
    template_main(
        vec![head::main()],
        vec![
            default_nav(),
            main_section(vec![terminal::main(
                vec![
                    terminal_line::command("bash ~/startup.sh"),
                    terminal_line::blank(),
                    terminal_line::header("Hi, I'm SeaBass (dipped.)"),
                    terminal::inline_group(vec![
                        terminal::image(
                            "/shared/media/images/blip.png",
                            "seb",
                            true,
                            "width: 120px;",
                        ),
                        terminal::group(
                            vec![
                                terminal_line::output(
                                    "I'm a person and I don't know what to put here.",
                                ),
                                terminal::inline_group(vec![
                                    terminal::button(terminal::ButtonOptions {
                                        href: "/",
                                        external: false,
                                        content: "home ",
                                        button_number: Some(1),
                                        disabled: false,
                                        inline: true,
                                        style: terminal::ButtonStyle::Default,
                                    }),
                                    terminal::button(terminal::ButtonOptions {
                                        href: "/projects",
                                        external: false,
                                        content: "projects ",
                                        button_number: Some(2),
                                        disabled: false,
                                        inline: true,
                                        style: terminal::ButtonStyle::Default,
                                    }),
                                    terminal::button(terminal::ButtonOptions {
                                        href: "https://re.dipped.dev",
                                        external: true,
                                        content: "role_eater ",
                                        button_number: Some(3),
                                        disabled: false,
                                        inline: true,
                                        style: terminal::ButtonStyle::Default,
                                    }),
                                    terminal::button(terminal::ButtonOptions {
                                        href: "https://minecraft.dipped.dev",
                                        external: true,
                                        content: "minecraft ",
                                        button_number: Some(4),
                                        disabled: false,
                                        inline: true,
                                        style: terminal::ButtonStyle::Default,
                                    }),
                                    terminal::button(terminal::ButtonOptions {
                                        href: "https://status.dipped.dev",
                                        external: true,
                                        content: "status ",
                                        button_number: Some(5),
                                        disabled: false,
                                        inline: true,
                                        style: terminal::ButtonStyle::Default,
                                    }),
                                ]),
                            ],
                            true,
                            "flex-direction: column;",
                        ),
                    ]),
                    terminal_line::blank(),
                    terminal_line::command_cursor(),
                ],
                terminal::TerminalType::Normal,
            )]),
        ],
    )
}

#[cfg(debug_assertions)]
fn debug_fn() {
    use glob::glob;
    use grass;
    use std::{fs, path::PathBuf};

    let shared_assets = glob(format!("{}/**/*.scss", var("SHARED_ASSETS_PATH").unwrap()).as_str())
        .unwrap()
        .filter_map(Result::ok);
    let assets = glob(format!("{}/**/*.scss", var("MAIN_ASSETS_PATH").unwrap()).as_str())
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
