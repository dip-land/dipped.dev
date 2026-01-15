#[macro_use]
extern crate dotenv_codegen;
extern crate dotenv;

use app_state::{
    McssServer, McssServerConfig, McssServerStats, Server, ServerOnlineStatus, ServerStatus,
    WebConfig,
};
use chrono::NaiveDate;
use std::fs::read_dir;
use std::path::Path as std_path;
use tokio::{fs::File, io::AsyncReadExt};

pub mod api;
pub mod dashboard;

pub async fn get_servers() -> Vec<Server> {
    let client = reqwest::Client::new();
    let res = client
        .get(format!(
            "http://{}:{}/api/v2/servers",
            dotenv!("HOST_IP"),
            dotenv!("MCSS_PORT")
        ))
        .header("apiKey", dotenv!("MCSS_KEY"))
        .send()
        .await
        .unwrap();

    let mcss_servers = match res.json::<Vec<McssServer>>().await {
        Ok(v) => v,
        Err(err) => {
            println!("{:?}", err);
            Vec::new()
        }
    };

    let mut parsed_servers: Vec<Server> = Vec::new();
    for server in mcss_servers {
        let web_config =
            File::open(std_path::new(&server.path_to_folder).join("./webConfig.json")).await;
        if web_config.is_err() {
            continue;
        }

        let mut web_config = web_config.unwrap();

        let mut web_config_contents = String::new();
        web_config
            .read_to_string(&mut web_config_contents)
            .await
            .unwrap();
        let web_config = serde_json::from_str::<WebConfig>(web_config_contents.as_str()).unwrap();

        let mut server_link_type = "curseforge";
        if web_config.pack.url.contains("modrinth") {
            server_link_type = "modrinth";
        }
        let mut install_link = web_config.pack.download;
        if server_link_type == "curseforge" {
            install_link = install_link
                .replace("PACKID", web_config.pack.id.as_str())
                .replace("FILEID", web_config.pack.file_id.as_str())
        }

        let world_download = std_path::new(&server.path_to_folder)
            .join("./world.zip")
            .exists();
        let pack_download = std_path::new(&server.path_to_folder)
            .join("./pack.zip")
            .exists();
        let map_available = std_path::new(&server.path_to_folder).join("./map").exists();
        parsed_servers.push(Server {
            id: server.server_id,
            status: ServerStatus::Current,
            online: ServerOnlineStatus::Offline,
            version: web_config.pack.version,
            name: server.name,
            identifier: server.folder_name,
            start_date: web_config.server.start,
            end_date: web_config.server.end,
            install_link,
            view_pack_link: web_config.pack.url,
            players: Some(0),
            path: server.path_to_folder,
            world_download,
            pack_download,
            map_available,
        });
    }
    for server_dir in read_dir(dotenv!("ARCHIVED_SERVERS_PATH"))
        .unwrap()
        .flatten()
    {
        let mcss_config_path = &server_dir.path().join("./mcss_server_config.json");
        let web_config_path = &server_dir.path().join("./webConfig.json");
        let mcss_config = File::open(mcss_config_path).await;
        let web_config = File::open(web_config_path).await;
        if mcss_config.is_err() || web_config.is_err() {
            continue;
        }

        let mut mcss_config = mcss_config.unwrap();
        let mut web_config = web_config.unwrap();

        let mut mcss_config_contents = String::new();
        mcss_config
            .read_to_string(&mut mcss_config_contents)
            .await
            .unwrap();
        let mcss_config =
            serde_json::from_str::<McssServerConfig>(mcss_config_contents.as_str()).unwrap();

        let mut web_config_contents = String::new();
        web_config
            .read_to_string(&mut web_config_contents)
            .await
            .unwrap();
        let web_config = serde_json::from_str::<WebConfig>(web_config_contents.as_str()).unwrap();

        let mut status = ServerStatus::Archived;
        if !std_path::new(&server_dir.path()).join("./mods").exists() {
            status = ServerStatus::Deleted
        }

        let mut server_link_type = "curseforge";
        if web_config.pack.url.contains("modrinth") {
            server_link_type = "modrinth";
        }
        let mut install_link = web_config.pack.download;
        if server_link_type == "curseforge" {
            install_link = install_link
                .replace("PACKID", web_config.pack.id.as_str())
                .replace("FILEID", web_config.pack.file_id.as_str())
        }

        let world_download = std_path::new(&server_dir.path())
            .join("./world.zip")
            .exists();
        let pack_download = std_path::new(&server_dir.path())
            .join("./pack.zip")
            .exists();
        let map_available = std_path::new(&server_dir.path()).join("./map").exists();
        parsed_servers.push(Server {
            id: mcss_config.guid,
            status,
            online: ServerOnlineStatus::Offline,
            version: web_config.pack.version,
            name: mcss_config.name,
            identifier: server_dir.file_name().into_string().unwrap(),
            start_date: web_config.server.start,
            end_date: web_config.server.end,
            install_link,
            view_pack_link: web_config.pack.url,
            players: Some(0),
            path: server_dir.path().to_str().unwrap().to_string(),
            world_download,
            pack_download,
            map_available,
        });
    }
    parsed_servers.sort_by(|a, b| {
        let a_values: Vec<u32> = a
            .start_date
            .split("/")
            .map(|v| v.parse::<u32>().unwrap())
            .collect();
        let a_date = NaiveDate::from_ymd_opt(a_values[2] as i32, a_values[0], a_values[1]).unwrap();
        let b_values: Vec<u32> = b
            .start_date
            .split("/")
            .map(|v| v.parse::<u32>().unwrap())
            .collect();
        let b_date = NaiveDate::from_ymd_opt(b_values[2] as i32, b_values[0], b_values[1]).unwrap();
        b_date.cmp(&a_date)
    });
    parsed_servers
}

pub async fn get_server_stats(id: String) -> McssServerStats {
    let client = reqwest::Client::new();
    let res = client
        .get(format!(
            "http://{}:{}/api/v2/servers/{}/stats",
            dotenv!("HOST_IP"),
            dotenv!("MCSS_PORT"),
            id
        ))
        .header("apiKey", dotenv!("MCSS_KEY"))
        .send()
        .await
        .unwrap();
    res.json::<McssServerStats>().await.unwrap()
}
