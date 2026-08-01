// =========================
// Firebase Imports
// =========================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";

// =========================
// Firebase Config
// =========================

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

const provider = new GoogleAuthProvider();

// =========================
// Elements
// =========================

const loader = document.getElementById("pageLoader");

const loginForm = document.getElementById("loginForm");

const email = document.getElementById("email");

const password = document.getElementById("password");

const rememberMe = document.getElementById("rememberMe");

const loginBtn = document.getElementById("loginBtn");

const loginBtnText = document.getElementById("loginBtnText");

const loginMessage = document.getElementById("loginMessage");

const googleBtn = document.getElementById("googleLogin");

const togglePassword = document.getElementById("togglePassword");

const themeToggle = document.getElementById("themeToggle");

const menuBtn = document.getElementById("menuBtn");

const mobileMenu = document.getElementById("mobileMenu");

// =========================
// Initial Loading
// =========================

window.addEventListener("load", () => {

    setTimeout(() => {

        loader.classList.add("hide");

    }, 2000);

});
// =========================
// Theme Toggle
// =========================

const savedTheme = localStorage.getItem("theme");

if(savedTheme === "dark"){

    document.body.classList.add("dark");

    themeToggle.innerHTML =
    '<i class="fa-regular fa-sun"></i>';

}

themeToggle.addEventListener("click",()=>{

    document.body.classList.toggle("dark");

    if(document.body.classList.contains("dark")){

        localStorage.setItem("theme","dark");

        themeToggle.innerHTML =
        '<i class="fa-regular fa-sun"></i>';

    }else{

        localStorage.setItem("theme","light");

        themeToggle.innerHTML =
        '<i class="fa-regular fa-moon"></i>';

    }

});

// =========================
// Mobile Menu
// =========================

menuBtn.addEventListener("click",()=>{

    mobileMenu.classList.toggle("active");

    if(mobileMenu.classList.contains("active")){

        menuBtn.innerHTML =
        '<i class="fa-solid fa-xmark"></i>';

    }else{

        menuBtn.innerHTML =
        '<i class="fa-solid fa-bars"></i>';

    }

});

// =========================
// Show / Hide Password
// =========================

togglePassword.addEventListener("click",()=>{

    if(password.type==="password"){

        password.type="text";

        togglePassword.innerHTML =
        '<i class="fa-regular fa-eye-slash"></i>';

    }else{

        password.type="password";

        togglePassword.innerHTML =
        '<i class="fa-regular fa-eye"></i>';

    }

});

// =========================
// Custom Messages
// =========================

function showMessage(type,message){

    loginMessage.className="";

    loginMessage.classList.add(type);

    loginMessage.innerHTML=message;

}

function clearMessage(){

    loginMessage.className="";

    loginMessage.innerHTML="";

}

// =========================
// Button Loading
// =========================

function buttonLoading(text){

    loginBtn.disabled=true;

    loginBtn.innerHTML=`
        <i class="fa-solid fa-spinner fa-spin"></i>
        ${text}
    `;

}

function resetButton(){

    loginBtn.disabled=false;

    loginBtn.innerHTML=`
        <span id="loginBtnText">
            Sign in
        </span>
    `;

}
// =========================
// Login
// =========================

loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    clearMessage();

    buttonLoading("Signing in...");

    try{

        await setPersistence(

            auth,

            rememberMe.checked
            ? browserLocalPersistence
            : browserSessionPersistence

        );

        await signInWithEmailAndPassword(

            auth,

            email.value.trim(),

            password.value

        );

        showMessage(

            "success",

            "✔ Login successful. Redirecting..."

        );

        setTimeout(()=>{

            loader.classList.remove("hide");

            setTimeout(()=>{

                window.location.href="dashboard.html";

            },1800);

        },800);

    }catch(error){

        let message="Unable to sign in.";

        switch(error.code){

            case "auth/invalid-email":
                message="Please enter a valid email address.";
                break;

            case "auth/user-disabled":
                message="This account has been disabled.";
                break;

            case "auth/user-not-found":
                message="No account exists with this email.";
                break;

            case "auth/wrong-password":
                message="Incorrect password.";
                break;

            case "auth/invalid-credential":
                message="Incorrect email or password.";
                break;

            case "auth/network-request-failed":
                message="Check your internet connection.";
                break;

            case "auth/too-many-requests":
                message="Too many attempts. Try again later.";
                break;

            default:
                message=error.message;
                break;

        }

        showMessage(

            "error",

            "✖ "+message

        );

        resetButton();

    }

});

// =========================
// Google Sign In
// =========================

googleBtn.addEventListener("click",async()=>{

    clearMessage();

    try{

        buttonLoading("Signing in...");

        await signInWithPopup(auth,provider);

        showMessage(

            "success",

            "✔ Login successful. Redirecting..."

        );

        setTimeout(()=>{

            loader.classList.remove("hide");

            setTimeout(()=>{

                window.location.href="dashboard.html";

            },1800);

        },800);

    }catch(error){

        showMessage(

            "error",

            "✖ "+error.message

        );

        resetButton();

    }

});
