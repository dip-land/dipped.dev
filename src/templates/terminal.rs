use maud::{Markup, html};

#[derive(PartialEq)]
pub enum TerminalType {
    Normal,
    StatusPage,
}

pub fn main(children: Vec<Markup>, terminal_type: TerminalType) -> Markup {
    html! {
        div class="terminal" {
            div class="terminal-header" {
                div class="left" {
                    img src="/favicon.ico" {}
                    span { "dipped.dev" }
                }
                div class="center" {
                    @if terminal_type == TerminalType::Normal {
                        span id="terminal_path" { "~" }
                    } @else {
                        span { "error" }
                    }
                }
                div class="right" {}
            }
            div id="terminal-content" class="terminal-content" {
                @for child in &children {
                    (child)
                }
            }
            div class="terminal-footer" {
                div class="left" {
                    img src="/favicon.ico" {}
                    span { "dipped.dev" }
                }
                div class="center" {
                    span { "Ready" }
                }
                div class="right" {
                    span id="line_count" { "0 lines" }
                }
            }
        }
    }
}

pub struct ButtonOptions<'a> {
    pub href: &'a str,
    pub external: bool,
    pub content: &'a str,
    pub button_number: Option<i8>,
    pub disabled: bool,
    pub inline: bool,
    pub style: ButtonStyle,
}

#[derive(PartialEq)]
pub enum ButtonStyle {
    Default,
    Action,
}

pub fn button(options: ButtonOptions) -> Markup {
    let mut classlist = "terminal-button";

    if options.inline {
        classlist = "terminal-button inline";
    }

    let mut svg = html! {
        svg aria-hidden="true" role="img" width="16" height="16" viewBox="0 0 24 24" {
            path fill="currentColor" d="M8.59 16.58L13.17 12L8.59 7.41L10 6l6 6l-6 6z" {}
        }
    };

    if options.external {
        svg = html! {
            svg aria-hidden="true" role="img" width="14" height="14" viewBox="0 0 24 24" {
                path fill="currentColor" d="M14 3v2h3.59l-9.83 9.83l1.41 1.41L19 6.41V10h2V3m-2 16H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2z" {}
            }
        }
    }

    html! {
        @if options.disabled {
            button class=(classlist) data-href=(options.href) data-external=(options.external) disabled {
                @if options.style == ButtonStyle::Action {
                    span class="indicator" { "▶" }
                }
                span class="btn-text" style="text-align: left;" {
                    (options.content);
                    @if options.button_number.is_some() {
                        span style="color: rgb(201, 209, 217); font-weight: bold;" { "[" (options.button_number.unwrap()) "]" }
                    }
                }
                (svg)
            }
        } @else {
            button class=(classlist) data-href=(options.href) data-external=(options.external) {
                @if options.style == ButtonStyle::Action {
                    span class="indicator" { "▶" }
                }
                span class="btn-text" style="text-align: left;" {
                    (options.content);
                    @if options.button_number.is_some() {
                        span style="color: rgb(201, 209, 217); font-weight: bold;" { "[" (options.button_number.unwrap()) "]" }
                    }
                }
                (svg)
            }
        }

    }
}

pub fn divider(content: &str) -> Markup {
    html! {
        div class="terminal-divider" {
            span class="divider-line" {}
            span class="divider-text" { (content) }
            span class="divider-line" {}
        }
    }
}

pub fn group(children: Vec<Markup>, inline: bool, style: &str) -> Markup {
    let mut class = "terminal-group";

    if inline {
        class = "terminal-group inline"
    }

    html! {
        div class=(class) style=(style) {
            @for child in &children {
                (child)
            }
        }
    }
}

pub fn inline_group(children: Vec<Markup>) -> Markup {
    html! {
        div class="terminal-inline-group" {
            @for child in &children {
                (child)
            }
        }
    }
}

pub fn image(src: &str, alt: &str, inline: bool, style: &str) -> Markup {
    let mut class = "terminal-image";
    if inline {
        class = "terminal-image inline-image"
    }
    html! {
        div class=(class) {
            img src=(src) alt=(alt) style=(style) {}
        }
    }
}

pub fn grid(children: Vec<Markup>) -> Markup {
    html! {
        div class="terminal-grid" {
            @for child in &children {
                (child)
            }
        }
    }
}
