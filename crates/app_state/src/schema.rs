diesel::table! {
    guild_data (guild_id) {
        guild_id -> VarChar,
        name -> VarChar,
        icon -> Nullable<VarChar>,
        banner -> Nullable<VarChar>,
        stat_exclusion_channels -> Array<VarChar>
    }
}

diesel::table! {
    roles (role_id, guild_id) {
        role_id -> VarChar,
        guild_id -> VarChar,
        creator_id -> Nullable<VarChar>,
        name -> Nullable<VarChar>,
        color -> VarChar,
        is_admin -> Bool
    }
}

diesel::table! {
    activity_game_history (user_id) {
        user_id -> VarChar,
        game_title -> VarChar,
        play_count -> BigInt,
        time_played -> Double
    }
}

diesel::table! {
    activity_music_history (user_id) {
        user_id -> VarChar,
        song_title -> VarChar,
        song_artist -> VarChar,
        play_count -> BigInt,
        time_played -> Double
    }
}

diesel::table! {
    activity_time_history (user_id) {
        user_id -> VarChar,
        date -> Date,
        game_time -> Double,
        game_count -> BigInt,
        music_time -> Double,
        music_count -> BigInt
    }
}

diesel::table! {
    activity_user_data (user_id) {
        user_id -> VarChar,
        last_played_game_title -> Nullable<VarChar>,
        last_played_game_time -> Nullable<Double>,
        last_played_song_title -> Nullable<VarChar>,
        last_played_song_time -> Nullable<Double>,
        last_played_song_artist -> Nullable<VarChar>,
        current_game_title -> Nullable<VarChar>,
        current_game_start_time -> Nullable<Timestamp>,
        current_song_title -> Nullable<VarChar>,
        current_song_artist -> Nullable<VarChar>,
        current_song_start_time -> Nullable<Timestamp>
    }
}

diesel::table! {
    user_asset (user_id, guild_id) {
        user_id -> VarChar,
        guild_id -> VarChar,
        asset -> Text
    }
}

diesel::table! {
    user_data (user_id, guild_id) {
        user_id -> VarChar,
        guild_id -> VarChar,
        username -> VarChar,
        display_name -> Nullable<VarChar>,
        global_name -> Nullable<VarChar>,
        nickname -> Nullable<VarChar>,
        avatar -> Nullable<VarChar>,
        banner -> Nullable<VarChar>,
        message_count -> BigInt,
        voice_time -> Double,
        total -> Double,
        voice_channel_id -> Nullable<VarChar>,
        voice_channel_join_time -> Nullable<VarChar>,
        user_left -> Bool,
        join_date -> Timestamptz,
        creation_date -> Timestamptz
    }
}

diesel::table! {
    voice_message_history (user_id, guild_id) {
        user_id -> VarChar,
        guild_id -> VarChar,
        date -> Date,
        message_count -> BigInt,
        voice_time -> Double
    }
}
