document.addEventListener("DOMContentLoaded", () => {
    // Firebase Configuration
    const firebaseConfig = {
        apiKey: "AIzaSyAKyJu9Cq_X79-2wUKHGaKU_FDM_TLg-J8",
        authDomain: "flowmate-b77d4.firebaseapp.com",
        projectId: "flowmate-b77d4",
        storageBucket: "flowmate-b77d4.appspot.com",
        messagingSenderId: "764799980488",
        appId: "1:764799980488:web:9a82d81b58ded3a27566fd"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore(); // Initialize Firestore

    // Get elements for Sign-Up and Login forms
    const signupForm = document.getElementById("signup-form");
    const loginForm = document.getElementById("login-form");
    const switchToLogin = document.getElementById("switch-to-login");
    const switchToSignup = document.getElementById("switch-to-signup");

    // **Set initial visibility (Only login form visible by default)**
    signupForm.style.display = "none"; 
    loginForm.style.display = "block"; 

    console.log("Page initialized. Default: Login form is visible.");

    // Switch to Login Form
    switchToLogin.addEventListener("click", (event) => {
        event.preventDefault();
        signupForm.style.display = "none"; 
        loginForm.style.display = "block";
        console.log("Switched to Login form.");
    });

    // Switch to Sign-Up Form
    switchToSignup.addEventListener("click", (event) => {
        event.preventDefault();
        loginForm.style.display = "none";
        signupForm.style.display = "block"; 
        console.log("Switched to Sign-Up form.");
    });

    // Handle Sign-Up
    const signupButton = document.getElementById("signup-btn");
    signupButton.addEventListener("click", (event) => {
        event.preventDefault();
        const email = document.getElementById("signup-email").value;
        const password = document.getElementById("signup-password").value;
        const confirmPassword = document.getElementById("signup-confirm-password").value;

        if (!email || !password || !confirmPassword) {
            alert("All fields are required!");
            return;
        }
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;

                // Save user data to Firestore
                db.collection("users").doc(user.uid).set({
                    email: user.email,
                    availability: "unavailable" // Default value
                }).then(() => {
                    alert("Sign-Up Successful!");
                    window.location.href = "app.html"; // Redirect to app page
                }).catch((error) => {
                    console.error("Firestore Error:", error.message);
                    alert("Could not save user data: " + error.message);
                });
            }).catch((error) => {
                console.error("Sign-Up Error:", error.message);
                alert(error.message);
            });
    });

    // Handle Login
    const loginButton = document.getElementById("login-btn");
    loginButton.addEventListener("click", (event) => {
        event.preventDefault();

        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;

        // Validate input
        if (!email || !password) {
            alert("Email and Password are required!");
            return;
        }

        // Firebase Login
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                alert("Login Successful!");

                // Fetch user data from Firestore
                db.collection("users").doc(user.uid).get()
                    .then((doc) => {
                        if (doc.exists) {
                            const userData = doc.data();
                            console.log("User Data:", userData);
                            alert(`Welcome back, ${userData.email}! Your availability is ${userData.availability}.`);
                        } else {
                            console.log("No user data found.");
                            alert("No user data found.");
                        }
                    })
                    .catch((error) => {
                        console.error("Error retrieving user data:", error.message);
                        alert("Error retrieving user data: " + error.message);
                    });

                window.location.href = "app.html"; // Redirect to app page
            })
            .catch((error) => {
                console.error("Login Error:", error.message);
                alert(error.message);
            });
    });
});
