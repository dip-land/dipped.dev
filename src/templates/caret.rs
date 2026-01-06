use maud::{Markup, html};

pub fn main(rotated: bool) -> Markup {
    let mut classlist = "";
    if rotated {
        classlist = "rotated";
    }
    html! {
        svg id="caret" class=(classlist) width="20" height="20" viewbox="0 0 24 24" fill="none" {
            path d="M7 14.5l5-5 5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" {}
        }
    }
}
