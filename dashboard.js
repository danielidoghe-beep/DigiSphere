// =====================================
// DigiSphere Dashboard
// dashboard.js (Part 1)
// =====================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    getDoc,
    onSnapshot,
    collection,
    query,
    where,
    orderBy,
    limit
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

// =====================================
// Firebase
// =====================================

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

// =====================================
// Elements
// =====================================

const loader = document.getElementById("loader");

const userName = document.getElementById("userName");

const walletBalance = document.getElementById("walletBalance");

const purchaseCount = document.getElementById("purchaseCount");

const inventoryCount = document.getElementById("inventoryCount");

const logsCount = document.getElementById("logsCount");

const toolsCount = document.getElementById("toolsCount");

const notificationCount = document.getElementById("notificationCount");

const profileAvatar = document.getElementById("profileAvatar");

const sidebar = document.getElementById("sidebar");

const overlay = document.getElementById("overlay");

const menuBtn = document.getElementById("menuBtn");

const closeSidebar = document.getElementById("closeSidebar");

const logoutBtn = document.getElementById("logoutBtn");

// =====================================
// Loading Screen
// =====================================

window.addEventListener("load",()=>{

    setTimeout(()=>{

        loader.style.display="none";

    },1500);

});

// =====================================
// Sidebar
// =====================================

menuBtn.onclick=()=>{

    sidebar.classList.add("active");

    overlay.classList.add("active");

}

closeSidebar.onclick=()=>{

    sidebar.classList.remove("active");

    overlay.classList.remove("active");

}

overlay.onclick=()=>{

    sidebar.classList.remove("active");

    overlay.classList.remove("active");

}

// =====================================
// User Authentication
// =====================================

let currentUser;

onAuthStateChanged(auth,async(user)=>{

    if(!user){

        location.href="login.html";

        return;

    }

    currentUser=user;

    loadUser();

    loadNotifications();

    loadOrders();

});
// =====================================
// Part 2
// Load User Information
// =====================================

function loadUser(){

    const userRef = doc(db,"users",currentUser.uid);

    onSnapshot(userRef,(snapshot)=>{

        if(!snapshot.exists()) return;

        const data = snapshot.data();

        // -------------------------
        // Welcome Name
        // -------------------------

        userName.textContent =
            data.firstName ||
            data.name ||
            currentUser.displayName ||
            currentUser.email.split("@")[0];

        // -------------------------
        // Wallet
        // -------------------------

        walletBalance.textContent =
            "₦" +
            Number(data.wallet || 0)
            .toLocaleString("en-NG");

        // -------------------------
        // Purchases
        // -------------------------

        purchaseCount.textContent =
            Number(data.totalOrders || 0)
            .toLocaleString("en-NG");

        // -------------------------
        // Inventory
        // -------------------------

        inventoryCount.textContent =
            Number(data.inventory || 0)
            .toLocaleString("en-NG");

        logsCount.textContent =
            `${data.logs || 0} Logs`;

        toolsCount.textContent =
            `${data.tools || 0} Tools`;

        // -------------------------
        // Avatar
        // -------------------------

        if(data.photo){

            profileAvatar.innerHTML =

            `<img src="${data.photo}"
                  alt="Profile">`;

        }

        else{

            let initials = "DS";

            const name =
                data.name ||
                data.firstName ||
                currentUser.displayName ||
                "";

            if(name){

                initials = name
                    .trim()
                    .split(" ")
                    .map(word=>word[0])
                    .join("")
                    .substring(0,2)
                    .toUpperCase();

            }

            profileAvatar.textContent = initials;

        }

    });

}

// =====================================
// Notifications
// =====================================

function loadNotifications(){

    const q = query(

        collection(db,"notifications"),

        where("uid","==",currentUser.uid),

        where("read","==",false)

    );

    onSnapshot(q,(snapshot)=>{

        notificationCount.textContent =
            snapshot.size;

    });

}

// =====================================
// Profile Click
// =====================================

profileAvatar.onclick = ()=>{

    location.href="profile.html";

}

// =====================================
// Notification Click
// =====================================

document
.getElementById("notificationBtn")
.onclick=()=>{

    location.href="notifications.html";

}
// =====================================
// Part 3
// Recent Orders
// =====================================

const recentOrders = document.getElementById("recentOrders");

function loadOrders(){

    const q = query(

        collection(db,"orders"),

        where("uid","==",currentUser.uid),

        orderBy("createdAt","desc"),

        limit(5)

    );

    onSnapshot(q,(snapshot)=>{

        recentOrders.innerHTML="";

        if(snapshot.empty){

            recentOrders.innerHTML=`

            <div class="empty-card">

                <i class="fa-solid fa-bag-shopping"></i>

                <h4>No orders yet</h4>

                <p>

                    Your purchases will appear here once you place an order.

                </p>

            </div>

            `;

            return;

        }

        snapshot.forEach((docSnap)=>{

            const order = docSnap.data();

            const amount = Number(order.amount || 0)
            .toLocaleString("en-NG");

            const status =
                (order.status || "Pending").toLowerCase();

            recentOrders.innerHTML += `

            <div class="order-card">

                <div class="order-left">

                    <div class="order-icon">

                        <i class="fa-solid fa-box"></i>

                    </div>

                    <div class="order-info">

                        <h4>

                            ${order.productName || "Digital Product"}

                        </h4>

                        <p>

                            ${order.category || "Purchase"}

                        </p>

                    </div>

                </div>

                <div class="order-right">

                    <h5>

                        ₦${amount}

                    </h5>

                    <span class="order-status ${status}">

                        ${order.status || "Pending"}

                    </span>

                </div>

            </div>

            `;

        });

    });

}

// =====================================
// Quick Action Buttons
// =====================================

document.getElementById("buyLogs").onclick=()=>{

    location.href="store.html";

};

document.getElementById("buyTools").onclick=()=>{

    location.href="tools.html";

};

document.getElementById("topupWallet").onclick=()=>{

    location.href="wallet.html";

};

document.getElementById("support").onclick=()=>{

    location.href="support.html";

};

// =====================================
// Logout
// =====================================

logoutBtn.onclick = async()=>{

    const confirmLogout = confirm(

        "Are you sure you want to logout?"

    );

    if(!confirmLogout) return;

    try{

        await signOut(auth);

        location.href="login.html";

    }

    catch(error){

        alert("Unable to logout.");

        console.error(error);

    }

};
// =====================================
// Part 4
// Theme, Support & Final Functions
// =====================================

// Theme

const themeToggle = document.getElementById("themeToggle");

if(localStorage.getItem("theme")==="dark"){

    document.body.classList.add("dark");

    themeToggle.innerHTML=`
        <i class="fa-solid fa-sun"></i>
    `;

}

themeToggle.addEventListener("click",()=>{

    document.body.classList.toggle("dark");

    if(document.body.classList.contains("dark")){

        localStorage.setItem("theme","dark");

        themeToggle.innerHTML=`
            <i class="fa-solid fa-sun"></i>
        `;

    }

    else{

        localStorage.setItem("theme","light");

        themeToggle.innerHTML=`
            <i class="fa-solid fa-moon"></i>
        `;

    }

});

// =====================================
// Support
// =====================================

// CHANGE THESE TO YOUR DETAILS

const whatsappNumber="2348000000000";

const telegramUsername="DigiSphere";

const supportEmail="support@digisphere.com";

// WhatsApp

document
.getElementById("whatsappBtn")
.addEventListener("click",(e)=>{

    e.preventDefault();

    window.open(

        `https://wa.me/${whatsappNumber}`,

        "_blank"

    );

});

// Telegram

document
.getElementById("telegramBtn")
.addEventListener("click",(e)=>{

    e.preventDefault();

    window.open(

        `https://t.me/${telegramUsername}`,

        "_blank"

    );

});

// Email

document
.getElementById("supportEmail")
.textContent=supportEmail;

// =====================================
// Auto Close Sidebar
// =====================================

document
.querySelectorAll(".sidebar-links a")
.forEach(link=>{

    link.addEventListener("click",()=>{

        sidebar.classList.remove("active");

        overlay.classList.remove("active");

    });

});

// =====================================
// Refresh Dashboard Every Minute
// =====================================

setInterval(()=>{

    if(currentUser){

        loadNotifications();

    }

},60000);

// =====================================
// Finished Loading
// =====================================

window.addEventListener("load",()=>{

    setTimeout(()=>{

        loader.style.opacity="0";

        setTimeout(()=>{

            loader.style.display="none";

        },300);

    },1500);

});

console.log("DigiSphere Dashboard Loaded Successfully");
