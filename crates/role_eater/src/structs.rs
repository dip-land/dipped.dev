use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
pub struct RoleEaterAPIServersResponse {
    pub id: String,
    pub name: String,
    pub icon: Option<String>,
    pub banner: Option<String>,
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
    pub role_count: u64,
    pub user_count: i64,
    pub users: Vec<RoleEaterAPIGuildUserHiddenSensitive>,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct RoleEaterAPIGuildActivityResponse {
    pub guild_id: String,
    pub data: Vec<RoleEaterAPIGuildActivityData>,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct RoleEaterAPIGuildPositionsResponse {
    pub guild_id: String,
    pub total: Vec<String>,
    pub voice: Vec<String>,
    pub message: Vec<String>,
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

#[derive(Deserialize, Serialize, Debug)]
pub struct RoleEaterAPIGuildUserActivityResponse {
    pub guild_id: String,
    pub user_id: String,
    pub data: Vec<RoleEaterAPIGuildActivityData>,
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
pub struct GuildUserActivityExtraParams {
    pub limit: Option<usize>,
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
