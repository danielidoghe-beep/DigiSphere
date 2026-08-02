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
    setDoc,
    addDoc,
    collection,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

/* ======================================
   FIREBASE
====================================== */

const firebaseConfig = {

    apiKey: "YOUR_API_KEY",

    authDomain: "YOUR_AUTH_DOMAIN",

    projectId: "YOUR_PROJECT_ID",

    storageBucket: "YOUR_STORAGE_BUCKET",

    messagingSenderId: "YOUR_SENDER_ID",

    appId: "YOUR_APP_ID",

    measurementId: "YOUR_MEASUREMENT_ID"

};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

/* ======================================
   ELEMENTS
====================================== */

const loader = document.getElementById("loader");

const sidebar = document.getElementById("sidebar");

const overlay = document.getElementById("overlay");

const menuBtn = document.getElementById("menuBtn");

const closeSidebar = document.getElementById("closeSidebar");

const logoutBtn = document.getElementById("logoutBtn");

const themeToggle = document.getElementById("themeToggle");

const walletBalance = document.getElementById("walletBalance");

const topWallet = document.getElementById("topWallet");

const userAvatar = document.getElementById("userAvatar");

const notificationCount = document.getElementById("notificationCount");

const bankTransferMethod =
document.getElementById("bankTransferMethod");

const flutterwaveMethod =
document.getElementById("flutterwaveMethod");

const flutterwaveNotice =
document.getElementById("flutterwaveNotice");

const depositAmount =
document.getElementById("depositAmount");

const amountError =
document.getElementById("amountError");

const paymentBtn =
document.getElementById("openPaymentBtn");

const paymentLoader =
document.getElementById("paymentLoader");

const paymentBtnText =
document.getElementById("paymentBtnText");

const paymentModal =
document.getElementById("paymentModal");

const paymentAmount =
document.getElementById("paymentAmount");

const paymentReference =
document.getElementById("paymentReference");

const paymentBank =
document.getElementById("paymentBank");

const paymentAccount =
document.getElementById("paymentAccount");

const copyAccountBtn =
document.getElementById("copyAccountBtn");

const cancelPayment =
document.getElementById("cancelPayment");

const closePaymentModal =
document.getElementById("closePaymentModal");

const whatsappProof =
document.getElementById("whatsappProof");

const recentTransactions =
document.getElementById("transactionsContainer");

/* ======================================
   VARIABLES
====================================== */

let currentUser = null;

let paymentMethod = "Bank Transfer";

let selectedBank = "PalmPay";

let paymentRef = "";
/* ======================================
   LOADER
====================================== */

function showLoader(){

    loader.style.display = "flex";

}

function hideLoader(){

    loader.style.opacity = "0";

    setTimeout(()=>{

        loader.style.display = "none";

    },300);

}

/* ======================================
   AUTH
====================================== */

onAuthStateChanged(auth, async(user)=>{

    if(!user){

        window.location.href = "login.html";

        return;

    }

    currentUser = user;

    await loadUser();

    loadNotificationCount();

    loadTransactions();

    hideLoader();

});

/* ======================================
   LOAD USER
====================================== */

async function loadUser(){

    try{

        const userRef = doc(db,"users",currentUser.uid);

        const snap = await getDoc(userRef);

        if(!snap.exists()) return;

        const data = snap.data();

        const balance = Number(data.wallet || 0);

        walletBalance.textContent =
        "₦" + balance.toLocaleString("en-NG");

        topWallet.textContent =
        balance.toLocaleString("en-NG");

        if(data.photo){

            userAvatar.innerHTML = `

                <img
                src="${data.photo}"
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

            currentUser.displayName ||

            currentUser.email;

            const initials =

            fullName

            .split(" ")

            .map(name=>name.charAt(0))

            .join("")

            .substring(0,2)

            .toUpperCase();

            userAvatar.textContent = initials;

        }

    }

    catch(error){

        console.error(error);

    }

}

/* ======================================
   NOTIFICATIONS
====================================== */

function loadNotificationCount(){

    const userRef =

    doc(db,"users",currentUser.uid);

    onSnapshot(userRef,(snap)=>{

        if(!snap.exists()) return;

        const data = snap.data();

        const unread =

        Number(data.unreadNotifications || 0);

        if(unread>0){

            notificationCount.style.display="flex";

            notificationCount.textContent=unread;

        }else{

            notificationCount.style.display="none";

        }

    });

}

/* ======================================
   SIDEBAR
====================================== */

menuBtn.onclick=()=>{

    sidebar.classList.add("active");

    overlay.classList.add("active");

};

function closeMenu(){

    sidebar.classList.remove("active");

    overlay.classList.remove("active");

}

closeSidebar.onclick=closeMenu;

overlay.onclick=closeMenu;

/* ======================================
   LOGOUT
====================================== */

logoutBtn.onclick=async()=>{

    if(!confirm("Sign out of DigiSphere?")){

        return;

    }

    showLoader();

    try{

        await signOut(auth);

    }

    catch(error){

        hideLoader();

        alert("Unable to sign out.");

        console.error(error);

    }

};

/* ======================================
   THEME
====================================== */

if(localStorage.getItem("theme")==="dark"){

    document.body.classList.add("dark");

}

themeToggle.onclick=()=>{

    document.body.classList.toggle("dark");

    localStorage.setItem(

        "theme",

        document.body.classList.contains("dark")

        ? "dark"

        : "light"

    );

};
/* ======================================
   PAYMENT METHOD
====================================== */

bankTransferMethod.onclick = () => {

    paymentMethod = "Bank Transfer";

    bankTransferMethod.classList.add("active");

    flutterwaveMethod.classList.remove("active");

    flutterwaveNotice.style.display = "none";

};

flutterwaveMethod.onclick = () => {

    paymentMethod = "Card";

    flutterwaveMethod.classList.add("active");

    bankTransferMethod.classList.remove("active");

    flutterwaveNotice.style.display = "block";

};

/* ======================================
   QUICK AMOUNT BUTTONS
====================================== */

document.querySelectorAll(".quickAmount").forEach(button=>{

    button.onclick = ()=>{

        const amount =

        button.textContent.replace(/[₦,]/g,"");

        depositAmount.value = amount;

        amountError.style.display = "none";

        document
        .querySelectorAll(".quickAmount")
        .forEach(btn=>btn.classList.remove("active"));

        button.classList.add("active");

    };

});

/* ======================================
   AMOUNT VALIDATION
====================================== */

depositAmount.addEventListener("input",()=>{

    const amount = Number(depositAmount.value);

    if(amount >= 1000){

        amountError.style.display = "none";

    }

});

/* ======================================
   OPEN PAYMENT
====================================== */

paymentBtn.onclick = async()=>{

    if(paymentMethod !== "Bank Transfer"){

        flutterwaveNotice.style.display = "block";

        return;

    }

    const amount = Number(depositAmount.value);

    if(amount < 1000){

        amountError.style.display = "flex";

        return;

    }

    amountError.style.display = "none";

    paymentBtn.disabled = true;

    paymentBtnText.style.display = "none";

    paymentLoader.style.display = "block";

    await new Promise(resolve=>setTimeout(resolve,1500));

    paymentLoader.style.display = "none";

    paymentBtnText.style.display = "block";

    paymentBtn.disabled = false;

    /* Random Bank */

    const banks = [

        {

            bank:"PalmPay",

            account:"9117412352"

        },

        {

            bank:"OPay",

            account:"9117412352"

        }

    ];

    const randomBank =

    banks[Math.floor(Math.random()*banks.length)];

    selectedBank = randomBank.bank;

    paymentRef =

    "DS" + Date.now();

    paymentAmount.textContent =

    "₦" +

    amount.toLocaleString("en-NG");

    paymentReference.textContent =

    paymentRef;

    paymentBank.textContent =

    randomBank.bank;

    paymentAccount.textContent =

    randomBank.account;

    paymentModal.classList.add("show");

};

/* ======================================
   CLOSE PAYMENT
====================================== */

closePaymentModal.onclick = ()=>{

    paymentModal.classList.remove("show");

};

cancelPayment.onclick = ()=>{

    paymentModal.classList.remove("show");

};

window.addEventListener("click",(e)=>{

    if(e.target === paymentModal){

        paymentModal.classList.remove("show");

    }

});
/* ======================================
   COPY ACCOUNT NUMBER
====================================== */

copyAccountBtn.onclick = async()=>{

    try{

        await navigator.clipboard.writeText(

            paymentAccount.textContent

        );

        copyAccountBtn.innerHTML =

        `<i class="fa-solid fa-check"></i> Copied`;

        setTimeout(()=>{

            copyAccountBtn.innerHTML =

            `<i class="fa-regular fa-copy"></i> Copy Account Number`;

        },2000);

    }

    catch(error){

        alert("Unable to copy account number.");

    }

};

/* ======================================
   SAVE TRANSACTION
====================================== */

whatsappProof.onclick = async()=>{

    try{

        const amount = Number(depositAmount.value);

        await addDoc(

            collection(db,"transactions"),

            {

                userId: currentUser.uid,

                type: "Wallet Funding",

                amount: amount,

                bank: selectedBank,

                accountName: "Ogaga Blessing Idoghe",

                accountNumber: "9117412352",

                reference: paymentRef,

                status: "Pending",

                createdAt: serverTimestamp()

            }

        );

        const message =

`Hello DigiSphere,

I have completed my wallet funding.

Reference: ${paymentRef}

Amount: ₦${amount.toLocaleString("en-NG")}

Bank: ${selectedBank}

Please confirm my payment.

Thank you.`;

        window.open(

            "https://wa.me/2349117412352?text=" +

            encodeURIComponent(message),

            "_blank"

        );

        paymentModal.classList.remove("show");

        depositAmount.value = "";

        document
        .querySelectorAll(".quickAmount")
        .forEach(btn=>btn.classList.remove("active"));

    }

    catch(error){

        console.error(error);

        alert("Unable to create transaction.");

    }

};

/* ======================================
   LOAD TRANSACTIONS
====================================== */

function loadTransactions(){

    const q = query(

        collection(db,"transactions"),

        where("userId","==",currentUser.uid),

        orderBy("createdAt","desc"),

        limit(20)

    );

    onSnapshot(q,(snapshot)=>{

        if(snapshot.empty){

            recentTransactions.innerHTML = `

                <div class="empty-transactions">

                    <div class="empty-icon">

                        <i class="fa-solid fa-wallet"></i>

                    </div>

                    <h3>No transactions yet</h3>

                    <p>Your wallet funding history will appear here.</p>

                </div>

            `;

            return;

        }

        recentTransactions.innerHTML = "";

        snapshot.forEach(docItem=>{

            const t = docItem.data();

            let statusClass = "pending";

            if(t.status === "Approved"){

                statusClass = "approved";

            }

            if(t.status === "Declined"){

                statusClass = "declined";

            }

            recentTransactions.innerHTML += `

            <div class="transaction-item">

                <div class="transaction-left">

                    <div class="transaction-icon">

                        <i class="fa-solid fa-building-columns"></i>

                    </div>

                    <div class="transaction-info">

                        <h4>Wallet Funding</h4>

                        <p>

                            ₦${Number(t.amount).toLocaleString("en-NG")}

                        </p>

                    </div>

                </div>

                <span class="status ${statusClass}">

                    ${t.status}

                </span>

            </div>

            `;

        });

    });

}
