use axum::{Router, ServiceExt, extract::Request, routing::get};
use dotenvy::{dotenv, var};
use maud::{Markup, html};
use std::{env, path::Path};
use templates::{
    head, main as template_main, main_section, nav as r6_nav,
    status::status_404_handler,
    terminal::{self, ButtonOptions},
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
    let port = var("R6_WEB_PORT").unwrap();
    let mut port = port.as_str();

    if args.len() >= 3 {
        port = args[2].as_str();
    }

    #[cfg(debug_assertions)]
    debug_fn();

    let shared_assets_path = &var("SHARED_ASSETS_PATH").unwrap();
    let assets_path = &var("R6_ASSETS_PATH").unwrap();
    let vault_path = &var("VAULT_ASSETS_PATH").unwrap();

    let shared_assets_path = Path::new(shared_assets_path);
    let assets_path = Path::new(assets_path);
    let favicon_path = &shared_assets_path.join("media/images/favicon.ico");
    let vault_path = Path::new(vault_path);

    let favicon_service = ServeFile::new(favicon_path);
    let shared_asset_service = ServeDir::new(shared_assets_path);
    let asset_service = ServeDir::new(assets_path);
    let vault_service = ServeDir::new(vault_path);

    let app = NormalizePathLayer::trim_trailing_slash().layer(
        Router::new()
            .route("/", get(generate_index()))
            .nest_service("/favicon.ico", favicon_service)
            .nest_service("/shared", shared_asset_service)
            .nest_service("/static", asset_service)
            .nest_service("/static/vault", vault_service)
            .fallback(status_404_handler()),
    );

    let address = format!("127.0.0.1:{}", port);
    let listener = tokio::net::TcpListener::bind(address).await.unwrap();
    println!("listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, ServiceExt::<Request>::into_make_service(app))
        .await
        .unwrap();
}

pub fn generate_index() -> Markup {
    template_main(
        vec![head::r6_main()],
        vec![
            r6_nav(),
            html! {
                template id="operator_template" {
                    div class="operator" {
                        img {}
                        span {}
                    }
                }
            },
            main_section(vec![terminal::main(
                vec![
                    terminal_line::header("Select the operators you own"),
                    terminal_line::blank(),
                    terminal::group(
                        vec![terminal::inline_group(vec![
                            terminal::button(ButtonOptions {
                                href: "save_selection",
                                external: false,
                                content: "Save Operator Selection",
                                button_number: None,
                                disabled: false,
                                inline: true,
                                style: terminal::ButtonStyle::Default,
                            }),
                            terminal::button(ButtonOptions {
                                href: "select_all_attackers",
                                external: false,
                                content: "Select All Attackers",
                                button_number: None,
                                disabled: false,
                                inline: true,
                                style: terminal::ButtonStyle::Default,
                            }),
                            terminal::button(ButtonOptions {
                                href: "select_all_defenders",
                                external: false,
                                content: "Select All Defenders",
                                button_number: None,
                                disabled: false,
                                inline: true,
                                style: terminal::ButtonStyle::Default,
                            }),
                        ])],
                        false,
                        "",
                    ),
                    terminal::divider("ATTACKERS"),
                    html! { div id="attacker_grid" class="operator_grid" {} },
                    terminal::divider("DEFENDERS"),
                    html! { div id="defender_grid" class="operator_grid" {} },
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
    use std::fs;

    for entry in glob(format!("{}/**/*.scss", var("SHARED_ASSETS_PATH").unwrap()).as_str())
        .expect("Failed to read glob pattern")
    {
        if entry.is_err() {
            continue;
        }
        let path = entry.unwrap();

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

    for entry in glob(format!("{}/**/*.scss", var("R6_ASSETS_PATH").unwrap()).as_str())
        .expect("Failed to read glob pattern")
    {
        if entry.is_err() {
            continue;
        }
        let path = entry.unwrap();

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
