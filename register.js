// ==========================================
// DigiSphere Register Page - Part 1
// ==========================================

// Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

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

const db = getFirestore(app);

const provider = new GoogleAuthProvider();

// ==========================================
// Elements
// ==========================================

const loader = document.getElementById("loader");

const form = document.getElementById("registerForm");

const registerBtn = document.getElementById("registerBtn");

const googleBtn = document.getElementById("googleRegister");

const messageBox = document.getElementById("messageBox");

const themeToggle = document.getElementById("themeToggle");

const password = document.getElementById("password");

const togglePassword = document.getElementById("togglePassword");

// ==========================================
// Loading Screen
// ==========================================

window.addEventListener("load", () => {

    setTimeout(() => {

        loader.style.opacity = "0";

        setTimeout(() => {

            loader.style.display = "none";

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
// Password Toggle
// ==========================================

togglePassword.addEventListener("click",()=>{

    if(password.type==="password"){

        password.type="text";

        togglePassword.innerHTML='<i class="fa-regular fa-eye-slash"></i>';

    }else{

        password.type="password";

        togglePassword.innerHTML='<i class="fa-regular fa-eye"></i>';

    }

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
// Email Registration
// ==========================================

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    clearMessage();

    registerBtn.disabled = true;

    registerBtn.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Creating account...
    `;

    const firstName = document.getElementById("firstName").value.trim();

    const lastName = document.getElementById("lastName").value.trim();

    const email = document.getElementById("email").value.trim();

    const userPassword = password.value;

    try{

        const credential = await createUserWithEmailAndPassword(
            auth,
            email,
            userPassword
        );

        const user = credential.user;

        const fullName = `${firstName} ${lastName}`;

        await updateProfile(user,{
            displayName:fullName
        });

        await setDoc(doc(db,"users",user.uid),{

            uid:user.uid,

            firstName,

            lastName,

            name:fullName,

            email:user.email,

            photo:user.photoURL || "",

            provider:"email",

            wallet:0,

            totalOrders:0,

            totalSpent:0,

            accountStatus:"active",

            createdAt:serverTimestamp(),

            lastLogin:serverTimestamp()

        });

        showMessage(
            "Your account has been created successfully. Redirecting to Sign in...",
            true
        );

        showLoader();

        setTimeout(()=>{

            window.location.href="login.html";

        },2000);

    }catch(error){

        let message="Unable to create your account.";

        switch(error.code){

            case "auth/email-already-in-use":
                message="This email address is already registered.";
                break;

            case "auth/invalid-email":
                message="Please enter a valid email address.";
                break;

            case "auth/weak-password":
                message="Password must be at least 6 characters.";
                break;

            case "auth/network-request-failed":
                message="No internet connection.";
                break;

        }

        showMessage(message,false);

        registerBtn.disabled=false;

        registerBtn.innerHTML="Create account";

    }

});

// ==========================================
// Google Registration
// ==========================================

googleBtn.addEventListener("click",async()=>{

    clearMessage();

    googleBtn.disabled=true;

    googleBtn.innerHTML=`
        <i class="fa-solid fa-spinner fa-spin"></i>
        Creating account...
    `;

    try{

        const result=await signInWithPopup(auth,provider);

        const user=result.user;

        let fullName="";

        if(user.displayName && user.displayName.trim()!==""){

            fullName=user.displayName;

        }else{

            fullName=user.email.split("@")[0];

        }

        const names=fullName.split(" ");

        const firstName=names[0];

        const lastName=names.slice(1).join(" ");

        await setDoc(doc(db,"users",user.uid),{

            uid:user.uid,

            firstName,

            lastName,

            name:fullName,

            email:user.email,

            photo:user.photoURL || "",

            provider:"google",

            wallet:0,

            totalOrders:0,

            totalSpent:0,

            accountStatus:"active",

            createdAt:serverTimestamp(),

            lastLogin:serverTimestamp()

        },{merge:true});

        showMessage(
            "Your account has been created successfully. Redirecting to Sign in...",
            true
        );

        showLoader();

        setTimeout(()=>{

            window.location.href="login.html";

        },2000);

    }catch(error){

        let message="Google sign up failed.";

        switch(error.code){

            case "auth/popup-closed-by-user":
                message="Google sign up cancelled.";
                break;

            case "auth/network-request-failed":
                message="No internet connection.";
                break;

            case "auth/account-exists-with-different-credential":
                message="An account already exists with this email.";
                break;

        }

        showMessage(message,false);

        googleBtn.disabled=false;

        googleBtn.innerHTML=`
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg">
            Continue with Google
        `;

    }

});
