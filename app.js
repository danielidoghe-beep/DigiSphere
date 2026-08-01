// ===============================
// DigiSphere Homepage
// app.js
// ===============================

const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.querySelector(".mobile-menu");

menuBtn.addEventListener("click", () => {

    mobileMenu.classList.toggle("show");

    const icon = menuBtn.querySelector("i");

    if (mobileMenu.classList.contains("show")) {

        icon.classList.remove("ri-menu-3-line");
        icon.classList.add("ri-close-line");

    } else {

        icon.classList.remove("ri-close-line");
        icon.classList.add("ri-menu-3-line");

    }

});

// Close menu when a link is clicked

document.querySelectorAll(".mobile-menu a").forEach(link => {

    link.addEventListener("click", () => {

        mobileMenu.classList.remove("show");

        const icon = menuBtn.querySelector("i");

        icon.classList.remove("ri-close-line");
        icon.classList.add("ri-menu-3-line");

    });

});

// Close menu if user taps outside

document.addEventListener("click", (e) => {

    if (
        !mobileMenu.contains(e.target) &&
        !menuBtn.contains(e.target)
    ) {

        mobileMenu.classList.remove("show");

        const icon = menuBtn.querySelector("i");

        icon.classList.remove("ri-close-line");
        icon.classList.add("ri-menu-3-line");

    }

});

// Theme Toggle

const themeBtn = document.getElementById("themeBtn");

themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    const icon = themeBtn.querySelector("i");

    if(document.body.classList.contains("dark")){

        icon.classList.remove("ri-sun-line");
        icon.classList.add("ri-moon-line");

        localStorage.setItem("theme","dark");

    }else{

        icon.classList.remove("ri-moon-line");
        icon.classList.add("ri-sun-line");

        localStorage.setItem("theme","light");

    }

});

// Load saved theme

window.addEventListener("load",()=>{

    const savedTheme = localStorage.getItem("theme");

    if(savedTheme==="dark"){

        document.body.classList.add("dark");

        themeBtn.querySelector("i").classList.remove("ri-sun-line");
        themeBtn.querySelector("i").classList.add("ri-moon-line");

    }

});
