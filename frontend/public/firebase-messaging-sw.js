importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBX7D2pAvWVgkSuWDviPIqkwojP46RlSP4",
  authDomain: "deunago.firebaseapp.com",
  projectId: "deunago",
  storageBucket: "deunago.firebasestorage.app",
  messagingSenderId: "464708532515",
  appId: "1:464708532515:web:9a7e4d5ab510f329fcf496",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Mensaje recibido en segundo plano:",
    payload
  );

  const notificationTitle =
    payload.notification?.title || "DeUnaGo";

  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: "/brand/favicon.png",
  };

  self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});