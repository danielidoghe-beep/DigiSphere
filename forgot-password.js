// ==========================================
// DigiSphere Forgot Password
// ==========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js";

import {
    getAuth,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";

// ==========================================
// Firebase Config
// ==========================================

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

// ==========================================
// Elements
// ==========================================

const loader = document.getElementById("loader");

const form = document.getElementById("resetForm");

const email = document.getElementById("email");

const resetBtn = document.getElementById("resetBtn");

const resetBtnText = document.getElementById("resetBtnText");

const messageBox = document.getElementById("messageBox");

const themeToggle = document.getElementById("themeToggle");

const menuBtn = document.getElementById("menuBtn");

const mobileMenu = document.getElementById("mobileMenu");

// ==========================================
// Loading Screen
// ==========================================

window.addEventListener("load",()=>{

    setTimeout(()=>{

        loader.style.opacity="0";

        setTimeout(()=>{

            loader.style.display="none";

        },300);

    },1500);

});

function showLoader(){

    loader.style.display="flex";

    loader.style.opacity="1";

}

// ==========================================
// Theme
// ==========================================

if(localStorage.getItem("theme")==="dark"){

    document.body.classList.add("dark");

    themeToggle.innerHTML='<i class="fa-solid fa-sun"></i>';

}

themeToggle.addEventListener("click",()=>{

    document.body.classList.toggle("dark");

    if(document.body.classList.contains("dark")){

        localStorage.setItem("theme","dark");

        themeToggle.innerHTML='<i class="fa-solid fa-sun"></i>';

    }else{

        localStorage.setItem("theme","light");

        themeToggle.innerHTML='<i class="fa-solid fa-moon"></i>';

    }

});

// ==========================================
// Mobile Menu
// ==========================================

menuBtn.addEventListener("click",()=>{

    mobileMenu.classList.toggle("active");

});

// ==========================================
// Messages
// ==========================================

function showMessage(message,success=false){

    messageBox.style.display="block";

    messageBox.textContent=message;

    if(success){

        messageBox.className="success-message";

    }else{

        messageBox.className="error-message";

    }

}

function clearMessage(){

    messageBox.style.display="none";

    messageBox.className="";

    messageBox.textContent="";

}

// ==========================================
// Countdown
// ==========================================

function startCountdown(){

    let seconds=60;

    resetBtn.disabled=true;

    const timer=setInterval(()=>{

        resetBtnText.textContent=`Resend in ${seconds}s`;

        seconds--;

        if(seconds<0){

            clearInterval(timer);

            resetBtn.disabled=false;

            resetBtnText.textContent="Send reset link";

        }

    },1000);

}

// ==========================================
// Reset Password
// ==========================================

form.addEventListener("submit",async(e)=>{

    e.preventDefault();

    clearMessage();

    resetBtn.disabled=true;

    resetBtn.innerHTML=`
        <i class="fa-solid fa-spinner fa-spin"></i>
        Sending...
    `;

    try{

        await sendPasswordResetEmail(auth,email.value.trim());

        showMessage(

            "Reset link has been sent to your email. If you don't see it, check your Spam folder. If you find it there, mark it as 'Not spam' so future DigiSphere emails arrive in your Inbox. Then open the email and follow the password reset instructions.",

            true

        );

        resetBtn.innerHTML='<span id="resetBtnText">Send reset link</span>';

        startCountdown();

    }

    catch(error){

        let message="Unable to send reset link.";

        switch(error.code){

            case "auth/invalid-email":
                message="Please enter a valid email address.";
                break;

            case "auth/user-not-found":
                message="No account exists with this email address.";
                break;

            case "auth/network-request-failed":
                message="No internet connection.";
                break;

            case "auth/too-many-requests":
                message="Too many requests. Please wait before trying again.";
                break;

        }

        showMessage(message,false);

        resetBtn.disabled=false;

        resetBtn.innerHTML='<span id="resetBtnText">Send reset link</span>';

    }

});
