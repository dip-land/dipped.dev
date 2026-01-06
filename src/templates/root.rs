use maud::{Markup, html};

pub fn main(head: Vec<Markup>, body: Vec<Markup>) -> Markup {
    html! {
        head { 
            @for child in &head {
                (child)
            }
        }
        body { 
            @for child in &body {
                (child)
            }
        }
    }
}

pub fn main_section(children: Vec<Markup>) -> Markup {
    html! {
        main {
            div class="content-container" {
                @for child in &children {
                    (child)
                }
            }
        }
    }
}
