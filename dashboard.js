import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    getFirestore,
    doc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

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

// ======================================
// Elements
// ======================================

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

const notificationCount = document.getElementById("notificationCount");

// ======================================
// Loader
// ======================================

function showLoader() {

    loader.style.display = "flex";

}

function hideLoader() {

    loader.style.opacity = "0";

    setTimeout(() => {

        loader.style.display = "none";

    },300);

}

// ======================================
// Sidebar
// ======================================

menuBtn.addEventListener("click",()=>{

    sidebar.classList.add("active");

    overlay.classList.add("active");

});

closeSidebar.addEventListener("click",closeMenu);

overlay.addEventListener("click",closeMenu);

function closeMenu(){

    sidebar.classList.remove("active");

    overlay.classList.remove("active");

}

// ======================================
// Auth
// ======================================

onAuthStateChanged(auth,(user)=>{

    if(!user){

        window.location.href="login.html";

        return;

    }

    loadUser(user);

});
// ======================================
// Load User Information
// ======================================

function loadUser(user){

    const userRef = doc(db,"users",user.uid);

    onSnapshot(userRef,(snapshot)=>{

        if(!snapshot.exists()) return;

        const data = snapshot.data();

        // ==========================
        // Welcome Name
        // ==========================

        let firstName = "";

        if(data.firstName){

            firstName = data.firstName;

        }

        else if(data.name){

            firstName = data.name.split(" ")[0];

        }

        else if(user.displayName){

            firstName = user.displayName.split("")[0];

        }

        else{

            firstName = user.email.split("@")[0];

        }

        userName.textContent = firstName;

        // ==========================
        // Wallet
        // ==========================

        const balance = Number(data.wallet || 0);

        walletBalance.textContent =
        "₦" + balance.toLocaleString("en-NG");

        topWallet.textContent =
        balance.toLocaleString("en-NG");

        // ==========================
        // Purchases
        // ==========================

        purchaseCount.textContent =
        Number(data.totalOrders || 0)
        .toLocaleString("en-NG");

        // ==========================
        // Inventory
        // ==========================

        inventoryCount.textContent =
        Number(data.inventory || 0)
        .toLocaleString("en-NG");

        inventoryBreakdown.textContent =

        `${data.logs || 0} Logs • ${data.tools || 0} Tools`;

        // ==========================
        // Avatar
        // ==========================

        if(data.photo && data.photo !== ""){

            userAvatar.innerHTML =

            `<img src="${data.photo}"
            style="
            width:100%;
            height:100%;
            border-radius:50%;
            object-fit:cover;
            ">`;

        }

        else{

            let initials = "DS";

            const fullName =

            data.name ||

            user.displayName ||

            user.email.split("@")[0];

            initials = fullName

            .split(" ")

            .map(word=>word.charAt(0))

            .join("")

            .substring(0,2)

            .toUpperCase();

            userAvatar.textContent = initials;

        }

    });

}
// ======================================
// Notifications
// ======================================

function loadNotifications(user){

    const notificationRef = doc(
        db,
        "users",
        user.uid
    );

    onSnapshot(notificationRef,(snapshot)=>{

        if(!snapshot.exists()) return;

        const data = snapshot.data();

        const unread = data.unreadNotifications || 0;

        if(unread > 0){

            notificationCount.style.display = "flex";

            notificationCount.textContent = unread;

        }

        else{

            notificationCount.style.display = "none";

        }

    });

}

// ======================================
// Authentication
// ======================================

onAuthStateChanged(auth,(user)=>{

    if(!user){

        window.location.href="login.html";

        return;

    }

    loadUser(user);

    loadNotifications(user);

    setTimeout(hideLoader,1200);

});

// ======================================
// Logout
// ======================================

logoutBtn.addEventListener("click",async()=>{

    const logout = confirm(

        "Do you want to logout?"

    );

    if(!logout) return;

    showLoader();

    try{

        await signOut(auth);

        window.location.href="login.html";

    }

    catch(error){

        hideLoader();

        alert("Unable to logout.");

        console.error(error);

    }

});

// ======================================
// Navigation
// ======================================

document
.querySelector(".wallet-card a")
?.addEventListener("click",()=>{

    window.location.href="wallet.html";

});

userAvatar.addEventListener("click",()=>{

    window.location.href="profile.html";

});

document
.querySelector(".notification-btn")
.addEventListener("click",()=>{

    window.location.href="notifications.html";

});

// ======================================
// Theme
// ======================================

const themeToggle = document.getElementById("themeToggle");

themeToggle.addEventListener("click",()=>{

    document.body.classList.toggle("dark");

    localStorage.setItem(

        "theme",

        document.body.classList.contains("dark")
        ? "dark"
        : "light"

    );

});

if(localStorage.getItem("theme")==="dark"){

    document.body.classList.add("dark");

}
