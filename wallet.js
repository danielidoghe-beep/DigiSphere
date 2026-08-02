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
    getDocs,
    addDoc,
    serverTimestamp
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
GLOBAL VARIABLES
==================================*/

let currentUser = null;

let currentReference = "";

let currentBank = "PalmPay";

let currentAccountNumber = "9117412352";

const accountName = "Ogaga Blessing Idoghe";

const whatsappNumber = "2349117412352";

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

function showLoading(){

    if(!loadingScreen) return;

    loadingScreen.style.display="flex";

    loadingScreen.classList.remove("hide");

}

function showMinimumToast(){

    if(!minimumToast) return;

    minimumToast.classList.add("show");

    setTimeout(()=>{

        minimumToast.classList.remove("show");

    },3000);

}

function generateReference(){

    return "DS" + Date.now();

}

function formatMoney(amount){

    return "₦" +

    Number(amount).toLocaleString("en-NG");

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

    currentUser = user;

    try{

        await loadWallet(user.uid);

        watchWallet(user.uid);

        loadTransactions(user.uid);

    }

    catch(error){

        console.error(error);

    }

    finally{

        hideLoading();

    }

});

/*==================================
LOAD WALLET
==================================*/

async function loadWallet(userId){

    const userRef = doc(db,"users",userId);

    const snap = await getDoc(userRef);

    if(!snap.exists()) return;

    const data = snap.data();

    const balance = Number(

        data.wallet ||

        data.walletBalance ||

        0

    );

    walletBalance.textContent =

    formatMoney(balance);

}

/*==================================
REALTIME WALLET
==================================*/

function watchWallet(userId){

    const userRef = doc(db,"users",userId);

    onSnapshot(userRef,(snap)=>{

        if(!snap.exists()) return;

        const data = snap.data();

        const balance = Number(

            data.wallet ||

            data.walletBalance ||

            0

        );

        walletBalance.textContent =

        formatMoney(balance);

    });

}

/*==================================
QUICK AMOUNT BUTTONS
==================================*/

quickButtons.forEach(button=>{

    button.addEventListener("click",()=>{

        quickButtons.forEach(btn=>{

            btn.classList.remove("active");

        });

        button.classList.add("active");

        amountInput.value =

        button.dataset.amount;

        amountInput.dispatchEvent(

            new Event("input")

        );

    });

});

/*==================================
AMOUNT INPUT
==================================*/

amountInput.addEventListener("input",()=>{

    const amount = Number(

        amountInput.value || 0

    );

    quickButtons.forEach(btn=>{

        if(btn.dataset.amount===amountInput.value){

            btn.classList.add("active");

        }else{

            btn.classList.remove("active");

        }

    });

    if(amount>=1000){

        if(minimumToast){

            minimumToast.classList.remove("show");

        }

    }

});
/*==================================
BANK ROTATION
==================================*/

function getNextBank(){

    const lastBank = localStorage.getItem("lastBank");

    if(lastBank === "PalmPay"){

        currentBank = "OPay";

    }else{

        currentBank = "PalmPay";

    }

    localStorage.setItem("lastBank", currentBank);

    return currentBank;

}

/*==================================
OPEN PAYMENT
==================================*/

openPaymentBtn.addEventListener("click",()=>{

    const amount = Number(amountInput.value || 0);

    if(amount < 1000){

        showMinimumToast();

        return;

    }

    /* Button Loading */

    const oldText = openPaymentBtn.innerHTML;

    openPaymentBtn.disabled = true;

    openPaymentBtn.innerHTML = `

        <span class="btn-spinner"></span>

        Opening...

    `;

    setTimeout(()=>{

        openPaymentBtn.disabled = false;

        openPaymentBtn.innerHTML = oldText;

        /* Generate Reference */

        currentReference = generateReference();

        paymentReference.textContent = currentReference;

        /* Amount */

        paymentAmount.textContent = formatMoney(amount);

        /* Rotate Bank */

        bankName.textContent = getNextBank();

        /* Account Number */

        accountNumber.textContent = currentAccountNumber;

        /* Open Popup */

        paymentOverlay.classList.add("active");

        paymentModal.classList.add("active");

    },1200);

});

/*==================================
CLOSE PAYMENT
==================================*/

function closePopup(){

    paymentOverlay.classList.remove("active");

    paymentModal.classList.remove("active");

}

if(closePayment){

    closePayment.addEventListener("click",closePopup);

}

if(cancelPayment){

    cancelPayment.addEventListener("click",closePopup);

}

if(paymentOverlay){

    paymentOverlay.addEventListener("click",closePopup);

}

/*==================================
COPY ACCOUNT
==================================*/

copyAccount.addEventListener("click",async()=>{

    try{

        await navigator.clipboard.writeText(

            currentAccountNumber

        );

        copyAccount.textContent = "Copied ✓";

        setTimeout(()=>{

            copyAccount.textContent = "Copy";

        },2000);

    }

    catch(error){

        console.error(error);

    }

});
/*==================================
SEND PROOF TO WHATSAPP
SAVE TRANSACTION
==================================*/

sendProofBtn.addEventListener("click", async()=>{

    if(!currentUser) return;

    try{

        const amount = Number(amountInput.value);

        /* Save Transaction */

        await addDoc(

            collection(db,"transactions"),

            {

                userId: currentUser.uid,

                type: "Wallet Top-up",

                amount: amount,

                bank: currentBank,

                accountName: accountName,

                accountNumber: currentAccountNumber,

                reference: currentReference,

                status: "Pending",

                createdAt: serverTimestamp()

            }

        );

        /* WhatsApp Message */

        const message =

`Hello DigiSphere,

I have completed a wallet funding.

Amount: ${formatMoney(amount)}

Bank: ${currentBank}

Reference: ${currentReference}

Account Name: ${accountName}

Please find my payment receipt attached for confirmation.

Thank you.`;

        window.open(

            `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,

            "_blank"

        );

        closePopup();

        amountInput.value = "";

        quickButtons.forEach(btn=>{

            btn.classList.remove("active");

        });

    }

    catch(error){

        console.error(error);

        alert("Unable to create transaction.");

    }

});

/*==================================
LOAD TRANSACTIONS
==================================*/

function loadTransactions(userId){

    const q = query(

        collection(db,"transactions"),

        where("userId","==",userId),

        orderBy("createdAt","desc"),

        limit(10)

    );

    onSnapshot(q,(snapshot)=>{

        if(snapshot.empty){

            transactionList.innerHTML = `

                <div class="empty-transactions">

                    <i class="ri-exchange-funds-line"></i>

                    <h3>No Transactions Yet</h3>

                    <p>Your wallet funding history will appear here.</p>

                </div>

            `;

            return;

        }

        transactionList.innerHTML = "";

        snapshot.forEach((docItem)=>{

            const item = docItem.data();

            const amount =

                formatMoney(item.amount || 0);

            const status =

                item.status || "Pending";

            const statusClass =

                status.toLowerCase();

            let date = "";

            if(item.createdAt?.toDate){

                date = item.createdAt
                    .toDate()
                    .toLocaleString("en-GB");

            }

            transactionList.innerHTML += `

                <div class="transaction-card">

                    <div class="transaction-left">

                        <div class="transaction-icon">

                            <i class="ri-wallet-3-line"></i>

                        </div>

                        <div class="transaction-info">

                            <h3>

                                ${item.type}

                            </h3>

                            <p>

                                ${item.reference}

                                ${date ? "• "+date : ""}

                            </p>

                            <div class="transaction-bottom">

                                <span class="transaction-amount">

                                    ${amount}

                                </span>

                                <span class="status ${statusClass}">

                                    ${status}

                                </span>

                            </div>

                        </div>

                    </div>

                </div>

            `;

        });

    });

}

/*==================================
GLOBAL ERROR HANDLER
==================================*/

window.addEventListener("error",()=>{

    hideLoading();

});

window.addEventListener("unhandledrejection",()=>{

    hideLoading();

});
