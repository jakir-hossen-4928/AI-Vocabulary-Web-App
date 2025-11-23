importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyCqWUN3QyceYrvqHXdbLdAYzIcrg8efXO8",
    authDomain: "ielts-jakir.firebaseapp.com",
    projectId: "ielts-jakir",
    storageBucket: "ielts-jakir.firebasestorage.app",
    messagingSenderId: "412154848714",
    appId: "1:412154848714:web:3a8ada743d1c2b00675b33",
    measurementId: "G-C6MDJ0NBJZ"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/pwa-192x192.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
