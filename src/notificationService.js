import { getToken, onMessage } from "firebase/messaging";
import { getFirebaseMessaging } from "./firebase";
import api from "./services/api";

export async function getNotificationFcmToken() {
  if (
    typeof window === "undefined" ||
    !("Notification" in window) ||
    !("serviceWorker" in navigator)
  ) {
    return null;
  }
  if (Notification.permission !== "granted") return null;

  await navigator.serviceWorker.register(
    "/firebase-messaging-sw.js",
  );
  const registration = await navigator.serviceWorker.ready;
  const messaging = await getFirebaseMessaging();

  if (!messaging) {
    throw new Error("Firebase Messaging is not supported.");
  }

  return getToken(messaging, {
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: registration,
  });
}

export async function registerNotificationToken() {
  const token = await getNotificationFcmToken();
  if (!token) return null;

  const response = await api.uapi.storeFCMtoken({
    platform: "web",
    fcmToken: token,
    isNotificationEnabled: true,
  });
  const result = response?.data ?? response;
  if (result?.status === false) {
    throw new Error(result.message || "Unable to register notification token.");
  }

  return token;
}

export async function enableNotifications(onPermissionGranted) {
  try {
    if (!("Notification" in window)) {
      throw new Error("Notifications are not supported.");
    }

    if (!("serviceWorker" in navigator)) {
      throw new Error("Service workers are not supported.");
    }

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      return { success: false, message: "Permission not granted" };
    }

    onPermissionGranted?.();

    const token = await registerNotificationToken();

    if (!token) {
      throw new Error("Unable to generate FCM token.");
    }

    // if (import.meta.env.DEV) {
    //   console.info("FCM token:", token);
    // }

    return { success: true, token };
  } catch (error) {
    console.error("Notification setup failed:", error);
    return { success: false, message: error.message };
  }
}

export async function listenForForegroundMessages(callback) {
  const messaging = await getFirebaseMessaging();

  if (!messaging) return () => { };

  return onMessage(messaging, async (payload) => {
    callback?.(payload);
  });
}
