const toggle = document.getElementById("themeToggle");

function applyTheme(theme){

    if(theme === "dark"){

        document.body.classList.add("dark");

        if(toggle){
            toggle.innerHTML = '<i class="ri-sun-line"></i>';
        }

    }else{

        document.body.classList.remove("dark");

        if(toggle){
            toggle.innerHTML = '<i class="ri-moon-line"></i>';
        }

    }

}

const savedTheme = localStorage.getItem("theme") || "light";

applyTheme(savedTheme);

if(toggle){

    toggle.addEventListener("click",()=>{

        const newTheme = document.body.classList.contains("dark")
            ? "light"
            : "dark";

        localStorage.setItem("theme",newTheme);

        applyTheme(newTheme);

    });

}
