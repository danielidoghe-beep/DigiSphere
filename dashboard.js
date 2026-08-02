// =====================================
// DigiSphere Dashboard
// Part 3A
// =====================================

// Firebase

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
// Firebase Config
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

const menuBtn = document.getElementById("menuBtn");

const sidebar = document.getElementById("sidebar");

const overlay = document.getElementById("overlay");

const closeSidebar = document.getElementById("closeSidebar");

const themeToggle = document.getElementById("themeToggle");

const logoutBtn = document.getElementById("logoutBtn");

const userName = document.getElementById("userName");

const walletBalance = document.getElementById("walletBalance");

const purchaseCount = document.getElementById("purchaseCount");

const inventoryCount = document.getElementById("inventoryCount");

const inventoryInfo = document.getElementById("inventoryInfo");

const avatarLetters = document.getElementById("avatarLetters");

const profileImage = document.getElementById("profileImage");

const notificationCount = document.getElementById("notificationCount");

// =====================================
// Loader
// =====================================

window.addEventListener("load",()=>{

    setTimeout(()=>{

        loader.style.opacity="0";

        setTimeout(()=>{

            loader.style.display="none";

        },300);

    },1500);

});

// =====================================
// Sidebar
// =====================================

menuBtn.onclick=()=>{

    sidebar.classList.add("active");

    overlay.classList.add("active");

};

closeSidebar.onclick=()=>{

    sidebar.classList.remove("active");

    overlay.classList.remove("active");

};

overlay.onclick=()=>{

    sidebar.classList.remove("active");

    overlay.classList.remove("active");

};

// =====================================
// Theme
// =====================================

if(localStorage.getItem("theme")==="dark"){

    document.body.classList.add("dark");

}

themeToggle.onclick=()=>{

    document.body.classList.toggle("dark");

    if(document.body.classList.contains("dark")){

        localStorage.setItem("theme","dark");

    }else{

        localStorage.setItem("theme","light");

    }

};

// =====================================
// Auth
// =====================================

onAuthStateChanged(auth,async(user)=>{

    if(!user){

        location.href="login.html";

        return;

    }

    loadUser(user);

});

// =====================================
// User
// =====================================

async function loadUser(user){

    const ref=doc(db,"users",user.uid);

    const snap=await getDoc(ref);

    if(!snap.exists()) return;

    const data=snap.data();

    userName.textContent=data.name || "User";

    walletBalance.textContent="₦"+Number(data.wallet || 0).toLocaleString("en-NG");

    purchaseCount.textContent=data.totalOrders || 0;

    inventoryCount.textContent=data.inventory || 0;

    inventoryInfo.textContent=`${data.activeInventory || 0} Active • ${data.expiredInventory || 0} Expired`;

    if(data.photo){

        profileImage.src=data.photo;

        profileImage.hidden=false;

        avatarLetters.style.display="none";

    }else{

        let initials="DS";

        if(data.name){

            initials=data.name.split(" ").map(n=>n[0]).join("").toUpperCase();

        }

        avatarLetters.textContent=initials;

    }

}
// =====================================
// Part 3B
// Realtime Dashboard Data
// =====================================

const recentOrders = document.getElementById("recentOrders");

const quickActions = document.getElementById("quickActions");

const comingSoon = document.getElementById("comingSoon");

let currentUser = null;

// =====================================
// Auth State
// =====================================

onAuthStateChanged(auth,(user)=>{

    if(!user){

        location.href="login.html";

        return;

    }

    currentUser=user;

    loadRealtimeData(user.uid);

});

// =====================================
// Realtime User Data
// =====================================

function loadRealtimeData(uid){

    onSnapshot(doc(db,"users",uid),(docSnap)=>{

        if(!docSnap.exists()) return;

        const data=docSnap.data();

        userName.textContent=data.name || "User";

        walletBalance.textContent="₦"+Number(data.wallet || 0).toLocaleString("en-NG");

        purchaseCount.textContent=Number(data.totalOrders || 0).toLocaleString();

        inventoryCount.textContent=Number(data.inventory || 0).toLocaleString();

        inventoryInfo.textContent=
        `${data.activeInventory || 0} Active • ${data.expiredInventory || 0} Expired`;

    });

    loadNotifications(uid);

    loadOrders(uid);

    loadQuickActions();

    loadComingSoon();

}

// =====================================
// Notifications
// =====================================

function loadNotifications(uid){

    const q=query(

        collection(db,"notifications"),

        where("uid","==",uid),

        where("read","==",false)

    );

    onSnapshot(q,(snapshot)=>{

        notificationCount.textContent=snapshot.size;

    });

}

// =====================================
// Recent Orders
// =====================================

function loadOrders(uid){

    const q=query(

        collection(db,"orders"),

        where("uid","==",uid),

        orderBy("createdAt","desc"),

        limit(5)

    );

    onSnapshot(q,(snapshot)=>{

        recentOrders.innerHTML="";

        if(snapshot.empty){

            recentOrders.innerHTML=`

            <div class="empty-orders">

                <i class="fa-solid fa-bag-shopping"></i>

                <h4>No Orders Yet</h4>

                <p>Your recent purchases will appear here.</p>

            </div>

            `;

            return;

        }

        snapshot.forEach((doc)=>{

            const order=doc.data();

            recentOrders.innerHTML+=`

            <div class="quick-card">

                <div class="quick-icon"
                style="background:#edf7df;color:#5d7c1f;">

                    <i class="fa-solid fa-box"></i>

                </div>

                <div>

                    <h4>${order.productName || "Product"}</h4>

                    <p>

                        ₦${Number(order.amount || 0).toLocaleString("en-NG")}

                    </p>

                </div>

            </div>

            `;

        });

    });

}

// =====================================
// Quick Actions
// =====================================

function loadQuickActions(){

    quickActions.innerHTML=`

    <div class="quick-card">

        <div class="quick-icon"
        style="background:#EAF3FF;color:#3578E5;">

            <i class="fa-solid fa-cube"></i>

        </div>

        <div>

            <h4>Browse Store</h4>

            <p>Explore digital products.</p>

        </div>

    </div>

    <div class="quick-card">

        <div class="quick-icon"
        style="background:#F4ECFF;color:#8B5CF6;">

            <i class="fa-solid fa-screwdriver-wrench"></i>

        </div>

        <div>

            <h4>Services</h4>

            <p>Manage available services.</p>

        </div>

    </div>

    <div class="quick-card">

        <div class="quick-icon"
        style="background:#EAF9EE;color:#22A559;">

            <i class="fa-solid fa-wallet"></i>

        </div>

        <div>

            <h4>Fund Wallet</h4>

            <p>Add money to your wallet.</p>

        </div>

    </div>

    <div class="quick-card">

        <div class="quick-icon"
        style="background:#FFF2E7;color:#F97316;">

            <i class="fa-solid fa-headset"></i>

        </div>

        <div>

            <h4>Support</h4>

            <p>Get help from DigiSphere.</p>

        </div>

    </div>

    `;

}

// =====================================
// Coming Soon
// =====================================

function loadComingSoon(){

    comingSoon.innerHTML=`

    <div class="soon-item">

        <div class="soon-left">

            <i class="fa-solid fa-gift"></i>

            <span>Rewards</span>

        </div>

        <span class="soon-badge">

            Soon

        </span>

    </div>

    <div class="soon-item">

        <div class="soon-left">

            <i class="fa-solid fa-users"></i>

            <span>Referral Program</span>

        </div>

        <span class="soon-badge">

            Soon

        </span>

    </div>

    `;

}
// =====================================
// Part 3C
// Buttons, Logout & Navigation
// =====================================

const addFundsBtn = document.getElementById("addFundsBtn");

const viewOrdersBtn = document.getElementById("viewOrdersBtn");

const supportBtn = document.getElementById("supportBtn");

const emailBtn = document.getElementById("emailBtn");

// ==============================
// Wallet
// ==============================

addFundsBtn.addEventListener("click",()=>{

    window.location.href="wallet.html";

});

// ==============================
// Orders
// ==============================

viewOrdersBtn.addEventListener("click",()=>{

    window.location.href="orders.html";

});

// ==============================
// WhatsApp Support
// ==============================

// Replace with your WhatsApp number
const WHATSAPP_NUMBER="234XXXXXXXXXX";

supportBtn.addEventListener("click",()=>{

    const message=encodeURIComponent(
        "Hello DigiSphere Support, I need assistance."
    );

    window.open(
        `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`,
        "_blank"
    );

});

// ==============================
// Email Support
// ==============================

emailBtn.addEventListener("click",()=>{

    window.location.href=
    "mailto:support@digisphere.com";

});

// ==============================
// Logout
// ==============================

logoutBtn.addEventListener("click",async()=>{

    const answer=confirm(
        "Are you sure you want to logout?"
    );

    if(!answer) return;

    try{

        await signOut(auth);

        location.href="login.html";

    }catch(error){

        alert("Unable to logout.");

    }

});

// ==============================
// Avatar Click
// ==============================

document
.getElementById("userAvatar")
.addEventListener("click",()=>{

    location.href="profile.html";

});

// ==============================
// Notification Click
// ==============================

document
.getElementById("notificationBtn")
.addEventListener("click",()=>{

    location.href="notifications.html";

});

// ==============================
// Sidebar Links
// ==============================

document.querySelectorAll(".sidebar a").forEach(link=>{

    link.addEventListener("click",()=>{

        sidebar.classList.remove("active");

        overlay.classList.remove("active");

    });

});

// ==============================
// Loading Complete
// ==============================

setTimeout(()=>{

    loader.style.opacity="0";

    setTimeout(()=>{

        loader.style.display="none";

    },300);

},1500);

// ==============================
// Auto Refresh Time
// ==============================

setInterval(()=>{

    const today=new Date();

    console.log(
        "Dashboard Synced:",
        today.toLocaleTimeString()
    );

},60000);
