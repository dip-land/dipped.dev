use axum::{
    Json, Router,
    extract::{Path, Query, State},
    http::{StatusCode, header},
    routing::get,
};
use chrono::{DateTime, Duration, Local};
use maud::Markup;
use sea_orm::{ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter, QueryOrder, QuerySelect};
use std::cmp::Ordering;
use templates::default_nav;
use templates::status::{error_500_handler, status_403_handler};

use crate::{
    AppState, check_db,
    db::{guilds::*, users::*},
    role_eater::guild_handler,
    structs::*,
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/servers", get(servers_route_handler))
        .route("/{guild_id}", get(guild_route_handler))
        .route("/{guild_id}/activity", get(guild_activity_route_handler))
        .route("/{guild_id}/positions", get(guild_positions_route_handler))
        .route("/{guild_id}/{user_id}", get(guild_user_route_handler))
        .route(
            "/{guild_id}/{user_id}/activity",
            get(guild_user_activity_route_handler),
        )
        .route(
            "/{guild_id}/{user_id}/activity/latest",
            get(guild_user_activity_latest_route_handler),
        )
        .route(
            "/{guild_id}/{user_id}/activity/game",
            get(guild_user_activity_game_route_handler),
        )
        .route(
            "/{guild_id}/{user_id}/activity/music",
            get(guild_user_activity_music_route_handler),
        )
        .fallback(status_403_handler(default_nav()))
}

const DATE_FORMAT: &str = "%a %b %d %Y";
const DATE_FORMAT_ISO8601_NO_MS: &str = "%Y-%m-%dT%H:%M:%S";

async fn servers_route_handler(
    State(state): State<AppState>,
    headers: header::HeaderMap,
) -> Result<Json<Vec<RoleEaterAPIServersResponse>>, (StatusCode, Markup)> {
    let db = check_db(state).await.map_err(error_500_handler)?;

    let mut user_guilds: Vec<String> = Vec::new();
    if headers.get("guilds").is_some_and(|value| value != "null") {
        user_guilds =
            serde_json::from_str::<Vec<String>>(headers.get("guilds").unwrap().to_str().unwrap())
                .unwrap()
    }

    let available_guilds: Vec<guild_data::Model> = guild_data::Entity::find()
        .all(&db)
        .await
        .map_err(error_500_handler)?;

    let mut guilds: Vec<RoleEaterAPIServersResponse> = Vec::new();

    for guild in available_guilds {
        if !user_guilds.contains(&guild.guild_id) {
            continue;
        }
        guilds.push(RoleEaterAPIServersResponse {
            id: guild.guild_id,
            name: guild.name,
            icon: guild.icon,
            banner: guild.banner,
        })
    }

    Ok(Json(guilds))
}

async fn guild_route_handler(
    State(state): State<AppState>,
    Path(guild_id): Path<String>,
) -> Result<Json<RoleEaterAPIGuildResponse>, (StatusCode, Markup)> {
    let guild = guild_handler(state, guild_id).await?;

    Ok(Json(guild))
}

// TODO: make this faster
async fn guild_activity_route_handler(
    State(state): State<AppState>,
    Path(guild_id): Path<String>,
) -> Result<Json<RoleEaterAPIGuildActivityResponse>, (StatusCode, Markup)> {
    let db = check_db(state).await.map_err(error_500_handler)?;

    let forty_five_days_ago = (Local::now() - Duration::days(45))
        .with_timezone(&Local)
        .date_naive()
        .and_hms_opt(0, 0, 0)
        .unwrap();

    let users: Vec<user_data::Model> = user_data::Entity::find()
        .filter(user_data::Column::GuildId.eq(&guild_id))
        .filter(user_data::Column::UserLeft.eq(false))
        .all(&db)
        .await
        .map_err(error_500_handler)?;

    let voice_message_history: Vec<RoleEaterAPIVoiceMessageHistory> =
        voice_message_history::Entity::find()
            .filter(voice_message_history::Column::GuildId.eq(&guild_id))
            .filter(voice_message_history::Column::Date.gte(forty_five_days_ago))
            .all(&db)
            .await
            .map_err(error_500_handler)?
            .into_iter()
            .map(
                |history: voice_message_history::Model| RoleEaterAPIVoiceMessageHistory {
                    user_id: history.user_id,
                    guild_id: history.guild_id,
                    date: history.date.format(DATE_FORMAT).to_string(),
                    message_count: history.message_count,
                    voice_time: history.voice_time,
                },
            )
            .collect();

    let mut full_activity_time_history: Vec<RoleEaterAPIActivityTimeHistory> = Vec::new();
    let mut data: Vec<RoleEaterAPIGuildActivityData> = Vec::new();
    let now: DateTime<Local> = Local::now();
    let past = now - Duration::days(45);
    for user in users {
        let activity_time_history: Vec<RoleEaterAPIActivityTimeHistory> =
            activity_time_history::Entity::find()
                .filter(activity_time_history::Column::UserId.eq(&user.user_id))
                .filter(activity_time_history::Column::Date.gte(forty_five_days_ago))
                .all(&db)
                .await
                .map_err(error_500_handler)?
                .into_iter()
                .map(
                    |history: activity_time_history::Model| RoleEaterAPIActivityTimeHistory {
                        user_id: history.user_id,
                        date: history.date.format(DATE_FORMAT).to_string(),
                        game_time: history.game_time,
                        game_count: history.game_count,
                        music_time: history.music_time,
                        music_count: history.music_count,
                    },
                )
                .collect();

        full_activity_time_history = [full_activity_time_history, activity_time_history].concat();
    }

    let mut date_step = past;
    while date_step <= now {
        let filtered_voice_message_history = voice_message_history
            .clone()
            .into_iter()
            .filter(|v| v.date == date_step.format(DATE_FORMAT).to_string());
        let filtered_activity_time_history = full_activity_time_history
            .clone()
            .into_iter()
            .filter(|v| v.date == date_step.format(DATE_FORMAT).to_string());

        let mut message_count: i64 = 0;
        let mut voice_time: f64 = 0.0;
        let mut game_time: f64 = 0.0;
        let mut game_count: i64 = 0;
        let mut music_time: f64 = 0.0;
        let mut music_count: i64 = 0;

        for data in filtered_voice_message_history {
            message_count += data.message_count;
            voice_time += data.voice_time;
        }

        for data in filtered_activity_time_history {
            game_time += data.game_time;
            game_count += data.game_count;
            music_time += data.music_time;
            music_count += data.music_count;
        }

        data.push(RoleEaterAPIGuildActivityData {
            date: date_step.format(DATE_FORMAT).to_string(),
            message_count,
            voice_time,
            game_time,
            game_count,
            music_time,
            music_count,
        });
        date_step += Duration::days(1);
    }

    Ok(Json(RoleEaterAPIGuildActivityResponse { guild_id, data }))
}

async fn get_guild_users_positions(
    connection: DatabaseConnection,
    guild_id: String,
) -> Result<RoleEaterAPIGuildPositionsResponse, (StatusCode, Markup)> {
    let mut users: Vec<user_data::Model> = user_data::Entity::find()
        .filter(user_data::Column::GuildId.eq(&guild_id))
        .filter(user_data::Column::UserLeft.eq(false))
        .order_by_desc(user_data::Column::Total)
        .all(&connection)
        .await
        .map_err(error_500_handler)?;

    let total: Vec<String> = users.clone().into_iter().map(|user| user.user_id).collect();

    users.sort_by(|a, b| cmp_f64(&b.voice_time, &a.voice_time));
    let voice: Vec<String> = users.clone().into_iter().map(|user| user.user_id).collect();

    users.sort_by(|a, b| cmp_i64(&b.message_count, &a.message_count));
    let message: Vec<String> = users.clone().into_iter().map(|user| user.user_id).collect();

    Ok(RoleEaterAPIGuildPositionsResponse {
        guild_id,
        total,
        voice,
        message,
    })
}

async fn guild_positions_route_handler(
    State(state): State<AppState>,
    Path(guild_id): Path<String>,
) -> Result<Json<RoleEaterAPIGuildPositionsResponse>, (StatusCode, Markup)> {
    let db = check_db(state).await.map_err(error_500_handler)?;

    let data = get_guild_users_positions(db, guild_id.clone()).await?;

    Ok(Json(RoleEaterAPIGuildPositionsResponse {
        guild_id,
        total: data.total,
        voice: data.voice,
        message: data.message,
    }))
}

async fn guild_user_route_handler(
    State(state): State<AppState>,
    Path((guild_id, user_id)): Path<(String, String)>,
) -> Result<Json<RoleEaterAPIGuildUserResponse>, (StatusCode, Markup)> {
    let db = check_db(state).await.map_err(error_500_handler)?;

    let guild: guild_data::Model = guild_data::Entity::find()
        .filter(guild_data::Column::GuildId.eq(&guild_id))
        .one(&db)
        .await
        .map_err(error_500_handler)?
        .unwrap();

    let user: user_data::Model = user_data::Entity::find()
        .filter(user_data::Column::GuildId.eq(&guild_id))
        .filter(user_data::Column::UserId.eq(&user_id))
        .one(&db)
        .await
        .map_err(error_500_handler)?
        .unwrap();

    let positions = get_guild_users_positions(db, guild_id.clone()).await?;

    let total_position = positions.total.iter().position(|x| x == &user_id).unwrap() + 1;
    let voice_position = positions.voice.iter().position(|x| x == &user_id).unwrap() + 1;
    let message_position = positions
        .message
        .iter()
        .position(|x| x == &user_id)
        .unwrap()
        + 1;

    let mut join_date = "".to_string();
    let mut creation_date = "".to_string();
    if let Some(date) = user.join_date {
        join_date = date.format(DATE_FORMAT_ISO8601_NO_MS).to_string();
    }
    if let Some(date) = user.creation_date {
        creation_date = date.format(DATE_FORMAT_ISO8601_NO_MS).to_string();
    }

    Ok(Json(RoleEaterAPIGuildUserResponse {
        guild_id,
        guild_name: guild.name,
        user_id: user.user_id,
        username: user.username,
        display_name: user.display_name,
        global_name: user.global_name,
        nickname: user.nickname,
        avatar: user.avatar,
        banner: user.banner,
        join_date,
        creation_date,
        total: user.total,
        total_position,
        message_count: user.message_count,
        message_position,
        voice_time: user.voice_time,
        voice_position,
    }))
}

async fn guild_user_activity_route_handler(
    State(state): State<AppState>,
    Path((guild_id, user_id)): Path<(String, String)>,
) -> Result<Json<RoleEaterAPIGuildUserActivityResponse>, (StatusCode, Markup)> {
    let db = check_db(state).await.map_err(error_500_handler)?;
    let forty_five_days_ago = (Local::now() - Duration::days(45))
        .with_timezone(&Local)
        .date_naive()
        .and_hms_opt(0, 0, 0)
        .unwrap();

    let voice_message_history: Vec<RoleEaterAPIVoiceMessageHistory> =
        voice_message_history::Entity::find()
            .filter(voice_message_history::Column::GuildId.eq(&guild_id))
            .filter(voice_message_history::Column::UserId.eq(&user_id))
            .filter(voice_message_history::Column::Date.gte(forty_five_days_ago))
            .all(&db)
            .await
            .map_err(error_500_handler)?
            .into_iter()
            .map(
                |history: voice_message_history::Model| RoleEaterAPIVoiceMessageHistory {
                    user_id: history.user_id,
                    guild_id: history.guild_id,
                    date: history.date.format(DATE_FORMAT).to_string(),
                    message_count: history.message_count,
                    voice_time: history.voice_time,
                },
            )
            .collect();

    let mut data: Vec<RoleEaterAPIGuildActivityData> = Vec::new();
    let now: DateTime<Local> = Local::now();
    let past = now - Duration::days(45);

    let activity_time_history: Vec<RoleEaterAPIActivityTimeHistory> =
        activity_time_history::Entity::find()
            .filter(activity_time_history::Column::UserId.eq(&user_id))
            .filter(activity_time_history::Column::Date.gte(forty_five_days_ago))
            .all(&db)
            .await
            .map_err(error_500_handler)?
            .into_iter()
            .map(
                |history: activity_time_history::Model| RoleEaterAPIActivityTimeHistory {
                    user_id: history.user_id,
                    date: history.date.format(DATE_FORMAT).to_string(),
                    game_time: history.game_time,
                    game_count: history.game_count,
                    music_time: history.music_time,
                    music_count: history.music_count,
                },
            )
            .collect();

    let mut date_step = past;
    while date_step <= now {
        let filtered_voice_message_history = voice_message_history
            .clone()
            .into_iter()
            .filter(|v| v.date == date_step.format(DATE_FORMAT).to_string());
        let filtered_activity_time_history = activity_time_history
            .clone()
            .into_iter()
            .filter(|v| v.date == date_step.format(DATE_FORMAT).to_string());

        let mut message_count: i64 = 0;
        let mut voice_time: f64 = 0.0;
        let mut game_time: f64 = 0.0;
        let mut game_count: i64 = 0;
        let mut music_time: f64 = 0.0;
        let mut music_count: i64 = 0;

        for data in filtered_voice_message_history {
            message_count += data.message_count;
            voice_time += data.voice_time;
        }

        for data in filtered_activity_time_history {
            game_time += data.game_time;
            game_count += data.game_count;
            music_time += data.music_time;
            music_count += data.music_count;
        }

        data.push(RoleEaterAPIGuildActivityData {
            date: date_step.format(DATE_FORMAT).to_string(),
            message_count,
            voice_time,
            game_time,
            game_count,
            music_time,
            music_count,
        });
        date_step += Duration::days(1);
    }

    Ok(Json(RoleEaterAPIGuildUserActivityResponse {
        guild_id,
        user_id,
        data,
    }))
}

async fn guild_user_activity_latest_route_handler(
    State(state): State<AppState>,
    Path((guild_id, user_id)): Path<(String, String)>,
) -> Result<Json<RoleEaterAPIGuildUserActivityLatestResponse>, (StatusCode, Markup)> {
    let db = check_db(state).await.map_err(error_500_handler)?;

    let user: activity_user_data::Model = activity_user_data::Entity::find()
        .filter(activity_user_data::Column::UserId.eq(&user_id))
        .one(&db)
        .await
        .map_err(error_500_handler)?
        .unwrap();

    let mut game_start_time: Option<String> = None;
    if let Some(current_game_start_time) = user.current_game_start_time {
        game_start_time = Some(
            current_game_start_time
                .format(DATE_FORMAT_ISO8601_NO_MS)
                .to_string(),
        );
    }

    let mut song_start_time: Option<String> = None;
    if let Some(current_song_start_time) = user.current_song_start_time {
        song_start_time = Some(
            current_song_start_time
                .format(DATE_FORMAT_ISO8601_NO_MS)
                .to_string(),
        );
    }

    Ok(Json(RoleEaterAPIGuildUserActivityLatestResponse {
        guild_id,
        user_id,
        last_played_game_title: user.last_played_game_title,
        last_played_game_time: user.last_played_game_time,
        last_played_song_title: user.last_played_song_title,
        last_played_song_time: user.last_played_song_time,
        last_played_song_artist: user.last_played_song_artist,
        current_game_title: user.current_game_title,
        current_game_start_time: game_start_time,
        current_song_title: user.current_song_title,
        current_song_artist: user.current_song_artist,
        current_song_start_time: song_start_time,
    }))
}

async fn guild_user_activity_game_route_handler(
    State(state): State<AppState>,
    Path((guild_id, user_id)): Path<(String, String)>,
    query: Query<GuildUserActivityExtraParams>,
) -> Result<Json<RoleEaterAPIGuildUserActivityGameResponse>, (StatusCode, Markup)> {
    let db = check_db(state).await.map_err(error_500_handler)?;

    let user: Vec<RoleEaterAPIGuildUserActivityGameData> = match query.0.limit.is_some() {
        true => activity_game_history::Entity::find()
            .filter(activity_game_history::Column::UserId.eq(&user_id))
            .order_by_desc(activity_game_history::Column::TimePlayed)
            .limit(query.0.limit.unwrap() as u64)
            .all(&db),
        false => activity_game_history::Entity::find()
            .filter(activity_game_history::Column::UserId.eq(&user_id))
            .order_by_desc(activity_game_history::Column::TimePlayed)
            .all(&db),
    }
    .await
    .map_err(error_500_handler)?
    .into_iter()
    .map(
        |activity: activity_game_history::Model| RoleEaterAPIGuildUserActivityGameData {
            game_title: activity.game_title,
            play_count: activity.play_count,
            time_played: activity.time_played,
        },
    )
    .collect();

    Ok(Json(RoleEaterAPIGuildUserActivityGameResponse {
        guild_id,
        user_id,
        data: user,
    }))
}

async fn guild_user_activity_music_route_handler(
    State(state): State<AppState>,
    Path((guild_id, user_id)): Path<(String, String)>,
    query: Query<GuildUserActivityExtraParams>,
) -> Result<Json<RoleEaterAPIGuildUserActivityMusicResponse>, (StatusCode, Markup)> {
    let db = check_db(state).await.map_err(error_500_handler)?;

    let user: Vec<RoleEaterAPIGuildUserActivityMusicData> = match query.0.limit.is_some() {
        true => activity_music_history::Entity::find()
            .filter(activity_music_history::Column::UserId.eq(&user_id))
            .order_by_desc(activity_music_history::Column::TimePlayed)
            .limit(query.0.limit.unwrap() as u64)
            .all(&db),
        false => activity_music_history::Entity::find()
            .filter(activity_music_history::Column::UserId.eq(&user_id))
            .order_by_desc(activity_music_history::Column::TimePlayed)
            .all(&db),
    }
    .await
    .map_err(error_500_handler)?
    .into_iter()
    .map(
        |activity: activity_music_history::Model| RoleEaterAPIGuildUserActivityMusicData {
            song_title: activity.song_title,
            song_artist: activity.song_artist,
            play_count: activity.play_count,
            time_played: activity.time_played,
        },
    )
    .collect();

    Ok(Json(RoleEaterAPIGuildUserActivityMusicResponse {
        guild_id,
        user_id,
        data: user,
    }))
}

fn cmp_f64(a: &f64, b: &f64) -> Ordering {
    if a < b {
        return Ordering::Less;
    } else if a > b {
        return Ordering::Greater;
    }
    Ordering::Equal
}

fn cmp_i64(a: &i64, b: &i64) -> Ordering {
    if a < b {
        return Ordering::Less;
    } else if a > b {
        return Ordering::Greater;
    }
    Ordering::Equal
}
