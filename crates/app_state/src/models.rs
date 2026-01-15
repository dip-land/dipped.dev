use chrono::prelude::*;
use diesel::prelude::*;

#[derive(Queryable, Debug, Identifiable)]
#[diesel(table_name = crate::schema::guild_data)]
#[diesel(check_for_backend(diesel::pg::Pg))]
#[diesel(primary_key(guild_id))]
pub struct GuildData {
    pub guild_id: String,
    pub name: String,
    pub icon: Option<String>,
    pub banner: Option<String>,
    pub stat_exclusion_channels: Vec<String>,
}

#[derive(Queryable, Debug, Identifiable)]
#[diesel(table_name = crate::schema::roles)]
#[diesel(check_for_backend(diesel::pg::Pg))]
#[diesel(primary_key(role_id, guild_id))]
pub struct Role {
    pub role_id: String,
    pub guild_id: String,
    pub creator_id: Option<String>,
    pub name: Option<String>,
    pub color: String,
    pub is_admin: bool,
}

#[derive(Queryable, Debug, Identifiable)]
#[diesel(table_name = crate::schema::activity_game_history)]
#[diesel(check_for_backend(diesel::pg::Pg))]
#[diesel(primary_key(user_id))]
pub struct ActivityGameHistory {
    pub user_id: String,
    pub game_title: String,
    pub play_count: i64,
    pub time_played: f64,
}

#[derive(Queryable, Debug, Identifiable)]
#[diesel(table_name = crate::schema::activity_music_history)]
#[diesel(check_for_backend(diesel::pg::Pg))]
#[diesel(primary_key(user_id))]
pub struct ActivityMusicHistory {
    pub user_id: String,
    pub song_title: String,
    pub song_artist: String,
    pub play_count: i64,
    pub time_played: f64,
}

#[derive(Queryable, Debug, Identifiable)]
#[diesel(table_name = crate::schema::activity_time_history)]
#[diesel(check_for_backend(diesel::pg::Pg))]
#[diesel(primary_key(user_id))]
pub struct ActivityTimeHistory {
    pub user_id: String,
    pub date: NaiveDate,
    pub game_time: f64,
    pub game_count: i64,
    pub music_time: f64,
    pub music_count: i64,
}

#[derive(Queryable, Debug, Identifiable)]
#[diesel(table_name = crate::schema::activity_user_data)]
#[diesel(check_for_backend(diesel::pg::Pg))]
#[diesel(primary_key(user_id))]
pub struct ActivityUserData {
    pub user_id: String,
    pub last_played_game_title: Option<String>,
    pub last_played_game_time: Option<f64>,
    pub last_played_song_title: Option<String>,
    pub last_played_song_time: Option<f64>,
    pub last_played_song_artist: Option<String>,
    pub current_game_title: Option<String>,
    pub current_game_start_time: Option<NaiveDateTime>,
    pub current_song_title: Option<String>,
    pub current_song_artist: Option<String>,
    pub current_song_start_time: Option<NaiveDateTime>,
}

#[derive(Queryable, Debug, Identifiable)]
#[diesel(table_name = crate::schema::user_asset)]
#[diesel(check_for_backend(diesel::pg::Pg))]
#[diesel(primary_key(user_id, guild_id))]
pub struct UserAsset {
    pub user_id: String,
    pub guild_id: String,
    pub asset: String,
}

#[derive(Queryable, Debug, Identifiable, Clone)]
#[diesel(table_name = crate::schema::user_data)]
#[diesel(check_for_backend(diesel::pg::Pg))]
#[diesel(primary_key(user_id, guild_id))]
pub struct UserData {
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
    pub voice_channel_id: Option<String>,
    pub voice_channel_join_time: Option<String>,
    pub user_left: bool,
    pub join_date: NaiveDateTime,
    pub creation_date: NaiveDateTime,
}

#[derive(Queryable, Debug, Identifiable)]
#[diesel(table_name = crate::schema::voice_message_history)]
#[diesel(check_for_backend(diesel::pg::Pg))]
#[diesel(primary_key(user_id, guild_id))]
pub struct VoiceMessageHistory {
    pub user_id: String,
    pub guild_id: String,
    pub date: NaiveDate,
    pub message_count: i64,
    pub voice_time: f64,
}
