import { getToken } from "firebase/messaging";
import { getFirebaseMessaging } from "../firebase-messaging";

export async function activarNotificacionesPush() {
  try {
    if (!("Notification" in window)) {
      throw new Error(
        "Este navegador no admite notificaciones."
      );
    }

    if (!("serviceWorker" in navigator)) {
      throw new Error(
        "Este navegador no admite Service Workers."
      );
    }

    const permission =
      Notification.permission === "granted"
        ? "granted"
        : await Notification.requestPermission();

    console.log(
      "Permiso de notificaciones:",
      permission
    );

    if (permission !== "granted") {
      throw new Error(
        "El permiso de notificaciones no fue concedido."
      );
    }

    const messaging = await getFirebaseMessaging();

    if (!messaging) {
      throw new Error(
        "Firebase Messaging no está disponible."
      );
    }

    await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
      { scope: "/" }
    );

    const serviceWorkerRegistration =
      await navigator.serviceWorker.ready;

    if (!serviceWorkerRegistration.active) {
      throw new Error(
        "El Service Worker todavía no está activo. Recarga la página e inténtalo nuevamente."
      );
    }

    const token = await getToken(messaging, {
      vapidKey:
        import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration,
    });

    if (!token) {
      throw new Error(
        "No se pudo generar el token de notificaciones."
      );
    }

    console.log("Token FCM generado correctamente");

    return token;
  } catch (error) {
    console.error(
      "Error activando notificaciones push:",
      error
    );

    throw error;
  }
}