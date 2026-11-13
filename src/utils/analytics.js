export const ANALYTICS_EVENTS = Object.freeze({
  LOGIN: "login_user",
  REGISTRATION: "register_users",
  KYC_COMPLETE: "complete_kyc",
  AGREEMENT_COMPLETE: "complete_agreement",
  PAYMENT_INIT: "payment_init",
  PAYMENT_SUCCESS: "payment_success",
  PAYMENT_FAILED: "payment_failed",
});

const canTrack = () =>
  typeof window !== "undefined" && typeof window.gtag === "function";

export function trackAnalyticsEvent(name, parameters = {}) {
  if (!canTrack()) {
    if (import.meta.env.DEV)
      console.info(`[Google Analytics unavailable] ${name}`, parameters);
    return false;
  }

  window.gtag("event", name, parameters);
  if (import.meta.env.DEV) console.info(`[Google Analytics] ${name}`, parameters);
  return true;
}
