import { getMessaging, isSupported } from "firebase/messaging";
import app from "./firebase";

let messaging = null;

export async function getFirebaseMessaging() {
  const supported = await isSupported();

  if (!supported) {
    return null;
  }

  if (!messaging) {
    messaging = getMessaging(app);
  }

  return messaging;
}