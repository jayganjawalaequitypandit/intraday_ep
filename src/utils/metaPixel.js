const canTrack = () =>
  typeof window !== "undefined" && typeof window.fbq === "function";

export function trackMetaEvent(name, parameters = {}) {
  if (!canTrack()) {
    if (import.meta.env.DEV)
      console.info(`[Meta Pixel unavailable] ${name}`, parameters);
    return false;
  }

  window.fbq("track", name, parameters);
  if (import.meta.env.DEV) console.info(`[Meta Pixel] ${name}`, parameters);
  return true;
}

export function trackMetaCustomEvent(name, parameters = {}) {
  if (!canTrack()) {
    if (import.meta.env.DEV)
      console.info(`[Meta Pixel unavailable] ${name}`, parameters);
    return false;
  }

  window.fbq("trackCustom", name, parameters);
  if (import.meta.env.DEV)
    console.info(`[Meta Pixel Custom] ${name}`, parameters);
  return true;
}
