import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

/*==================================
ELEMENTS
==================================*/

const walletBalance =
document.getElementById("walletBalance");

const amountInput =
document.getElementById("amountInput");

const openPaymentBtn =
document.getElementById("openPaymentBtn");

const paymentOverlay =
document.getElementById("paymentOverlay");

const paymentModal =
document.getElementById("paymentModal");

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

const transactionList =
document.getElementById("transactionList");

const quickButtons =
document.querySelectorAll(".amount-btn");

/*==================================
GLOBAL VARIABLES
==================================*/

let currentUser = null;

let currentAmount = 0;

let currentReference = "";

let currentBank = "";

const accountName =
"Ogaga Blessing Idoghe";

const whatsappNumber =
"2349117412352";

const accountNo =
"9117412352";

/*==================================
HELPERS
==================================*/

function formatMoney(value){

    return "₦" +

    Number(value).toLocaleString("en-NG");

}

function generateReference(){

    return "DS" + Date.now();

}

/*==================================
BANK ROTATION
==================================*/

function getBank(){

    const lastBank =
    localStorage.getItem("lastBank");

    if(lastBank === "PalmPay"){

        currentBank = "OPay";

    }else{

        currentBank = "PalmPay";

    }

    localStorage.setItem(

        "lastBank",

        currentBank

    );

    return currentBank;

}
/*==================================
AUTH
==================================*/

onAuthStateChanged(auth, async(user)=>{

    if(!user){

        window.location.href = "login.html";

        return;

    }

    currentUser = user;

    loadWallet(user.uid);

    loadTransactions(user.uid);

});

/*==================================
LOAD WALLET
==================================*/

async function loadWallet(userId){

    try{

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

    catch(error){

        console.error(error);

    }

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

onAuthStateChanged(auth,(user)=>{

    if(user){

        watchWallet(user.uid);

    }

});

/*==================================
QUICK AMOUNT BUTTONS
==================================*/

quickButtons.forEach(button=>{

    button.type = "button";

    button.addEventListener("click",(e)=>{

        e.preventDefault();

        quickButtons.forEach(btn=>{

            btn.classList.remove("active");

        });

        button.classList.add("active");

        amountInput.value =

        button.dataset.amount;

        currentAmount =

        Number(button.dataset.amount);

    });

});

/*==================================
INPUT CHANGED
==================================*/

amountInput.addEventListener("input",()=>{

    currentAmount =

    Number(amountInput.value || 0);

    quickButtons.forEach(btn=>{

        if(

            btn.dataset.amount ===

            amountInput.value

        ){

            btn.classList.add("active");

        }

        else{

            btn.classList.remove("active");

        }

    });

});
/*==================================
OPEN PAYMENT
==================================*/

openPaymentBtn.addEventListener("click",()=>{

    currentAmount = Number(amountInput.value || 0);

    if(currentAmount < 1000){

        alert("Minimum wallet funding is ₦1,000.");

        amountInput.focus();

        return;

    }

    /* Generate Reference */

    currentReference = generateReference();

    paymentReference.textContent = currentReference;

    /* Amount */

    paymentAmount.textContent =

    formatMoney(currentAmount);

    /* Rotate Bank */

    bankName.textContent = getBank();

    /* Account Number */

    accountNumber.textContent = accountNo;

    /* Loading Effect */

    const oldText = openPaymentBtn.innerHTML;

    openPaymentBtn.disabled = true;

    openPaymentBtn.innerHTML = `

        <i class="ri-loader-4-line ri-spin"></i>

        Opening...

    `;

    setTimeout(()=>{

        openPaymentBtn.innerHTML = oldText;

        openPaymentBtn.disabled = false;

        paymentOverlay.classList.add("active");

        paymentModal.classList.add("active");

    },1000);

});

/*==================================
CLOSE POPUP
==================================*/

function closePopup(){

    paymentOverlay.classList.remove("active");

    paymentModal.classList.remove("active");

}

closePayment.addEventListener(

    "click",

    closePopup

);

cancelPayment.addEventListener(

    "click",

    closePopup

);

paymentOverlay.addEventListener(

    "click",

    closePopup

);

/*==================================
COPY ACCOUNT NUMBER
==================================*/

copyAccount.addEventListener("click",async()=>{

    try{

        await navigator.clipboard.writeText(accountNo);

        copyAccount.textContent = "Copied";

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
CREATE TRANSACTION
==================================*/

sendProofBtn.addEventListener("click", async()=>{

    if(!currentUser){

        alert("Please login again.");

        return;

    }

    try{

        sendProofBtn.disabled = true;

        const oldText = sendProofBtn.innerHTML;

        sendProofBtn.innerHTML = `
            <i class="ri-loader-4-line ri-spin"></i>
            Creating Transaction...
        `;

        /* SAVE TO FIREBASE */

        await addDoc(

            collection(db,"transactions"),

            {

                userId: currentUser.uid,

                type: "Wallet Top-up",

                amount: currentAmount,

                bank: currentBank,

                accountName: accountName,

                accountNumber: accountNo,

                reference: currentReference,

                status: "Pending",

                createdAt: serverTimestamp()

            }

        );

        /* OPEN WHATSAPP */

        const message =

`Hello DigiSphere,

I have funded my wallet.

Amount: ${formatMoney(currentAmount)}

Bank: ${currentBank}

Reference: ${currentReference}

Account Name: ${accountName}

Account Number: ${accountNo}

I have attached my payment receipt for confirmation.

Thank you.`;

        window.open(

            `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,

            "_blank"

        );

        sendProofBtn.innerHTML = oldText;

        sendProofBtn.disabled = false;

        amountInput.value = "";

        currentAmount = 0;

        quickButtons.forEach(btn=>{

            btn.classList.remove("active");

        });

        closePopup();

    }

    catch(error){

        console.error(error);

        alert("Unable to submit payment.");

        sendProofBtn.disabled = false;

        sendProofBtn.innerHTML = `
            <i class="ri-whatsapp-line"></i>
            Send Proof to WhatsApp
        `;

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

        limit(20)

    );

    onSnapshot(q,(snapshot)=>{

        transactionList.innerHTML = "";

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

        snapshot.forEach((docSnap)=>{

            const item = docSnap.data();

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

                            ${date ? " • "+date : ""}

                        </p>

                        <div class="transaction-bottom">

                            <span class="transaction-amount">

                                ${formatMoney(item.amount)}

                            </span>

                            <span class="status ${String(item.status).toLowerCase()}">

                                ${item.status}

                            </span>

                        </div>

                    </div>

                </div>

            </div>

            `;

        });

    });

}
