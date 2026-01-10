use crate::{
    AppState,
    role_eater::api::guild_handler,
    templates::{
        head, root,
        status::status_404_handler,
        terminal::{self, ButtonOptions},
        terminal_line,
    },
    utilities::create_page,
};
use axum::{
    Router,
    extract::{Path, State},
    routing::get,
};
use maud::{Markup, html};
use num_format::{Locale, ToFormattedString};
use reqwest::StatusCode;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(generate_index()))
        .route("/{guild_id}", get(guild_page))
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
        .fallback(status_404_handler())
}

pub fn generate_index() -> Markup {
    root::main(
        vec![head::main(), head::role_eater_dashboard()],
        vec![
            root::nav(),
            root::main_section(vec![terminal::main(
                vec![
                    terminal_line::command("bash ~/role_eater/dashboard"),
                    terminal_line::blank(),
                    terminal::divider("YOUR SERVERS"),
                    terminal::grid(vec![]),
                    terminal_line::blank(),
                    terminal_line::command_cursor(),
                ],
                terminal::TerminalType::Normal,
            )]),
        ],
    )
}

async fn guild_page(
    State(state): State<AppState>,
    Path(guild_id): Path<String>,
) -> Result<Markup, (StatusCode, Markup)> {
    let guild = guild_handler(state, guild_id)
        .await
        .map_err(|_| status_404_handler())?;

    let mut main_group: Vec<Markup> = Vec::new();
    if guild.icon.to_owned().is_some() {
        main_group.push(terminal::image(
            &guild.icon.unwrap(),
            &guild.name,
            true,
            "width: 190px;",
        ));
    }

    let info_group = vec![
        terminal_line::header(&guild.name),
        terminal_line::output_alt(&format!("Users: {}", guild.user_count)),
        terminal_line::output_alt(&format!("Roles: {}", guild.role_count)),
        terminal_line::output_alt(&format!(
            "Messages: {}",
            guild.message_count.to_formatted_string(&Locale::en)
        )),
        terminal_line::output_alt(&format!(
            "Voice Minutes: {}",
            (guild.voice_time as i64).to_formatted_string(&Locale::en)
        )),
        terminal_line::output_alt(&format!(
            "Total: {}",
            (guild.stat_total as i64).to_formatted_string(&Locale::en)
        )),
    ];

    main_group.push(terminal::group(
        info_group,
        false,
        "flex-direction: column; gap: 0.25rem;",
    ));
    main_group.push(terminal::group(
        vec![terminal::button(ButtonOptions {
            href: "/role-eater/dashboard/",
            external: false,
            content: "Back to Server List",
            button_number: None,
            disabled: false,
            inline: false,
            style: terminal::ButtonStyle::Default,
        })],
        false,
        "flex-direction: column; gap: 0rem;",
    ));

    let mut users: Vec<Markup> = Vec::new();
    for (index, user) in guild.users.into_iter().enumerate() {
        let user_content = html! {
            img src=(format!("{}?size=64", user.avatar.unwrap_or("".to_string()))) {}
            div {
                (user.nickname.unwrap_or(user.display_name.unwrap_or(user.global_name.unwrap_or("".to_string()))))
                span { (user.username) }
            }
        };
        users.push(terminal::table_row(vec![
            terminal::table_data(&format!("{}", index + 1)),
            terminal::table_data_alt(user_content),
            terminal::table_data(&format_number(
                user.message_count.to_formatted_string(&Locale::en),
            )),
            terminal::table_data(&format_number(
                (user.voice_time as i64).to_formatted_string(&Locale::en),
            )),
            terminal::table_data(&format_number(
                (user.total as i64).to_formatted_string(&Locale::en),
            )),
        ]))
    }

    Ok(root::main(
        vec![head::main(), head::role_eater_guild()],
        vec![
            root::nav(),
            root::main_section(vec![terminal::main(
                vec![
                    terminal::inline_group(main_group),
                    terminal_line::blank(),
                    html! {
                        div id="main_chart" style="width: 100%; height:320px;" {}
                    },
                    terminal_line::blank(),
                    terminal::divider("You"),
                    terminal::table(vec!["#", "user", "message", "voice", "total"], Vec::new()),
                    terminal::divider("Users"),
                    terminal::table(vec!["#", "user", "message", "voice", "total"], users),
                    terminal_line::command_cursor(),
                ],
                terminal::TerminalType::Normal,
            )]),
        ],
    ))
}

// Takes numbers formatted with commas and converts them to be more readable eg. 1,658,512 -> 1.7M
pub fn format_number(input: String) -> String {
    let split: Vec<&str> = (&input).split(",").collect();
    if split.len() == 1 {
        return input;
    } else if split.len() == 2 {
        let parsed = input.replace(",", "").as_str().parse::<f64>().unwrap() / 100.0;
        let parsed = parsed.round() / 10.0;
        return format!("{}K", parsed);
    } else if split.len() == 3 {
        let parsed = input.replace(",", "").as_str().parse::<f64>().unwrap() / 100000.0;
        let parsed = parsed.round() / 10.0;
        return format!("{}M", parsed);
    } else if split.len() == 4 {
        let parsed = input.replace(",", "").as_str().parse::<f64>().unwrap() / 100000000.0;
        let parsed = parsed.round() / 10.0;
        return format!("{}B", parsed);
    } else {
        return "THIS SHOULD NEVER OCCUR".to_string();
    }
}
