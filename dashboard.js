import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";

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
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

/* ===========================
   FIREBASE
=========================== */

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

/* ===========================
   ELEMENTS
=========================== */

const loader = document.getElementById("loader");

const overlay = document.getElementById("overlay");

const sidebar = document.getElementById("sidebar");

const menuBtn = document.getElementById("menuBtn");

const closeSidebar = document.getElementById("closeSidebar");

const logoutBtn = document.getElementById("logoutBtn");

const themeToggle = document.getElementById("themeToggle");

const userName = document.getElementById("userName");

const userAvatar = document.getElementById("userAvatar");

const walletBalance = document.getElementById("walletBalance");

const topWallet = document.getElementById("topWallet");

const purchaseCount = document.getElementById("purchaseCount");

const inventoryCount = document.getElementById("inventoryCount");

const inventoryBreakdown = document.getElementById("inventoryBreakdown");

const notificationCount = document.getElementById("notificationCount");

const notificationDropdown = document.getElementById("notificationDropdown");

const notificationList = document.getElementById("notificationList");

const viewAllNotifications = document.getElementById("viewAllNotifications");

const recentOrders = document.getElementById("recentOrders");

/* ===========================
   LOADER
=========================== */

function showLoader(){

    loader.style.display = "flex";

    loader.style.opacity = "1";

}

function hideLoader(){

    loader.style.opacity = "0";

    setTimeout(()=>{

        loader.style.display = "none";

    },300);

}

/* ===========================
   SIDEBAR
=========================== */

function closeMenu(){

    sidebar.classList.remove("active");

    overlay.classList.remove("active");

}

menuBtn.addEventListener("click",()=>{

    sidebar.classList.add("active");

    overlay.classList.add("active");

});

closeSidebar.addEventListener("click",closeMenu);

overlay.addEventListener("click",closeMenu);

/* ===========================
   THEME
=========================== */

if(localStorage.getItem("theme")==="dark"){

    document.body.classList.add("dark");

}

themeToggle.addEventListener("click",()=>{

    document.body.classList.toggle("dark");

    localStorage.setItem(

        "theme",

        document.body.classList.contains("dark")

        ? "dark"

        : "light"

    );

});
/* ===========================
   AUTHENTICATION
=========================== */

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;

    }

    try {

        await Promise.all([

            loadUser(user),

            loadNotifications(user),

            loadRecentOrders(user)

        ]);

    }

    catch (error) {

        console.error(error);

    }

    hideLoader();

});

/* ===========================
   LOAD USER
=========================== */

async function loadUser(user){

    return new Promise((resolve)=>{

        const userRef = doc(db,"users",user.uid);

        onSnapshot(userRef,(snapshot)=>{

            if(!snapshot.exists()){

                resolve();

                return;

            }

            const data = snapshot.data();

            /* Name */

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

            /* Wallet */

            const balance = Number(data.wallet || 0);

            walletBalance.textContent =
                "₦" + balance.toLocaleString("en-NG");

            topWallet.textContent =
                balance.toLocaleString("en-NG");

            /* Purchases */

            purchaseCount.textContent =
                Number(data.totalOrders || 0)
                .toLocaleString("en-NG");

            /* Inventory */

            inventoryCount.textContent =
                Number(data.inventory || 0)
                .toLocaleString("en-NG");

            inventoryBreakdown.textContent =

                `${data.logs || 0} Logs • ${data.tools || 0} Tools`;

            /* Avatar */

            if(data.photoURL){

                userAvatar.innerHTML =

                `<img src="${data.photoURL}" alt="">`;

            }

            else if(user.photoURL){

                userAvatar.innerHTML =

                `<img src="${user.photoURL}" alt="">`;

            }

            else{

                const fullName =

                    data.name ||

                    user.displayName ||

                    user.email;

                const initials =

                    fullName

                    .split(" ")

                    .map(word=>word.charAt(0))

                    .join("")

                    .substring(0,2)

                    .toUpperCase();

                userAvatar.textContent = initials;

            }

            resolve();

        });

    });

}
/* ===========================
   NOTIFICATIONS
=========================== */

async function loadNotifications(user){

    return new Promise((resolve)=>{

        const notificationQuery = query(

            collection(db,"notifications"),

            where("userId","==",user.uid),

            orderBy("createdAt","desc"),

            limit(2)

        );

        onSnapshot(notificationQuery,(snapshot)=>{

            notificationList.innerHTML="";

            if(snapshot.empty){

                notificationCount.style.display="none";

                notificationList.innerHTML=`

                    <div class="empty-notification">

                        No notifications yet

                    </div>

                `;

                resolve();

                return;

            }

            let unread=0;

            snapshot.forEach(doc=>{

                const data=doc.data();

                if(!data.read){

                    unread++;

                }

                notificationList.innerHTML+=`

                <div class="notification-item">

                    <h4>

                        ${data.title || "Notification"}

                    </h4>

                    <p>

                        ${data.message || ""}

                    </p>

                </div>

                `;

            });

            if(unread>0){

                notificationCount.style.display="flex";

                notificationCount.textContent=unread;

            }

            else{

                notificationCount.style.display="none";

            }

            resolve();

        });

    });

}

/* ===========================
   NOTIFICATION DROPDOWN
=========================== */

document.querySelector(".notification-btn")

.addEventListener("click",(e)=>{

    e.stopPropagation();

    notificationDropdown.classList.toggle("show");

});

document.addEventListener("click",(e)=>{

    if(

        !notificationDropdown.contains(e.target)

        &&

        !e.target.closest(".notification-btn")

    ){

        notificationDropdown.classList.remove("show");

    }

});

viewAllNotifications.addEventListener("click",()=>{

    window.location.href="notifications.html";

});
/* ===========================
   RECENT ORDERS
=========================== */

async function loadRecentOrders(user){

    try{

        const ordersQuery = query(

            collection(db,"orders"),

            where("userId","==",user.uid),

            orderBy("createdAt","desc"),

            limit(3)

        );

        const snapshot = await getDocs(ordersQuery);

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

        snapshot.forEach((doc)=>{

            const order = doc.data();

            html += `

            <div class="order-item">

                <div class="order-image">

                    <img src="${order.image || "images/default-product.png"}" alt="">

                </div>

                <div class="order-info">

                    <h4>${order.title || "Untitled Product"}</h4>

                    <small>

                        ₦${Number(order.amount || 0).toLocaleString("en-NG")}

                    </small>

                </div>

                <span class="status ${order.status || "completed"}">

                    ${order.status || "Completed"}

                </span>

            </div>

            `;

        });

        recentOrders.innerHTML = html;

    }

    catch(error){

        console.error("Recent Orders Error:",error);

    }

}

/* ===========================
   LOGOUT
=========================== */

logoutBtn.addEventListener("click",async()=>{

    const confirmLogout = confirm(

        "Do you want to logout?"

    );

    if(!confirmLogout) return;

    showLoader();

    try{

        await signOut(auth);

        window.location.href="login.html";

    }

    catch(error){

        hideLoader();

        console.error(error);

        alert("Unable to logout.");

    }

});

/* ===========================
   PROFILE
=========================== */

userAvatar.addEventListener("click",()=>{

    window.location.href="profile.html";

});

/* ===========================
   END
=========================== */

console.log("Dashboard Loaded Successfully");
/* ===========================
   PAGE LINKS
=========================== */

document.querySelectorAll("[data-page]").forEach(button=>{

    button.addEventListener("click",()=>{

        const page = button.dataset.page;

        if(page){

            window.location.href = page;

        }

    });

});

/* ===========================
   REFRESH WALLET
=========================== */

function refreshWallet(balance){

    walletBalance.textContent =
        "₦" + Number(balance).toLocaleString("en-NG");

    topWallet.textContent =
        Number(balance).toLocaleString("en-NG");

}

/* ===========================
   REFRESH INVENTORY
=========================== */

function refreshInventory(data){

    inventoryCount.textContent =
        Number(data.inventory || 0)
        .toLocaleString("en-NG");

    inventoryBreakdown.textContent =
        `${data.logs || 0} Logs • ${data.tools || 0} Tools`;

}

/* ===========================
   REFRESH PURCHASES
=========================== */

function refreshPurchases(total){

    purchaseCount.textContent =
        Number(total || 0)
        .toLocaleString("en-NG");

}

/* ===========================
   ONLINE STATUS
=========================== */

window.addEventListener("offline",()=>{

    console.log("Offline");

});

window.addEventListener("online",()=>{

    console.log("Online");

});

/* ===========================
   HIDE LOADER
=========================== */

window.addEventListener("load",()=>{

    setTimeout(()=>{

        hideLoader();

    },500);

});

console.log("DigiSphere Dashboard Ready");
