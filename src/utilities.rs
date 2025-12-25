use axum::response::Html;
use std::{fs::File, io, io::Read, path::Path};

#[allow(dead_code)]
pub enum PageTemplatePosition {
    HeadPrepend,
    HeadAppend,
    BodyPrepend,
    BodyAppend,
}

pub struct PageTemplate {
    pub pos: PageTemplatePosition,
    pub template: String,
}

pub fn create_page(
    head_files: &[&str],
    body_files: &[&str],
    templates: Option<&[PageTemplate]>,
) -> Html<String> {
    let (mut head_data, mut body_data) = (combine_files(head_files), combine_files(body_files));
    if let Some(_templates) = templates {
        for template in _templates {
            if let PageTemplatePosition::BodyAppend = template.pos {
                body_data.push_str(template.template.as_str());
            } else if let PageTemplatePosition::HeadAppend = template.pos {
                head_data.push_str(template.template.as_str());
            }
        }
        for template in _templates.iter().rev() {
            if let PageTemplatePosition::BodyPrepend = template.pos {
                body_data.insert_str(0, template.template.as_str());
            } else if let PageTemplatePosition::HeadPrepend = template.pos {
                head_data.insert_str(0, template.template.as_str());
            }
        }
    }
    Html(format!(
        "<html>\n<head>\n{head_data}</head>\n<body>\n{body_data}</body>\n</html>"
    ))
}

pub fn combine_files(paths: &[&str]) -> String {
    let mut data = vec!["".to_string(); paths.len()];
    for path in paths {
        data.push(
            read_file(path).unwrap_or_else(|_| "<h1>Error loading HTML file</h1>".to_string()),
        )
    }
    data.join("\n")
}

pub fn read_file<P: AsRef<Path>>(path: P) -> io::Result<String> {
    let mut file = File::open(path)?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    Ok(contents)
}
