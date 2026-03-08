use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Copy, Clone, Debug, PartialEq, PartialOrd, Eq)]
pub enum ServerStatus {
    Deleted,
    Current,
    Archived,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, PartialOrd, Eq)]
pub enum ServerOnlineStatus {
    Offline,
    Online,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum ServerSortOptions {
    NameAscending,
    NameDescending,
    StartDateAscending,
    StartDateDescending,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum ServerFilterOptions {
    All,
    Current,
    Archived,
    Deleted,
}

#[derive(Deserialize, Clone)]
pub struct SortingOptions {
    // None, all, current, archived
    pub filter: Option<String>,
    // None, default, asc, desc
    pub sort: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct McssServer {
    pub server_id: String,
    pub status: i32,
    pub name: String,
    pub description: String,
    pub path_to_folder: String,
    pub folder_name: String,
    #[serde(rename = "type", alias = "type")]
    pub server_type: String,
    pub creation_date: String,
    pub is_set_to_auto_start: bool,
    pub force_save_on_stop: bool,
    pub keep_online: i32,
    pub java_allocated_memory: i64,
    pub java_startup_line: String,
    pub server_permissions: Vec<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct McssServerStats {
    pub latest: McssServerStatsLatest,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct McssServerStatsLatest {
    pub cpu: Option<u8>,
    pub memory_used: Option<i32>,
    pub memory_limit: Option<i32>,
    pub players_online: Option<u8>,
    pub player_limit: Option<u8>,
    pub start_date: Option<i32>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct WebConfig {
    pub pack: WebConfigPack,
    pub server: ServerDates,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct WebConfigPack {
    pub id: String,
    #[serde(rename = "fileId")]
    pub file_id: String,
    pub version: String,
    pub download: String,
    pub url: String,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, PartialOrd, Eq)]
pub struct ServerDates {
    pub start: String,
    pub end: String,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct McssServerConfig {
    pub guid: String,
    pub server_type_guid: String,
    pub name: String,
    pub description: String,
    pub creation_date: String,
    pub autostart: bool,
    pub force_save_on_stop: bool,
    pub stop_prevention: String,
    pub startup_methode: String,
    pub allocated_memory: i64,
    pub allocated_memory_suffix: String,
    pub startup_line: String,
    pub startup_bat_filename: Option<String>,
    pub server_file_checksum: String,
    pub server_file_version: String,
    pub java_path_override: String,
    pub tasks: McssServerTasks,
    pub backups: McssServerBackups,
    pub sub_servers: Vec<String>,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct McssServerTasks {
    pub scheduled_tasks: Vec<McssServerTask>,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct McssServerTask {
    pub guid: String,
    pub name: String,
    pub player_requirement: String,
    pub timing: Option<McssServerTaskTiming>,
    pub job: Option<McssServerTaskJob>,
    pub jobs: Vec<McssServerTaskJob>,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct McssServerTaskTiming {
    pub time: String,
    pub repeat: bool,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct McssServerTaskJob {
    pub commands: Option<Vec<String>>,
    pub delay: Option<i64>,
    pub job_id: String,
    pub enabled: bool,
    pub order: i32,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct McssServerBackups {
    pub backup_templates: Vec<McssServerBackupTemplate>,
    pub backup_history: Vec<McssServerBackupHistory>,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct McssServerBackupTemplate {
    pub identifier: String,
    pub template_name: String,
    pub destination: String,
    pub compression: String,
    pub protocol: String,
    pub previous_status: String,
    pub delete_old_backups: bool,
    pub suspend_server: bool,
    pub last_run: String,
    pub file_blacklist: Vec<String>,
    pub folder_blacklist: Vec<String>,
}

// This is probably not the correct layout of a backup, but it's better than nothing
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct McssServerBackupHistory {
    pub name: String,
    pub destination: String,
    pub status: String,
    pub protocol: String,
    pub log_message: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Server {
    pub id: String,
    pub status: ServerStatus,
    pub online: ServerOnlineStatus,
    pub version: String,
    pub name: String,
    pub identifier: String,
    pub start_date: String,
    pub end_date: String,
    pub install_link: String,
    pub view_pack_link: String,
    pub players: Option<u8>,
    pub path: String,
    pub world_download: bool,
    pub pack_download: bool,
    pub map_available: bool,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ServerData {
    pub id: String,
    pub status: ServerStatus,
    pub online: ServerOnlineStatus,
    pub version: String,
    pub name: String,
    pub identifier: String,
    pub start_date: String,
    pub end_date: String,
    pub install_link: String,
    pub view_pack_link: String,
    pub players: Option<u8>,
    pub world_download: bool,
    pub pack_download: bool,
    pub map_available: bool,
}
