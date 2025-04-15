// Firebase Configuration (if not already in a shared config file)
const firebaseConfig = {
    apiKey: "AIzaSyAKyJu9Cq_X79-2wUKHGaKU_FDM_TLg-J8",
    authDomain: "flowmate-b77d4.firebaseapp.com",
    projectId: "flowmate-b77d4",
    storageBucket: "flowmate-b77d4.firebasestorage.app",
    messagingSenderId: "764799980488",
    appId: "1:764799980488:web:9a82d81b58ded3a27566fd"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Add listener to form submission for saving profile details
document.getElementById("profile-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    console.log("Profile save initiated.");

    // Collect form inputs
    const name = document.getElementById("name").value.trim();
    const contactNumber = document.getElementById("contact-number").value.trim();
    const email = document.getElementById("email").value.trim();
    const dateOfBirth = document.getElementById("date-of-birth").value;
    const address = document.getElementById("address").value.trim();
    const occupation = document.getElementById("occupation").value.trim();
    const bio = document.getElementById("bio").value.trim();
    const skills = document.getElementById("skills").value.split(",").map(skill => skill.trim());
    const emergencyContact = document.getElementById("emergency-contact").value.trim();

    // Validate user authentication
    const user = auth.currentUser;
    if (!user) {
        console.error("Error: User not logged in.");
        alert("User not logged in. Please log in and try again.");
        return;
    }

    // Prepare data object
    const profileData = {
        name,
        contactNumber,
        email,
        dateOfBirth,
        address,
        occupation,
        bio,
        skills,
        emergencyContact
    };

    try {
        console.log("Saving profile data to Firestore:", profileData);
        const userDoc = db.collection("users").doc(user.uid);

        // Save to Firestore
        await userDoc.set(profileData, { merge: true });
        console.log("Profile data saved successfully.");

        alert("Profile updated successfully!");
        displayUserProfile(profileData); // Update profile display

        // Redirect to dashboard after saving
        window.location.href = "app.html";
    } catch (error) {
        console.error("Error saving profile:", error.message);
        alert("Failed to save profile. Please try again later.");
    }
});

// Display user profile details
function displayUserProfile(profileData) {
    const profileInfo = document.getElementById("profile-info");
    profileInfo.innerHTML = `
        <p><strong>Name:</strong> ${profileData.name}</p>
        <p><strong>Contact Number:</strong> ${profileData.contactNumber}</p>
        <p><strong>Email:</strong> ${profileData.email}</p>
        <p><strong>Date of Birth:</strong> ${profileData.dateOfBirth || "N/A"}</p>
        <p><strong>Address:</strong> ${profileData.address || "N/A"}</p>
        <p><strong>Occupation:</strong> ${profileData.occupation || "N/A"}</p>
        <p><strong>Bio:</strong> ${profileData.bio || "N/A"}</p>
        <p><strong>Skills:</strong> ${profileData.skills ? profileData.skills.join(", ") : "N/A"}</p>
        <p><strong>Emergency Contact:</strong> ${profileData.emergencyContact || "N/A"}</p>
    `;
}

// Fetch and display saved profile on load
auth.onAuthStateChanged((user) => {
    if (user) {
        const userDoc = db.collection("users").doc(user.uid);
        userDoc.get()
            .then((doc) => {
                if (doc.exists) {
                    console.log("User profile fetched successfully:", doc.data());
                    displayUserProfile(doc.data());
                } else {
                    console.log("No profile data found.");
                    alert("No profile data found. Please complete your profile.");
                }
            })
            .catch((error) => {
                console.error("Error fetching profile data:", error.message);
            });
    } else {
        alert("User not logged in. Redirecting to login page.");
        window.location.href = "index.html"; // Redirect to login if user is not authenticated
    }
});

// Logout functionality
document.getElementById("logout-btn").addEventListener("click", () => {
    console.log("Logout button clicked.");
    auth.signOut()
        .then(() => {
            console.log("User signed out successfully.");
            alert("Logout successful!");
            window.location.href = "index.html";
        })
        .catch((error) => {
            console.error("Error signing out:", error.message);
            alert("Logout failed. Please try again.");
        });
});

// Debug: Monitor auth state changes
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log("Auth state changed: User logged in:", user.email);
    } else {
        console.log("Auth state changed: No user logged in. Redirecting...");
        window.location.href = "index.html";
    }
});
