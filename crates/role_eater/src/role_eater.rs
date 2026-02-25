use crate::{
    AppState, check_db, dashboard,
    db::{guilds::*, users::*},
    structs::*,
};
use axum::{Router, http::StatusCode, routing::get};
use maud::Markup;
use sea_orm::{ColumnTrait, EntityTrait, PaginatorTrait, QueryFilter, QueryOrder};
use templates::{
    default_nav, head, main, main_section,
    status::{error_500_handler, status_404_handler},
    terminal, terminal_line,
};

pub fn router() -> Router<AppState> {
    Router::<AppState>::new()
        .route("/", get(generate_index()))
        .nest("/dashboard", dashboard::router())
        .fallback(status_404_handler(default_nav()))
}

pub fn generate_index() -> Markup {
    main(
        vec![head::role_eater()],
        vec![
            default_nav(),
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
                                        href: "/dashboard",
                                        external: false,
                                        content: "dashboard ",
                                        button_number: Some(1),
                                        disabled: false,
                                        inline: true,
                                        style: terminal::ButtonStyle::Default,
                                    }),
                                    terminal::button(terminal::ButtonOptions {
                                        href: "/",
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
                                        href: "https://github.com/dip-land/Role-Eater",
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
) -> Result<RoleEaterAPIGuildResponse, (StatusCode, Markup)> {
    let db = check_db(state).await.map_err(error_500_handler)?;

    let guild: guild_data::Model = guild_data::Entity::find()
        .filter(guild_data::Column::GuildId.eq(&guild_id))
        .one(&db)
        .await
        .map_err(error_500_handler)?
        .unwrap();

    let users: Vec<RoleEaterAPIGuildUserHiddenSensitive> = user_data::Entity::find()
        .filter(user_data::Column::GuildId.eq(&guild_id))
        .filter(user_data::Column::UserLeft.eq(false))
        .order_by_desc(user_data::Column::Total)
        .all(&db)
        .await
        .map_err(error_500_handler)?
        .into_iter()
        .map(
            |user: user_data::Model| RoleEaterAPIGuildUserHiddenSensitive {
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

    let role_count: u64 = roles::Entity::find()
        .filter(roles::Column::GuildId.eq(&guild_id))
        .count(&db)
        .await
        .map_err(error_500_handler)?;

    let mut total_message_count: i64 = 0;
    let mut total_voice_time: f64 = 0.0;

    for user in &users {
        total_message_count += user.message_count;
        total_voice_time += user.voice_time;
    }

    let stat_total: f64 = total_voice_time + total_message_count as f64;

    Ok(RoleEaterAPIGuildResponse {
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
