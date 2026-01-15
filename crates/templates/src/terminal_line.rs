use maud::{Markup, html};

const USER: &str = "dipped";
const HOST: &str = "dev";

pub fn blank() -> Markup {
    html! {
        div class="terminal_line blank" {}
    }
}

pub fn command(content: &str) -> Markup {
    html! {
        div class="terminal_line command" {
            span class="prompt" {
                span class="user" { (USER) }
                span class="at" { "@" }
                span class="host" { (HOST) }
                span class="separator" { ":" }
                span class="path" { "~" }
                span class="symbol" { "$" }
                span class="content" { (content) }
            }
        }
    }
}

pub fn command_cursor() -> Markup {
    html! {
        div class="terminal_line command" {
            span class="prompt" {
                span class="user" { (USER) }
                span class="at" { "@" }
                span class="host" { (HOST) }
                span class="separator" { ":" }
                span class="path" { "~" }
                span class="symbol" { "$" }
                span class="cursor blink" {}
            }
        }
    }
}

pub fn header(content: &str) -> Markup {
    html! {
        div class="terminal_line header" {
            span class="content" {
                svg aria-hidden="true" role="img" class="header-icon" width="25" height="25" viewBox="0 0 24 24" {
                    path fill="currentColor" d="m5.41 21l.71-4h-4l.35-2h4l1.06-6h-4l.35-2h4l.71-4h2l-.71 4h6l.71-4h2l-.71 4h4l-.35 2h-4l-1.06 6h4l-.35 2h-4l-.71 4h-2l.71-4h-6l-.71 4zM9.53 9l-1.06 6h6l1.06-6z" {}
                }
                (content)
            }
        }
    }
}

pub fn output(content: &str) -> Markup {
    html! {
        div class="terminal_line output" {
            span class="nowrap" {
                span style="color: rgb(214, 214, 214);" { (content) }
            }
        }
    }
}

pub fn output_alt(content: &str) -> Markup {
    html! {
        div class="terminal_line output_alt" {
            span class="nowrap" {
                span style="color: rgb(214, 214, 214);" { (content) }
            }
        }
    }
}

pub fn info(content: &str) -> Markup {
    html! {
        div class="terminal_line info" {
            span class="nowrap" {
                span { "› " (content) }
            }
        }
    }
}

pub fn comment(content: &str) -> Markup {
    html! {
        div class="terminal_line comment" {
            span class="nowrap" {
                span style="color: rgb(148, 148, 148); font-style: italic;" { "# " (content) }
            }
        }
    }
}

pub fn error(content: &str) -> Markup {
    html! {
        div class="terminal_line error" {
            span class="nowrap" {
                span style="color: rgb(255, 123, 114); font-weight: bold;" { "✗ " (content) }
            }
        }
    }
}
