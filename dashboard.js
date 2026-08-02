import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    getFirestore,
    doc,
    onSnapshot,
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

/* ==========================================
   FIREBASE
========================================== */

const firebaseConfig = {
    apiKey: "AIzaSyDnpsEIlXwPLSCJAGMS7feM2JMhmxzCCfs",
    authDomain: "digisphere-66fdf.firebaseapp.com",
    projectId: "digisphere-66fdf",
    storageBucket: "digisphere-66fdf.firebasestorage.app",
    messagingSenderId: "834194884246",
    appId: "1:834194884246:web:72672ca253c3d7dd9d24b7",
    measurementId: "G-19QS4036V7"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

/* ==========================================
   ELEMENTS
========================================== */

const loader = document.getElementById("loader");

const menuBtn = document.getElementById("menuBtn");
const closeSidebar = document.getElementById("closeSidebar");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

const logoutBtn = document.getElementById("logoutBtn");

const userName = document.getElementById("userName");
const userAvatar = document.getElementById("userAvatar");

const walletBalance = document.getElementById("walletBalance");
const topWallet = document.getElementById("topWallet");

const purchaseCount = document.getElementById("purchaseCount");

const inventoryCount = document.getElementById("inventoryCount");
const inventoryBreakdown = document.getElementById("inventoryBreakdown");

const notificationCount =
document.getElementById("notificationCount");

/* ==========================================
   LOADER
========================================== */

function showLoader(){

    if(loader){

        loader.style.display = "flex";
        loader.style.opacity = "1";

    }

}

function hideLoader(){

    if(!loader) return;

    loader.style.opacity = "0";

    setTimeout(()=>{

        loader.style.display = "none";

    },300);

}

/* ==========================================
   SIDEBAR
========================================== */

menuBtn?.addEventListener("click",()=>{

    sidebar.classList.add("active");
    overlay.classList.add("active");

});

closeSidebar?.addEventListener("click",closeSidebarMenu);

overlay?.addEventListener("click",closeSidebarMenu);

function closeSidebarMenu(){

    sidebar.classList.remove("active");
    overlay.classList.remove("active");

}

/* ==========================================
   AUTHENTICATION
========================================== */

onAuthStateChanged(auth,(user)=>{

    if(!user){

        window.location.replace("login.html");
        return;

    }

    loadUser(user);

    loadNotifications(user);

    loadRecentOrders(user);

});
/* ==========================================
   LOAD USER
========================================== */

function loadUser(user){

    const userRef = doc(db, "users", user.uid);

    onSnapshot(userRef, (snapshot)=>{

        /* If the user document doesn't exist,
           don't keep showing the loader forever. */

        if(!snapshot.exists()){

            hideLoader();
            return;

        }

        const data = snapshot.data();

        /* ==========================
           USER NAME
        ========================== */

        let firstName = "";

        if(data.firstName){

            firstName = data.firstName;

        }

        else if(data.name){

            firstName = data.name.split(" ")[0];

        }

        else if(user.displayName){

            firstName = user.displayName.split(" ")[0];

        }

        else{

            firstName = user.email.split("@")[0];

        }

        userName.textContent = firstName;

        /* ==========================
           WALLET
        ========================== */

        const balance = Number(data.wallet || 0);

        walletBalance.textContent =
            "₦" + balance.toLocaleString("en-NG");

        topWallet.textContent =
            balance.toLocaleString("en-NG");

        /* ==========================
           PURCHASES
        ========================== */

        purchaseCount.textContent =
            Number(data.totalOrders || 0)
            .toLocaleString("en-NG");

        /* ==========================
           INVENTORY
        ========================== */

        inventoryCount.textContent =
            Number(data.inventory || 0)
            .toLocaleString("en-NG");

        inventoryBreakdown.textContent =
            `${data.logs || 0} Logs • ${data.tools || 0} Tools`;

        /* ==========================
           AVATAR
        ========================== */

        if(data.photo){

            userAvatar.innerHTML = `
                <img
                    src="${data.photo}"
                    alt="Avatar"
                    style="
                        width:100%;
                        height:100%;
                        object-fit:cover;
                        border-radius:50%;
                    ">
            `;

        }else{

            const fullName =
                data.name ||
                user.displayName ||
                user.email.split("@")[0];

            const initials = fullName
                .trim()
                .split(" ")
                .map(word => word.charAt(0))
                .join("")
                .substring(0,2)
                .toUpperCase();

            userAvatar.textContent = initials;

        }

        /* ==========================
           PAGE READY
        ========================== */

        hideLoader();

    }, (error)=>{

        console.error(error);

        hideLoader();

    });

}
/* ==========================================
   LOAD NOTIFICATIONS
========================================== */

function loadNotifications(user){

    const userRef = doc(db,"users",user.uid);

    onSnapshot(userRef,(snapshot)=>{

        if(!snapshot.exists()){

            notificationCount.style.display = "none";
            return;

        }

        const data = snapshot.data();

        const unread = Number(data.unreadNotifications || 0);

        if(unread > 0){

            notificationCount.style.display = "flex";
            notificationCount.textContent = unread;

        }else{

            notificationCount.style.display = "none";

        }

    });

}

/* ==========================================
   RECENT ORDERS
========================================== */

async function loadRecentOrders(user){

    const recentOrders =
        document.getElementById("recentOrders");

    if(!recentOrders) return;

    try{

        const q = query(

            collection(db,"orders"),

            where("userId","==",user.uid),

            orderBy("createdAt","desc"),

            limit(3)

        );

        const snapshot = await getDocs(q);

        if(snapshot.empty){

            recentOrders.innerHTML = `

            <div class="empty-orders">

                <i class="fa-regular fa-bag-shopping"></i>

                <h4>No orders yet</h4>

                <p>Your purchases will appear here.</p>

            </div>

            `;

            return;

        }

        let html = "";

        snapshot.forEach((document)=>{

            const order = document.data();

            html += `

            <div class="order-item">

                <div class="order-left">

                    <img
                        src="${order.image || ""}"
                        class="order-image"
                    >

                    <div>

                        <h4>

                            ${order.title || "Product"}

                        </h4>

                        <small>

                            ₦${Number(order.amount || 0)
                            .toLocaleString("en-NG")}

                        </small>

                    </div>

                </div>

                <span class="order-status">

                    ${order.status || "Completed"}

                </span>

            </div>

            `;

        });

        recentOrders.innerHTML = html;

    }

    catch(error){

        console.error(error);

    }

}
/* ==========================================
   LOGOUT
========================================== */

logoutBtn?.addEventListener("click", async () => {

    const logout = confirm(
        "Are you sure you want to logout?"
    );

    if(!logout) return;

    showLoader();

    try{

        await signOut(auth);

        window.location.replace("login.html");

    }

    catch(error){

        console.error(error);

        hideLoader();

        alert("Unable to logout.");

    }

});

/* ==========================================
   NAVIGATION
========================================== */

document
.querySelectorAll("[data-page]")
.forEach(button=>{

    button.addEventListener("click",()=>{

        const page = button.dataset.page;

        if(page){

            window.location.href = page;

        }

    });

});

document
.querySelector(".notification-btn")
?.addEventListener("click",()=>{

    window.location.href = "notifications.html";

});

userAvatar?.addEventListener("click",()=>{

    window.location.href = "profile.html";

});

/* Wallet Card */

document
.querySelector(".summary-card a")
?.addEventListener("click",(e)=>{

    e.preventDefault();

    window.location.href="wallet.html";

});

/* ==========================================
   THEME
========================================== */

const themeToggle =
document.getElementById("themeToggle");

function applyTheme(theme){

    if(theme==="dark"){

        document.body.classList.add("dark");

    }else{

        document.body.classList.remove("dark");

    }

}

applyTheme(localStorage.getItem("theme") || "light");

themeToggle?.addEventListener("click",()=>{

    const dark =
        document.body.classList.toggle("dark");

    localStorage.setItem(

        "theme",

        dark ? "dark" : "light"

    );

});

/* ==========================================
   PAGE SAFETY
========================================== */

/* Never leave the loader forever */

window.addEventListener("load",()=>{

    setTimeout(()=>{

        hideLoader();

    },2000);

});

/* Hide loader if any unexpected error occurs */

window.addEventListener("error",()=>{

    hideLoader();

});

window.addEventListener("unhandledrejection",()=>{

    hideLoader();

});
/* ==========================================
   LIVE GREETING
========================================== */

const welcomeText =
document.getElementById("welcomeText");

function updateGreeting(){

    if(!welcomeText) return;

    const hour = new Date().getHours();

    let greeting = "Welcome";

    if(hour < 12){

        greeting = "Good morning";

    }else if(hour < 17){

        greeting = "Good afternoon";

    }else{

        greeting = "Good evening";

    }

    welcomeText.textContent = greeting;

}

updateGreeting();

/* ==========================================
   ACTIVE MENU
========================================== */

const currentPage =
window.location.pathname.split("/").pop();

document.querySelectorAll("#sidebar a").forEach(link=>{

    const href = link.getAttribute("href");

    if(href === currentPage){

        link.classList.add("active");

    }

});

/* ==========================================
   NOTIFICATION DROPDOWN
========================================== */

const notificationBtn =
document.querySelector(".notification-btn");

const notificationDropdown =
document.getElementById("notificationDropdown");

notificationBtn?.addEventListener("click",(e)=>{

    e.stopPropagation();

    if(notificationDropdown){

        notificationDropdown.classList.toggle("show");

    }

});

document.addEventListener("click",()=>{

    notificationDropdown?.classList.remove("show");

});

/* ==========================================
   CARD ANIMATION
========================================== */

document
.querySelectorAll(".summary-card")
.forEach(card=>{

    card.addEventListener("touchstart",()=>{

        card.style.transform="scale(.98)";

    });

    card.addEventListener("touchend",()=>{

        card.style.transform="";

    });

});

/* ==========================================
   SIDEBAR AUTO CLOSE
========================================== */

document
.querySelectorAll("#sidebar a")
.forEach(link=>{

    link.addEventListener("click",()=>{

        sidebar.classList.remove("active");
        overlay.classList.remove("active");

    });

});

/* ==========================================
   CONNECTION STATUS
========================================== */

window.addEventListener("offline",()=>{

    alert("No internet connection.");

});

window.addEventListener("online",()=>{

    console.log("Internet connection restored.");

});

/* ==========================================
   FINISHED
========================================== */

console.log("DigiSphere Dashboard Loaded Successfully");
