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
    updateDoc,
    collection,
    addDoc,
    serverTimestamp,
    query,
    where,
    orderBy,
    limit,
    onSnapshot
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

const walletBalance = document.getElementById("walletBalance");

const topWallet = document.getElementById("topWallet");

const userAvatar = document.getElementById("userAvatar");

const menuBtn = document.getElementById("menuBtn");

const sidebar = document.getElementById("sidebar");

const overlay = document.getElementById("overlay");

const closeSidebar = document.getElementById("closeSidebar");

const logoutBtn = document.getElementById("logoutBtn");

const bankTransferMethod = document.getElementById("bankTransferMethod");

const flutterwaveMethod = document.getElementById("flutterwaveMethod");

const depositAmount = document.getElementById("depositAmount");

const amountError = document.getElementById("amountError");

const paymentBtn = document.getElementById("openPaymentBtn");

const paymentLoader = document.getElementById("paymentLoader");

const paymentBtnText = document.getElementById("paymentBtnText");

const flutterwaveNotice = document.getElementById("flutterwaveNotice");

const paymentModal = document.getElementById("paymentModal");

const closePaymentModal = document.getElementById("closePaymentModal");

const cancelPayment = document.getElementById("cancelPayment");

const paymentAmount = document.getElementById("paymentAmount");

const paymentReference = document.getElementById("paymentReference");

const paymentBank = document.getElementById("paymentBank");

const paymentAccount = document.getElementById("paymentAccount");

const whatsappProof = document.getElementById("whatsappProof");

const recentTransactions =
document.getElementById("transactionsContainer");

/* ===========================
   VARIABLES
=========================== */

let currentUser = null;

let paymentMethod = "Bank Transfer";

let paymentRef = "";

let selectedBank = "PalmPay";
/* ===========================
   LOADER
=========================== */

function hideLoader(){

    loader.style.opacity = "0";

    setTimeout(()=>{

        loader.style.display = "none";

    },300);

}

/* ===========================
   AUTH
=========================== */

onAuthStateChanged(auth, async(user)=>{

    if(!user){

        window.location.href = "login.html";

        return;

    }

    currentUser = user;

    await loadUser();

    loadTransactions();

    hideLoader();

});

/* ===========================
   LOAD USER
=========================== */

async function loadUser(){

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
        <img src="${data.photo}"
        style="
        width:100%;
        height:100%;
        border-radius:50%;
        object-fit:cover;
        ">
        `;

    }else{

        const initials =
        (data.name || currentUser.email)
        .split(" ")
        .map(n=>n[0])
        .join("")
        .substring(0,2)
        .toUpperCase();

        userAvatar.textContent = initials;

    }

}

/* ===========================
   SIDEBAR
=========================== */

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

/* ===========================
   LOGOUT
=========================== */

logoutBtn.onclick=async()=>{

    if(!confirm("Sign out?")) return;

    await signOut(auth);

};

/* ===========================
   THEME
=========================== */

const themeToggle =
document.getElementById("themeToggle");

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
/* ===========================
   PAYMENT METHOD
=========================== */

bankTransferMethod.onclick = () => {

    paymentMethod = "Bank Transfer";

    bankTransferMethod.classList.add("active");

    flutterwaveMethod.classList.remove("active");

    flutterwaveNotice.style.display = "none";

};

flutterwaveMethod.onclick = () => {

    paymentMethod = "Flutterwave";

    flutterwaveMethod.classList.add("active");

    bankTransferMethod.classList.remove("active");

    flutterwaveNotice.style.display = "block";

};

/* ===========================
   QUICK AMOUNT
=========================== */

document.querySelectorAll(".quickAmount").forEach(button=>{

    button.onclick=()=>{

        depositAmount.value=button.textContent;

        amountError.style.display="none";

    };

});

/* ===========================
   OPEN PAYMENT
=========================== */

paymentBtn.onclick = async () => {

    if(paymentMethod==="Flutterwave"){

        flutterwaveNotice.style.display="block";

        return;

    }

    const amount = Number(depositAmount.value);

    if(amount < 1000){

        amountError.style.display="flex";

        return;

    }

    amountError.style.display="none";

    paymentBtn.disabled = true;

    paymentBtnText.style.display = "none";

    paymentLoader.style.display = "block";

    await new Promise(resolve=>setTimeout(resolve,1500));

    paymentBtn.disabled = false;

    paymentLoader.style.display = "none";

    paymentBtnText.style.display = "block";

    /* Random Bank */

    const banks=[

        {
            bank:"PalmPay",
            account:"9117412352"
        },

        {
            bank:"OPay",
            account:"9117412352"
        }

    ];

    const randomBank=

    banks[Math.floor(Math.random()*banks.length)];

    selectedBank=randomBank.bank;

    paymentRef="DS"+Date.now();

    paymentAmount.textContent=

    "₦"+amount.toLocaleString("en-NG");

    paymentReference.textContent=

    paymentRef;

    paymentBank.textContent=

    randomBank.bank;

    paymentAccount.textContent=

    randomBank.account;

    paymentModal.classList.add("show");

};
/* ===========================
   PAYMENT MODAL
=========================== */

closePaymentModal.onclick = () => {

    paymentModal.classList.remove("show");

};

cancelPayment.onclick = () => {

    paymentModal.classList.remove("show");

};

window.onclick = (e) => {

    if(e.target === paymentModal){

        paymentModal.classList.remove("show");

    }

};

/* ===========================
   SAVE TRANSACTION
=========================== */

whatsappProof.onclick = async () => {

    const amount = Number(depositAmount.value);

    try{

        const transaction = {

            userId: currentUser.uid,

            amount: amount,

            method: selectedBank,

            accountName: "Ogaga Blessing Idoghe",

            accountNumber: "9117412352",

            reference: paymentRef,

            status: "Pending",

            type: "Wallet Funding",

            createdAt: serverTimestamp()

        };

        await addDoc(

            collection(db,"transactions"),

            transaction

        );

        const message =

`Hello DigiSphere,

I have completed my wallet funding.

Reference: ${paymentRef}

Amount: ₦${amount.toLocaleString("en-NG")}

Bank: ${selectedBank}

Kindly confirm my payment.

Thank you.`;

        window.open(

            "https://wa.me/2349117412352?text=" +

            encodeURIComponent(message),

            "_blank"

        );

        paymentModal.classList.remove("show");

        depositAmount.value = "";

    }

    catch(error){

        console.error(error);

        alert("Unable to create transaction.");

    }

};

/* ===========================
   LOAD TRANSACTIONS
=========================== */

function loadTransactions(){

    const q = query(

        collection(db,"transactions"),

        where("userId","==",currentUser.uid),

        orderBy("createdAt","desc"),

        limit(10)

    );

    onSnapshot(q,(snapshot)=>{

        if(snapshot.empty){

            return;

        }

        recentTransactions.innerHTML = "";

        snapshot.forEach((docItem)=>{

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
