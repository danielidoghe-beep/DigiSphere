import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    doc,
    getDoc,
    onSnapshot,
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

/*==================================
ELEMENTS
==================================*/

const loadingScreen =
document.getElementById("loadingScreen");

const walletBalance =
document.getElementById("walletBalance");

const amountInput =
document.getElementById("amountInput");

const openPaymentBtn =
document.getElementById("openPaymentBtn");

const paymentModal =
document.getElementById("paymentModal");

const paymentOverlay =
document.getElementById("paymentOverlay");

const paymentAmount =
document.getElementById("paymentAmount");

const paymentReference =
document.getElementById("paymentReference");

const bankName =
document.getElementById("bankName");

const accountNumber =
document.getElementById("accountNumber");

const copyAccount =
document.getElementById("copyAccount");

const sendProofBtn =
document.getElementById("sendProofBtn");

const closePayment =
document.getElementById("closePayment");

const cancelPayment =
document.getElementById("cancelPayment");

const minimumToast =
document.getElementById("minimumToast");

const transactionList =
document.getElementById("transactionList");

const quickButtons =
document.querySelectorAll(".amount-btn");

const backBtn =
document.getElementById("backBtn");

/*==================================
HELPERS
==================================*/

function hideLoading(){

    if(!loadingScreen) return;

    loadingScreen.classList.add("hide");

    setTimeout(()=>{

        loadingScreen.style.display="none";

    },300);

}

function showMinimumToast(){

    if(!minimumToast) return;

    minimumToast.classList.add("show");

    setTimeout(()=>{

        minimumToast.classList.remove("show");

    },3000);

}

function generateReference(){

    return "TS" + Date.now();

}
/*==================================
BACK BUTTON
==================================*/

if(backBtn){

    backBtn.addEventListener("click",()=>{

        window.location.href="dashboard.html";

    });

}

/*==================================
AUTH
==================================*/

onAuthStateChanged(auth,async(user)=>{

    if(!user){

        window.location.replace("login.html");

        return;

    }

    await loadWallet(user.uid);

    watchWallet(user.uid);

    await loadTransactions(user.uid);

});

/*==================================
LOAD WALLET
==================================*/

async function loadWallet(userId){

    try{

        const userRef =
        doc(db,"users",userId);

        const userSnap =
        await getDoc(userRef);

        if(!userSnap.exists()){

            hideLoading();

            return;

        }

        const data =
        userSnap.data();

        const balance =
        Number(data.walletBalance || 0);

        walletBalance.textContent =
        "₦" + balance.toLocaleString("en-NG");

    }catch(error){

        console.error(error);

    }finally{

        hideLoading();

    }

}

/*==================================
REALTIME WALLET
==================================*/

function watchWallet(userId){

    const userRef =
    doc(db,"users",userId);

    onSnapshot(userRef,(snapshot)=>{

        if(!snapshot.exists()) return;

        const data =
        snapshot.data();

        walletBalance.textContent =
        "₦" +
        Number(
            data.walletBalance || 0
        ).toLocaleString("en-NG");

    });

}

/*==================================
QUICK AMOUNT BUTTONS
==================================*/

quickButtons.forEach((button)=>{

    button.addEventListener("click",()=>{

        quickButtons.forEach((btn)=>{

            btn.classList.remove("active");

        });

        button.classList.add("active");

        amountInput.value =
        button.dataset.amount;

        amountInput.focus();

    });

});

/*==================================
REMOVE ACTIVE WHEN USER TYPES
==================================*/

amountInput.addEventListener("input",()=>{

    quickButtons.forEach((btn)=>{

        if(btn.dataset.amount === amountInput.value){

            btn.classList.add("active");

        }else{

            btn.classList.remove("active");

        }

    });

});
/*==================================
BANK ROTATION
==================================*/

function getNextBank(){

    const lastBank =
    localStorage.getItem("lastBank");

    let nextBank;

    if(lastBank === "PalmPay"){

        nextBank = "OPay";

    }else{

        nextBank = "PalmPay";

    }

    localStorage.setItem(
        "lastBank",
        nextBank
    );

    return nextBank;

}

/*==================================
OPEN PAYMENT
==================================*/

openPaymentBtn.addEventListener("click",()=>{

    const amount =
    Number(amountInput.value);

    if(amount < 1000){

        showMinimumToast();

        return;

    }

    /* Amount */

    paymentAmount.textContent =
    "₦" + amount.toLocaleString("en-NG");

    /* Reference */

    paymentReference.textContent =
    generateReference();

    /* Rotate Bank */

    const bank =
    getNextBank();

    bankName.textContent =
    bank;

    /* Same account details */

    accountNumber.textContent =
    "9117412352";

    /* Open Popup */

    paymentModal.classList.add("active");

    paymentOverlay.classList.add("active");

});

/*==================================
CLOSE PAYMENT
==================================*/

function closePaymentModal(){

    paymentModal.classList.remove("active");

    paymentOverlay.classList.remove("active");

}

closePayment.addEventListener(
    "click",
    closePaymentModal
);

cancelPayment.addEventListener(
    "click",
    closePaymentModal
);

paymentOverlay.addEventListener(
    "click",
    closePaymentModal
);

/*==================================
COPY ACCOUNT NUMBER
==================================*/

copyAccount.addEventListener("click",async()=>{

    try{

        await navigator.clipboard.writeText(
            accountNumber.textContent
        );

        copyAccount.textContent =
        "Copied";

        setTimeout(()=>{

            copyAccount.textContent =
            "Copy";

        },2000);

    }catch(error){

        console.error(error);

    }

});
/*==================================
SEND PROOF TO WHATSAPP
==================================*/

sendProofBtn.addEventListener("click",()=>{

    const amount =
    paymentAmount.textContent;

    const reference =
    paymentReference.textContent;

    const bank =
    bankName.textContent;

    const message =

`Hello ThesuftSocials,

I have made a bank transfer.

Amount: ${amount}

Bank: ${bank}

Reference: ${reference}

Please find my payment receipt attached below for confirmation.

Thank you.`;

    const whatsappNumber =
    "2349117412352";

    const whatsappUrl =

`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    window.open(
        whatsappUrl,
        "_blank"
    );

});

/*==================================
LOAD RECENT TRANSACTIONS
==================================*/

async function loadTransactions(userId){

    try{

        const q = query(

            collection(db,"transactions"),

            where("userId","==",userId),

            orderBy("createdAt","desc"),

            limit(5)

        );

        const snapshot =
        await getDocs(q);

        if(snapshot.empty){

            return;

        }

        transactionList.innerHTML = "";

        snapshot.forEach((document)=>{

            const item =
            document.data();

            transactionList.innerHTML += `

            <div class="transaction-card">

                <div class="transaction-icon">

                    <i class="ri-wallet-3-line"></i>

                </div>

                <div class="transaction-info">

                    <h3>${item.type || "Wallet Top-up"}</h3>

                    <p>${item.status || "Pending"}</p>

                    <div class="transaction-bottom">

                        <span class="transaction-amount">

                            ₦${Number(
                                item.amount || 0
                            ).toLocaleString("en-NG")}

                        </span>

                        <span class="status ${String(item.status || "").toLowerCase()}">

                            ${item.status || "Pending"}

                        </span>

                    </div>

                </div>

            </div>

            `;

        });

    }catch(error){

        console.error(error);

    }

}

/*==================================
HIDE LOADING IF ERROR
==================================*/

window.addEventListener("error",()=>{

    hideLoading();

});

window.addEventListener("unhandledrejection",()=>{

    hideLoading();

});
