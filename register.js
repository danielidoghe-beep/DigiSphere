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
// ===============================
// EMAIL REGISTRATION
// ===============================

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    registerBtn.disabled = true;
    registerBtn.innerHTML = "Creating account...";

    messageBox.style.display = "none";

    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {

        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        const user = userCredential.user;

        const fullName = `${firstName} ${lastName}`;

        await updateProfile(user, {
            displayName: fullName
        });

        await setDoc(doc(db, "users", user.uid), {

            uid: user.uid,

            name: fullName,

            firstName: firstName,

            lastName: lastName,

            email: email,

            wallet: 0,

            photo: "",

            provider: "email",

            createdAt: serverTimestamp()

        });

        showMessage(
            "Your account has successfully been created.",
            true
        );

        registerBtn.innerHTML = "Create account";

        setTimeout(() => {

            showLoader();

            setTimeout(() => {

                window.location.href = "login.html";

            }, 1500);

        }, 1000);

    }

    catch (error) {

        let message = error.message;

        switch (error.code) {

            case "auth/email-already-in-use":
                message = "This email address is already registered.";
                break;

            case "auth/invalid-email":
                message = "Please enter a valid email address.";
                break;

            case "auth/weak-password":
                message = "Password must be at least 6 characters.";
                break;

            case "auth/network-request-failed":
                message = "No internet connection.";
                break;

            default:
                message = "Unable to create your account.";
        }

        showMessage(message, false);

        registerBtn.disabled = false;
        registerBtn.innerHTML = "Create account";

    }

});
// ===============================
// GOOGLE SIGN UP
// ===============================

googleBtn.addEventListener("click", async () => {

    registerBtn.disabled = true;

    googleBtn.disabled = true;

    googleBtn.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Creating account...
    `;

    messageBox.style.display = "none";

    try {

        const result = await signInWithPopup(auth, provider);

        const user = result.user;

        // Use Google's display name if available,
        // otherwise use the Gmail username before @

        let fullName = "";

        if (user.displayName && user.displayName.trim() !== "") {

            fullName = user.displayName;

        } else {

            fullName = user.email.split("@")[0];

        }

        const nameParts = fullName.trim().split(" ");

        const firstName = nameParts[0];

        const lastName = nameParts.slice(1).join(" ");

        await setDoc(

            doc(db, "users", user.uid),

            {

                uid: user.uid,

                name: fullName,

                firstName: firstName,

                lastName: lastName,

                email: user.email,

                photo: user.photoURL || "",

                provider: "google",

                wallet: 0,

                totalOrders: 0,

                totalSpent: 0,

                accountStatus: "active",

                createdAt: serverTimestamp(),

                lastLogin: serverTimestamp()

            },

            { merge: true }

        );

        showMessage(

            "Your account has been created successfully. Redirecting to Sign in...",

            true

        );

        setTimeout(() => {

            showLoader();

            setTimeout(() => {

                window.location.href = "login.html";

            }, 2000);

        }, 1200);

    }

    catch (error) {

        let message = "Google sign up failed.";

        switch (error.code) {

            case "auth/popup-closed-by-user":
                message = "Google sign up was cancelled.";
                break;

            case "auth/network-request-failed":
                message = "No internet connection.";
                break;

            case "auth/account-exists-with-different-credential":
                message = "An account already exists with this email.";
                break;

        }

        showMessage(message, false);

        registerBtn.disabled = false;

        googleBtn.disabled = false;

        googleBtn.innerHTML = `
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg">
            Continue with Google
        `;

    }

});
