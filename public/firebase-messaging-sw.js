
/* public/firebase-messaging-sw.js */

importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "__FIREBASE_API_KEY__",
  authDomain: "__FIREBASE_AUTH_DOMAIN__",
  projectId: "__FIREBASE_PROJECT_ID__",
  storageBucket: "__FIREBASE_STORAGE_BUCKET__",
  messagingSenderId: "__FIREBASE_MESSAGING_SENDER_ID__",
  appId: "__FIREBASE_APP_ID__",
});

firebase.messaging();

const registration = self.registration;
const showNativeNotification = ServiceWorkerRegistration.prototype.showNotification;
registration.showNotification = (title, options = {}) =>
  showNativeNotification.call(registration, title, {
    ...options,
    icon: "/idt-favicon.png",
  });

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = new URL(
    event.notification.data?.url || "/",
    self.location.origin
  );

  if (targetUrl.origin !== self.location.origin) {
    return;
  }

  event.waitUntil(
    clients.openWindow(targetUrl.href)
  );
});
