import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    getFirestore,
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig = {
    // Paste your Firebase config here
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const form = document.getElementById("registerForm");
const registerBtn = document.getElementById("registerBtn");
const messageBox = document.getElementById("messageBox");
const loader = document.getElementById("loader");

const googleBtn = document.getElementById("googleRegister");

function showLoader() {
    loader.style.display = "flex";
}

function hideLoader() {
    loader.style.display = "none";
}

window.addEventListener("load", () => {
    setTimeout(hideLoader, 1200);
});

function showMessage(text, success = false) {

    messageBox.style.display = "block";

    messageBox.textContent = text;

    if (success) {

        messageBox.className = "success-message";

    } else {

        messageBox.className = "error-message";

    }

}
