use std::cmp::Ordering;

use axum::{
    Json, Router,
    extract::{Path, Query, State},
    http::{StatusCode, header},
    routing::get,
};
use chrono::{DateTime, Duration, Local};
use deadpool_diesel::postgres::Object;
use diesel::{dsl::sql, prelude::*};
use maud::Markup;
use serde::{Deserialize, Serialize};

use crate::{
    AppState,
    models::*,
    schema::{
        activity_game_history, activity_music_history, activity_time_history, activity_user_data,
        guild_data, roles, user_data, voice_message_history,
    },
    templates::status::{error_500_handler, status_403_handler},
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
        .fallback(status_403_handler())
}

const DATE_FORMAT: &str = "%a %b %d %Y";
const DATE_FORMAT_ISO8601_NO_MS: &str = "%Y-%m-%dT%H:%M:%S";

async fn servers_route_handler(
    State(state): State<AppState>,
    headers: header::HeaderMap,
) -> Result<Json<Vec<RoleEaterAPIServersResponse>>, (StatusCode, Markup)> {
    let guild_connection = state.guild_pool.get().await.map_err(error_500_handler)?;

    let mut user_guilds: Vec<String> = Vec::new();
    if headers.get("guilds").is_some_and(|value| value != "null") {
        user_guilds =
            serde_json::from_str::<Vec<String>>(headers.get("guilds").unwrap().to_str().unwrap())
                .unwrap()
    }

    let available_guilds: Vec<GuildData> = guild_connection
        .interact(|conn| guild_data::table.load(conn))
        .await
        .map_err(error_500_handler)?
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

#[derive(Serialize, Deserialize, Clone)]
pub struct RoleEaterAPIServersResponse {
    pub id: String,
    pub name: String,
    pub icon: Option<String>,
    pub banner: Option<String>,
}

pub async fn guild_handler(
    state: AppState,
    guild_id: String,
) -> Result<RoleEaterAPIGuildResponse, (StatusCode, Markup)> {
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
    let users: Vec<RoleEaterAPIGuildUserHiddenSensitive> = user_connection
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
        .map(|user: UserData| RoleEaterAPIGuildUserHiddenSensitive {
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
        })
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

async fn guild_route_handler(
    State(state): State<AppState>,
    Path(guild_id): Path<String>,
) -> Result<Json<RoleEaterAPIGuildResponse>, (StatusCode, Markup)> {
    let guild = guild_handler(state, guild_id).await?;

    Ok(Json(guild))
}

#[derive(Serialize, Deserialize)]
pub struct RoleEaterAPIGuildResponse {
    pub guild_id: String,
    pub name: String,
    pub icon: Option<String>,
    pub banner: Option<String>,
    pub stat_exclusion_channels: Vec<String>,
    pub voice_time: f64,
    pub message_count: i64,
    pub stat_total: f64,
    pub role_count: i64,
    pub user_count: i64,
    pub users: Vec<RoleEaterAPIGuildUserHiddenSensitive>,
}

// TODO: make this faster
async fn guild_activity_route_handler(
    State(state): State<AppState>,
    Path(guild_id): Path<String>,
) -> Result<Json<RoleEaterAPIGuildActivityResponse>, (StatusCode, Markup)> {
    let user_connection = state.user_pool.get().await.map_err(error_500_handler)?;

    let guid = guild_id.clone();
    let users: Vec<UserData> = user_connection
        .interact(move |conn| {
            user_data::table
                .filter(user_data::dsl::guild_id.eq(guid))
                .filter(user_data::dsl::user_left.ne(true))
                .load(conn)
        })
        .await
        .map_err(error_500_handler)?
        .map_err(error_500_handler)?;

    let guid = guild_id.clone();
    let voice_message_history: Vec<RoleEaterAPIVoiceMessageHistory> = user_connection
        .interact(move |conn| {
            voice_message_history::table
                .filter(voice_message_history::dsl::guild_id.eq(guid))
                .filter(voice_message_history::dsl::date.ge(sql("now() - interval '46 day'")))
                .load(conn)
        })
        .await
        .map_err(error_500_handler)?
        .map_err(error_500_handler)?
        .into_iter()
        .map(
            |history: VoiceMessageHistory| RoleEaterAPIVoiceMessageHistory {
                user_id: history.user_id,
                guild_id: history.guild_id,
                date: history.date.format(DATE_FORMAT).to_string(),
                message_count: history.message_count,
                voice_time: history.voice_time,
            },
        )
        .collect();

    let mut parsed_voice_message_history: Vec<&RoleEaterAPIVoiceMessageHistory> = Vec::new();
    let mut parsed_activity_time_history: Vec<RoleEaterAPIActivityTimeHistory> = Vec::new();
    let mut data: Vec<RoleEaterAPIGuildActivityData> = Vec::new();
    let now: DateTime<Local> = Local::now();
    let past = now - Duration::days(45);
    for user in users {
        voice_message_history
            .iter()
            .filter(|v| v.user_id == user.user_id)
            .for_each(|value| parsed_voice_message_history.push(value));

        let activity_time_history: Vec<RoleEaterAPIActivityTimeHistory> = user_connection
            .interact(move |conn| {
                activity_time_history::table
                    .filter(activity_time_history::dsl::user_id.eq(&user.user_id))
                    .filter(activity_time_history::dsl::date.ge(sql("now() - interval '46 day'")))
                    .load(conn)
            })
            .await
            .map_err(error_500_handler)?
            .map_err(error_500_handler)?
            .into_iter()
            .map(
                |history: ActivityTimeHistory| RoleEaterAPIActivityTimeHistory {
                    user_id: history.user_id,
                    date: history.date.format(DATE_FORMAT).to_string(),
                    game_time: history.game_time,
                    game_count: history.game_count,
                    music_time: history.music_time,
                    music_count: history.music_count,
                },
            )
            .collect();

        for history in activity_time_history {
            parsed_activity_time_history.push(history);
        }
    }

    let mut date_step = past;
    while date_step <= now {
        let filtered_voice_message_history = parsed_voice_message_history
            .clone()
            .into_iter()
            .filter(|v| v.date == date_step.format(DATE_FORMAT).to_string());
        let filtered_activity_time_history = parsed_activity_time_history
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

#[derive(Deserialize, Serialize, Debug)]
pub struct RoleEaterAPIGuildActivityResponse {
    pub guild_id: String,
    pub data: Vec<RoleEaterAPIGuildActivityData>,
}

async fn get_guild_users_positions(
    connection: Object,
    guild_id: String,
) -> Result<RoleEaterAPIGuildPositionsResponse, (StatusCode, Markup)> {
    let guid = guild_id.clone();
    let mut users: Vec<UserData> = connection
        .interact(move |conn| {
            user_data::table
                .filter(user_data::dsl::guild_id.eq(guid))
                .filter(user_data::dsl::user_left.ne(true))
                .order(user_data::dsl::total.desc())
                .load(conn)
        })
        .await
        .map_err(error_500_handler)?
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
    let user_connection = state.user_pool.get().await.map_err(error_500_handler)?;

    let data = get_guild_users_positions(user_connection, guild_id.clone()).await?;

    Ok(Json(RoleEaterAPIGuildPositionsResponse {
        guild_id,
        total: data.total,
        voice: data.voice,
        message: data.message,
    }))
}

#[derive(Deserialize, Serialize, Debug)]
pub struct RoleEaterAPIGuildPositionsResponse {
    pub guild_id: String,
    pub total: Vec<String>,
    pub voice: Vec<String>,
    pub message: Vec<String>,
}

async fn guild_user_route_handler(
    State(state): State<AppState>,
    Path((guild_id, user_id)): Path<(String, String)>,
) -> Result<Json<RoleEaterAPIGuildUserResponse>, (StatusCode, Markup)> {
    let guild_connection = state.guild_pool.get().await.map_err(error_500_handler)?;
    let user_connection = state.user_pool.get().await.map_err(error_500_handler)?;

    let guid = guild_id.clone();
    let guild: GuildData = guild_connection
        .interact(move |conn| {
            guild_data::table
                .filter(guild_data::dsl::guild_id.eq(guid))
                .first(conn)
        })
        .await
        .map_err(error_500_handler)?
        .map_err(error_500_handler)?;

    let guid = guild_id.clone();
    let uid = user_id.clone();
    let user: UserData = user_connection
        .interact(move |conn| {
            user_data::table
                .filter(user_data::dsl::guild_id.eq(guid))
                .filter(user_data::dsl::user_id.eq(uid))
                .order(user_data::dsl::total.desc())
                .first(conn)
        })
        .await
        .map_err(error_500_handler)?
        .map_err(error_500_handler)?;

    let positions = get_guild_users_positions(user_connection, guild_id.clone()).await?;

    let total_position = positions.total.iter().position(|x| x == &user_id).unwrap() + 1;
    let voice_position = positions.voice.iter().position(|x| x == &user_id).unwrap() + 1;
    let message_position = positions
        .message
        .iter()
        .position(|x| x == &user_id)
        .unwrap()
        + 1;

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
        join_date: user.join_date.format(DATE_FORMAT_ISO8601_NO_MS).to_string(),
        creation_date: user
            .creation_date
            .format(DATE_FORMAT_ISO8601_NO_MS)
            .to_string(),
        total: user.total,
        total_position,
        message_count: user.message_count,
        message_position,
        voice_time: user.voice_time,
        voice_position,
    }))
}

#[derive(Deserialize, Serialize, Debug)]
pub struct RoleEaterAPIGuildUserResponse {
    pub guild_id: String,
    pub guild_name: String,
    pub user_id: String,
    pub username: String,
    pub display_name: Option<String>,
    pub global_name: Option<String>,
    pub nickname: Option<String>,
    pub avatar: Option<String>,
    pub banner: Option<String>,
    pub join_date: String,
    pub creation_date: String,
    pub total: f64,
    pub total_position: usize,
    pub message_count: i64,
    pub message_position: usize,
    pub voice_time: f64,
    pub voice_position: usize,
}

async fn guild_user_activity_route_handler(
    State(state): State<AppState>,
    Path((guild_id, user_id)): Path<(String, String)>,
) -> Result<Json<RoleEaterAPIGuildUserActivityResponse>, (StatusCode, Markup)> {
    let user_connection = state.user_pool.get().await.map_err(error_500_handler)?;

    let guid = guild_id.clone();
    let uid = user_id.clone();
    let voice_message_history: Vec<RoleEaterAPIVoiceMessageHistory> = user_connection
        .interact(move |conn| {
            voice_message_history::table
                .filter(voice_message_history::dsl::guild_id.eq(guid))
                .filter(voice_message_history::dsl::user_id.eq(uid))
                .filter(voice_message_history::dsl::date.ge(sql("now() - interval '46 day'")))
                .load(conn)
        })
        .await
        .map_err(error_500_handler)?
        .map_err(error_500_handler)?
        .into_iter()
        .map(
            |history: VoiceMessageHistory| RoleEaterAPIVoiceMessageHistory {
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

    let uid = user_id.clone();
    let activity_time_history: Vec<RoleEaterAPIActivityTimeHistory> = user_connection
        .interact(move |conn| {
            activity_time_history::table
                .filter(activity_time_history::dsl::user_id.eq(uid))
                .filter(activity_time_history::dsl::date.ge(sql("now() - interval '46 day'")))
                .load(conn)
        })
        .await
        .map_err(error_500_handler)?
        .map_err(error_500_handler)?
        .into_iter()
        .map(
            |history: ActivityTimeHistory| RoleEaterAPIActivityTimeHistory {
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

#[derive(Deserialize, Serialize, Debug)]
pub struct RoleEaterAPIGuildUserActivityResponse {
    pub guild_id: String,
    pub user_id: String,
    pub data: Vec<RoleEaterAPIGuildActivityData>,
}

async fn guild_user_activity_latest_route_handler(
    State(state): State<AppState>,
    Path((guild_id, user_id)): Path<(String, String)>,
) -> Result<Json<RoleEaterAPIGuildUserActivityLatestResponse>, (StatusCode, Markup)> {
    let user_connection = state.user_pool.get().await.map_err(error_500_handler)?;

    let uid = user_id.clone();
    let user_data: ActivityUserData = user_connection
        .interact(move |conn| {
            activity_user_data::table
                .filter(activity_user_data::dsl::user_id.eq(uid))
                .first(conn)
        })
        .await
        .map_err(error_500_handler)?
        .map_err(error_500_handler)?;

    let mut game_start_time: Option<String> = None;
    if user_data.current_game_start_time.is_some() {
        game_start_time = Some(
            user_data
                .current_game_start_time
                .unwrap()
                .format(DATE_FORMAT_ISO8601_NO_MS)
                .to_string(),
        );
    }

    let mut song_start_time: Option<String> = None;
    if user_data.current_game_start_time.is_some() {
        song_start_time = Some(
            user_data
                .current_song_start_time
                .unwrap()
                .format(DATE_FORMAT_ISO8601_NO_MS)
                .to_string(),
        );
    }

    Ok(Json(RoleEaterAPIGuildUserActivityLatestResponse {
        guild_id,
        user_id,
        last_played_game_title: user_data.last_played_game_title,
        last_played_game_time: user_data.last_played_game_time,
        last_played_song_title: user_data.last_played_song_title,
        last_played_song_time: user_data.last_played_song_time,
        last_played_song_artist: user_data.last_played_song_artist,
        current_game_title: user_data.current_game_title,
        current_game_start_time: game_start_time,
        current_song_title: user_data.current_song_title,
        current_song_artist: user_data.current_song_artist,
        current_song_start_time: song_start_time,
    }))
}

#[derive(Deserialize, Serialize, Debug)]
pub struct RoleEaterAPIGuildUserActivityLatestResponse {
    pub guild_id: String,
    pub user_id: String,
    pub last_played_game_title: Option<String>,
    pub last_played_game_time: Option<f64>,
    pub last_played_song_title: Option<String>,
    pub last_played_song_time: Option<f64>,
    pub last_played_song_artist: Option<String>,
    pub current_game_title: Option<String>,
    pub current_game_start_time: Option<String>,
    pub current_song_title: Option<String>,
    pub current_song_artist: Option<String>,
    pub current_song_start_time: Option<String>,
}

#[derive(Deserialize)]
struct GuildUserActivityExtraParams {
    pub limit: Option<usize>,
}

async fn guild_user_activity_game_route_handler(
    State(state): State<AppState>,
    Path((guild_id, user_id)): Path<(String, String)>,
    query: Query<GuildUserActivityExtraParams>,
) -> Result<Json<RoleEaterAPIGuildUserActivityGameResponse>, (StatusCode, Markup)> {
    let user_connection = state.user_pool.get().await.map_err(error_500_handler)?;

    let uid = user_id.clone();
    let user_data: Vec<RoleEaterAPIGuildUserActivityGameData> = user_connection
        .interact(move |conn| match query.0.limit.is_some() {
            true => activity_game_history::table
                .filter(activity_game_history::dsl::user_id.eq(uid))
                .order(activity_game_history::dsl::time_played.desc())
                .limit(query.0.limit.unwrap() as i64)
                .load(conn),
            false => activity_game_history::table
                .filter(activity_game_history::dsl::user_id.eq(uid))
                .order(activity_game_history::dsl::time_played.desc())
                .load(conn),
        })
        .await
        .map_err(error_500_handler)?
        .map_err(error_500_handler)?
        .into_iter()
        .map(
            |activity: ActivityGameHistory| RoleEaterAPIGuildUserActivityGameData {
                game_title: activity.game_title,
                play_count: activity.play_count,
                time_played: activity.time_played,
            },
        )
        .collect();

    Ok(Json(RoleEaterAPIGuildUserActivityGameResponse {
        guild_id,
        user_id,
        data: user_data,
    }))
}

#[derive(Deserialize, Serialize, Debug)]
pub struct RoleEaterAPIGuildUserActivityGameResponse {
    pub guild_id: String,
    pub user_id: String,
    pub data: Vec<RoleEaterAPIGuildUserActivityGameData>,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct RoleEaterAPIGuildUserActivityGameData {
    pub game_title: String,
    pub play_count: i64,
    pub time_played: f64,
}

async fn guild_user_activity_music_route_handler(
    State(state): State<AppState>,
    Path((guild_id, user_id)): Path<(String, String)>,
    query: Query<GuildUserActivityExtraParams>,
) -> Result<Json<RoleEaterAPIGuildUserActivityMusicResponse>, (StatusCode, Markup)> {
    let user_connection = state.user_pool.get().await.map_err(error_500_handler)?;

    let uid = user_id.clone();
    let user_data: Vec<RoleEaterAPIGuildUserActivityMusicData> = user_connection
        .interact(move |conn| match query.0.limit.is_some() {
            true => activity_music_history::table
                .filter(activity_music_history::dsl::user_id.eq(uid))
                .order(activity_music_history::dsl::time_played.desc())
                .limit(query.0.limit.unwrap() as i64)
                .load(conn),
            false => activity_music_history::table
                .filter(activity_music_history::dsl::user_id.eq(uid))
                .order(activity_music_history::dsl::time_played.desc())
                .load(conn),
        })
        .await
        .map_err(error_500_handler)?
        .map_err(error_500_handler)?
        .into_iter()
        .map(
            |activity: ActivityMusicHistory| RoleEaterAPIGuildUserActivityMusicData {
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
        data: user_data,
    }))
}

#[derive(Deserialize, Serialize, Debug)]
pub struct RoleEaterAPIGuildUserActivityMusicResponse {
    pub guild_id: String,
    pub user_id: String,
    pub data: Vec<RoleEaterAPIGuildUserActivityMusicData>,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct RoleEaterAPIGuildUserActivityMusicData {
    pub song_title: String,
    pub song_artist: String,
    pub play_count: i64,
    pub time_played: f64,
}

#[derive(Serialize, Deserialize)]
pub struct RoleEaterAPIGuildUserHiddenSensitive {
    pub user_id: String,
    pub guild_id: String,
    pub username: String,
    pub display_name: Option<String>,
    pub global_name: Option<String>,
    pub nickname: Option<String>,
    pub avatar: Option<String>,
    pub banner: Option<String>,
    pub message_count: i64,
    pub voice_time: f64,
    pub total: f64,
    pub user_left: bool,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct RoleEaterAPIGuildActivityData {
    pub date: String,
    pub message_count: i64,
    pub voice_time: f64,
    pub game_time: f64,
    pub game_count: i64,
    pub music_time: f64,
    pub music_count: i64,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct RoleEaterAPIGuildActivityUserData {
    pub user_id: String,
    pub date: String,
    pub message_count: i64,
    pub voice_time: f64,
    pub game_time: f64,
    pub game_count: i64,
    pub music_time: f64,
    pub music_count: i64,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct RoleEaterAPIVoiceMessageHistory {
    pub user_id: String,
    pub guild_id: String,
    pub date: String,
    pub message_count: i64,
    pub voice_time: f64,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct RoleEaterAPIActivityTimeHistory {
    pub user_id: String,
    pub date: String,
    pub game_time: f64,
    pub game_count: i64,
    pub music_time: f64,
    pub music_count: i64,
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
