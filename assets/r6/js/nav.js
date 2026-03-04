let nav_select_link = document.getElementById("nav_select");
let nav_all_link = document.getElementById("nav_all");
let nav_ffa_link = document.getElementById("nav_ffa");

if (location.pathname === "/") {
    nav_select_link.classList.add("active");
} else if (location.pathname.includes("random")) {
    nav_all_link.classList.add("active");
} else if (location.pathname.includes("ffa")) {
    nav_ffa_link.classList.add("active");
}

