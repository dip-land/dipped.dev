use app_state::{
    AppState,
    models::*,
    schema::{guild_data, roles, user_data},
};
use axum::{Router, http::StatusCode, routing::get};
use diesel::prelude::*;
use maud::Markup;
use templates::{
    head, main, main_section, nav,
    status::{error_500_handler, status_404_handler},
    terminal, terminal_line,
};

pub mod api;
pub mod dashboard;
pub mod structs;

pub fn router() -> Router<AppState> {
    Router::<AppState>::new()
        .route("/", get(generate_index()))
        .nest("/dashboard", dashboard::router())
        .fallback(status_404_handler())
}

pub fn generate_index() -> Markup {
    main(
        vec![head::main()],
        vec![
            nav(),
            main_section(vec![terminal::main(
                vec![
                    terminal_line::command("bash ~/role_eater"),
                    terminal_line::blank(),
                    terminal::divider("ROLE EATER"),
                    terminal::inline_group(vec![
                        terminal::image(
                            "/static/media/images/role-eater.gif",
                            "Role Eater Icon",
                            true,
                            "width: 120px;",
                        ),
                        terminal::group(
                            vec![
                                terminal_line::output("A stat-tracking role-creation Discord bot."),
                                terminal::inline_group(vec![
                                    terminal::button(terminal::ButtonOptions {
                                        href: "/role-eater/dashboard",
                                        external: false,
                                        content: "dashboard ",
                                        button_number: Some(1),
                                        disabled: false,
                                        inline: true,
                                        style: terminal::ButtonStyle::Default,
                                    }),
                                    terminal::button(terminal::ButtonOptions {
                                        href: "/role-eater",
                                        external: false,
                                        content: "invite bot ",
                                        button_number: Some(2),
                                        disabled: true,
                                        inline: true,
                                        style: terminal::ButtonStyle::Default,
                                    }),
                                    terminal::button(terminal::ButtonOptions {
                                        href: "https://discord.gg/pHWbSYd96G",
                                        external: true,
                                        content: "support server ",
                                        button_number: Some(3),
                                        disabled: false,
                                        inline: true,
                                        style: terminal::ButtonStyle::Default,
                                    }),
                                    terminal::button(terminal::ButtonOptions {
                                        href: "https://github.com/dip-land/dipped.dev",
                                        external: true,
                                        content: "github ",
                                        button_number: Some(4),
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

pub async fn guild_handler(
    state: AppState,
    guild_id: String,
) -> Result<structs::RoleEaterAPIGuildResponse, (StatusCode, Markup)> {
    let guild_connection = state.guild_pool.get().await.map_err(error_500_handler)?;
    let user_connection = state.user_pool.get().await.map_err(error_500_handler)?;

    let guid: String = guild_id.clone();
    let guild: GuildData = guild_connection
        .interact(move |conn| {
            guild_data::table
                .filter(guild_data::dsl::guild_id.eq(guid))
                .first(conn)
        })
        .await
        .map_err(error_500_handler)?
        .map_err(error_500_handler)?;

    let guid: String = guild_id.clone();
    let users: Vec<structs::RoleEaterAPIGuildUserHiddenSensitive> = user_connection
        .interact(move |conn| {
            user_data::table
                .filter(user_data::dsl::guild_id.eq(guid))
                .filter(user_data::dsl::user_left.ne(true))
                .order(user_data::dsl::total.desc())
                .load(conn)
        })
        .await
        .map_err(error_500_handler)?
        .map_err(error_500_handler)?
        .into_iter()
        .map(
            |user: UserData| structs::RoleEaterAPIGuildUserHiddenSensitive {
                user_id: user.user_id,
                guild_id: user.guild_id,
                username: user.username,
                display_name: user.display_name,
                global_name: user.global_name,
                nickname: user.nickname,
                avatar: user.avatar,
                banner: user.banner,
                message_count: user.message_count,
                voice_time: user.voice_time,
                total: user.total,
                user_left: user.user_left,
            },
        )
        .collect();

    let role_count: i64 = guild_connection
        .interact(move |conn| {
            roles::table
                .filter(roles::dsl::guild_id.eq(guild_id))
                .count()
                .get_result(conn)
        })
        .await
        .map_err(error_500_handler)?
        .map_err(error_500_handler)?;

    let mut total_message_count: i64 = 0;
    let mut total_voice_time: f64 = 0.0;

    for user in &users {
        total_message_count += user.message_count;
        total_voice_time += user.voice_time;
    }

    let stat_total: f64 = total_voice_time + total_message_count as f64;

    Ok(structs::RoleEaterAPIGuildResponse {
        guild_id: guild.guild_id,
        name: guild.name,
        icon: guild.icon,
        banner: guild.banner,
        stat_exclusion_channels: guild.stat_exclusion_channels,
        voice_time: total_voice_time,
        message_count: total_message_count,
        stat_total,
        role_count,
        user_count: users.len() as i64,
        users,
    })
}
