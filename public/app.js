// Wait for the DOM to fully load
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
    const db = firebase.firestore();
    const auth = firebase.auth();

    // HTML Elements
    const userEmailSpan = document.getElementById("user-email");
    const userAvailabilitySpan = document.getElementById("user-availability");
    const toggleButton = document.getElementById("toggle-status");
    const logoutButton = document.getElementById("logout-btn");
    const mapContainer = document.getElementById("map");
    const notificationsList = document.getElementById("notifications-list");
    const locationDisplay = document.getElementById("current-location");

    // Get User Location
    function getUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;

                console.log(`User's location: Lat=${userLat}, Lng=${userLng}`);

                // Display user's current location on the dashboard
                locationDisplay.textContent = `Latitude: ${userLat.toFixed(4)}, Longitude: ${userLng.toFixed(4)}`;

                // Save location to Firestore
                saveUserLocation(userLat, userLng);

                // Initialize Google Maps
                initMap(userLat, userLng);
            }, (error) => {
                console.error("Error fetching location:", error.message);
                locationDisplay.textContent = "Failed to fetch location. Please enable location permissions in your browser.";
                alert("Failed to get your location. Please enable location permissions in your browser.");
            });
        } else {
            locationDisplay.textContent = "Geolocation is not supported by your browser.";
            alert("Geolocation is not supported by your browser.");
        }
    }

    // Save User Location to Firestore
    function saveUserLocation(lat, lng) {
        const user = firebase.auth().currentUser;
        if (!user) {
            alert("User not logged in!");
            return;
        }

        const userDoc = db.collection("users").doc(user.uid);
        userDoc.update({
            location: { lat, lng }
        }).then(() => {
            console.log("User location updated in Firestore.");
        }).catch((error) => {
            console.error("Error saving user location:", error.message);
        });
    }

    // Initialize Google Maps
function initMap(userLat, userLng) {
    try {
        const mapOptions = {
            center: { lat: userLat, lng: userLng },
            zoom: 12
        };

        const map = new google.maps.Map(mapContainer, mapOptions);

        // Add a marker for the user's location
        new google.maps.Marker({
            position: { lat: userLat, lng: userLng },
            map: map,
            title: "Your Location"
        });

        // Fetch and display nearby helpers on the map
        db.collection("helpers").onSnapshot((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const helperData = doc.data();

                // Create a marker for each helper
                const marker = new google.maps.Marker({
                    position: { lat: helperData.lat, lng: helperData.lng },
                    map: map,
                    title: helperData.name || "Helper Location"
                });

                // Create an info window with helper details
                const infoWindowContent = `
                    <div>
                        <strong>${helperData.name || "N/A"}</strong><br>
                        Contact: ${helperData.contactInfo || "N/A"}<br>
                        Location: Latitude: ${helperData.lat?.toFixed(4) || "N/A"}, Longitude: ${helperData.lng?.toFixed(4) || "N/A"}
                    </div>
                `;
                const infoWindow = new google.maps.InfoWindow({
                    content: infoWindowContent
                });

                // Open info window when marker is clicked
                marker.addListener("click", () => {
                    infoWindow.open(map, marker);
                });
            });
        }, (error) => {
            console.error("Error fetching helpers for map:", error.message);
        });
    } catch (error) {
        console.error("Error initializing map:", error.message);
        mapContainer.textContent = "Failed to load the map.";
    }
}


    // Fetch and display nearby helpers
    function displayNearbyHelpers() {
        const helpersList = document.getElementById("helpers-list");
        helpersList.innerHTML = ""; // Clear the list before populating

        db.collection("helpers").onSnapshot((querySnapshot) => {
            const helpers = querySnapshot.docs.map(doc => doc.data());

            // Sort helpers alphabetically by name
            helpers.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

            // Populate the list with sorted helpers
            helpers.forEach(helperData => {
                const listItem = document.createElement("li");
                listItem.innerHTML = `
                    <strong>Name:</strong> ${helperData.name || "N/A"}<br>
                    <strong>Contact:</strong> <a href="tel:${helperData.contactInfo || '#'}">${helperData.contactInfo || "N/A"}</a><br>
                    <strong>Location:</strong> Latitude: ${helperData.lat?.toFixed(4) || "N/A"}, Longitude: ${helperData.lng?.toFixed(4) || "N/A"}
                `;
                helpersList.appendChild(listItem);
            });
        }, (error) => {
            console.error("Error fetching helpers:", error.message);
            helpersList.innerHTML = `<li>Unable to fetch nearby helpers. Please try again later.</li>`;
        });
    }

    // Function to show notifications
    function showNotification(helperData) {
        alert(`New helper available!\nLocation: ${helperData.name || "No name provided"}\nContact: ${helperData.contactInfo || "Contact details unavailable"}`);

        // Add notification to the list
        const listItem = document.createElement("li");
        listItem.textContent = `Location: ${helperData.name || "Unknown"} - Contact: ${helperData.contactInfo || "Unavailable"}`;
        notificationsList.appendChild(listItem);

        // Browser notification (optional)
        if (Notification.permission === "granted") {
            new Notification("New Helper Available", {
                body: `Location: ${helperData.name || "No name"}\nContact: ${helperData.contactInfo || "No contact info"}`,
            });
        }
    }

    // Request notification permission
    if (Notification.permission !== "granted") {
        Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
                console.log("Notifications enabled!");
            }
        });
    }

    // Fetch and Display User Data
    auth.onAuthStateChanged((user) => {
        if (user) {
            const userId = user.uid;

            db.collection("users").doc(userId).onSnapshot((doc) => {
                if (doc.exists) {
                    console.log("User data fetched:", doc.data());
                    const userData = doc.data();
                    userEmailSpan.textContent = userData.email || "No email found";
                    userAvailabilitySpan.textContent = userData.availability || "Unavailable";
                    toggleButton.textContent = userData.availability === "available"
                        ? "Set as Unavailable"
                        : "Set as Available";
                } else {
                    alert("No user data found.");
                }
            });

            // Get the user's location and initialize the map
            getUserLocation();

            // Display nearby helpers
            displayNearbyHelpers();
        } else {
            alert("User not logged in!");
            window.location.href = "index.html"; // Redirect to login page
        }
    });

    document.getElementById("cycle-form").addEventListener("submit", async (event) => {
        event.preventDefault();
        
        const user = auth.currentUser;
        if (!user) {
            alert("User not logged in!");
            return;
        }
        
        const startDate = document.getElementById("start-date").value;
        const cycleLength = parseInt(document.getElementById("cycle-length").value);
    
        if (!startDate || isNaN(cycleLength)) {
            alert("Please enter a valid start date and cycle length.");
            return;
        }
    
        const nextCycleDate = new Date(startDate);
        nextCycleDate.setDate(nextCycleDate.getDate() + cycleLength); // Predict next cycle
    
        const cycleData = {
            lastCycleStart: startDate,
            cycleLength: cycleLength,
            nextCyclePrediction: nextCycleDate.toISOString().split('T')[0]
        };
    
        try {
            await db.collection("cycles").doc(user.uid).set(cycleData, { merge: true });
            alert("Cycle data saved successfully!");
            displayCycleData(cycleData);
        } catch (error) {
            console.error("Error saving cycle data:", error.message);
            alert("Failed to save cycle data. Please try again.");
        }
    });
    
    function displayCycleData(cycleData) {
        document.getElementById("cycle-info").innerHTML = `
            <p><strong>Last Cycle Start Date:</strong> ${cycleData.lastCycleStart || "Not recorded"}</p>
            <p><strong>Cycle Length:</strong> ${cycleData.cycleLength || "N/A"} days</p>
            <p><strong>Predicted Next Cycle:</strong> ${cycleData.nextCyclePrediction || "Unavailable"}</p>
        `;
    }
    
    // Fetch cycle data on page load
    auth.onAuthStateChanged((user) => {
        if (user) {
            db.collection("cycles").doc(user.uid).get()
                .then((doc) => {
                    if (doc.exists) {
                        displayCycleData(doc.data());
                    } else {
                        console.log("No cycle data found.");
                    }
                })
                .catch((error) => {
                    console.error("Error fetching cycle data:", error.message);
                });
        }
    });
    

    // Toggle Availability Status
    toggleButton.addEventListener("click", () => {
        const user = auth.currentUser;
        if (!user) {
            alert("User not logged in!");
            return;
        }
    
        const userDoc = db.collection("users").doc(user.uid);
        const helpersCollection = db.collection("helpers");
    
        userDoc.get()
            .then((doc) => {
                if (doc.exists) {
                    const userData = doc.data();
                    const currentStatus = userData.availability;
                    const newStatus = currentStatus === "available" ? "unavailable" : "available";
    
                    // Update user's availability in Firestore
                    userDoc.update({ availability: newStatus })
                        .then(() => {
                            userAvailabilitySpan.textContent = newStatus;
                            toggleButton.textContent = newStatus === "available"
                                ? "Set as Unavailable"
                                : "Set as Available";
    
                            alert(`Availability updated to: ${newStatus}`);
    
                            // Add or remove user data in helpers collection based on availability
                            if (newStatus === "available") {
                                helpersCollection.doc(user.uid).set({
                                    name: userData.name || "No name provided",
                                    contactInfo: userData.email || "No contact provided",
                                    lat: userData.location?.lat || null,
                                    lng: userData.location?.lng || null
                                }).then(() => {
                                    console.log("User added to helpers collection.");
                                }).catch((error) => {
                                    console.error("Error adding user to helpers:", error.message);
                                });
                            } else {
                                helpersCollection.doc(user.uid).delete()
                                    .then(() => {
                                        console.log("User removed from helpers collection.");
                                    }).catch((error) => {
                                        console.error("Error removing user from helpers:", error.message);
                                    });
                            }
                        })
                        .catch((error) => {
                            console.error("Error updating availability:", error.message);
                        });
                }
            })
            .catch((error) => {
                console.error("Error fetching user data:", error.message);
            });
    });})
    const logoutButton = document.getElementById("logout-btn");

    document.getElementById("logout-btn").addEventListener("click", () => {
        console.log("Logout button clicked.");
        
        firebase.auth().signOut().then(() => {
            console.log("User signed out successfully.");
            alert("Logout successful!");
            window.location.href = "index.html"; // Redirect to login page
        }).catch((error) => {
            console.error("Logout failed:", error.message);
            alert("Logout failed. Please try again.");
        });
    });
    

