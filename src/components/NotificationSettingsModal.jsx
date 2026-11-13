import { useEffect, useState } from "react";
import api from "../services/api.js";
import {
  enableNotifications,
  getNotificationFcmToken,
  registerNotificationToken,
} from "../notificationService.js";

const OPTIONS = [
  ["liveCallEnabled", "Live Options Recommendations", "Live options call alerts", "bi-lightning-charge-fill"],
  ["intradaySignalEnabled", "Cash Intraday Trades", "Cash intraday call alerts", "bi-currency-rupee"],
  ["futureSignalEnabled", "Stock Futures Intraday Trades", "Stock futures call alerts", "bi-graph-up-arrow"],
];
export default function NotificationSettingsModal({ onClose, onSettingsChange }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [browserNotificationsEnabled, setBrowserNotificationsEnabled] =
    useState(
      () =>
        typeof Notification !== "undefined" &&
        Notification.permission === "granted",
    );

  const handleBrowserNotificationsChange = async (enabled) => {
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      if (enabled) {
        const result = await enableNotifications(() => {
          setBrowserNotificationsEnabled(true);
        });
        if (!result.success) {
          throw new Error(
            result.message || "Browser notification permission was not granted.",
          );
        }
        if (result.token) {
          const response = await api.uapi.getNotificationSettings(result.token);
          const data = response?.data?.data ?? response?.data ?? response;
          if (data?.status === false || data?.success === false) throw new Error(data.message || "Unable to load notification settings.");
          const values = data?.settings ?? data;
          const nextSettings = {
            fcmToken: result.token,
            liveCallEnabled: values.liveCallEnabled ?? true,
            intradaySignalEnabled: values.intradaySignalEnabled ?? true,
            futureSignalEnabled: values.futureSignalEnabled ?? true,
          };
          setSettings(nextSettings);
          onSettingsChange?.(nextSettings);
        }
      } else {
        const fcmToken = settings?.fcmToken || (await getNotificationFcmToken());
        if (!fcmToken) throw new Error("No notification token is registered.");
        await api.uapi.storeFCMtoken({
          platform: "web",
          fcmToken,
          isNotificationEnabled: false,
        });
        setBrowserNotificationsEnabled(false);
      }
    } catch (toggleError) {
      setBrowserNotificationsEnabled(
        typeof Notification !== "undefined" &&
          Notification.permission === "granted",
      );
      setError(
        toggleError.message || "Unable to update browser notification permission.",
      );
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    let active = true;

    const loadSettings = async () => {
      try {
        const fcmToken = await registerNotificationToken();
        if (!fcmToken) {
          throw new Error("Enable browser notifications to manage these settings.");
        }
        const response = await api.uapi.getNotificationSettings(fcmToken);
        const data = response?.data?.data ?? response?.data ?? response;
        if (data?.status === false || data?.success === false) throw new Error(data.message || "Unable to load notification settings.");
        const values = data?.settings ?? data;
        const nextSettings = {
          fcmToken,
          liveCallEnabled: values.liveCallEnabled ?? true,
          intradaySignalEnabled: values.intradaySignalEnabled ?? true,
          futureSignalEnabled: values.futureSignalEnabled ?? true,
        };
        if (active) {
          setSettings(nextSettings);
          onSettingsChange?.(nextSettings);
        }
      } catch (loadError) {
        if (active) setError(loadError.message || "Unable to load notification settings.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadSettings();
    return () => {
      active = false;
    };
  }, []);

  const updateSetting = async (key, enabled) => {
    if (!settings?.fcmToken || saving) return;
    const previous = settings;
    const updated = { ...settings, [key]: enabled };
    setSettings(updated);
    setSaving(true);
    setError("");

    try {
      const response = await api.uapi.updateNotificationSettings(updated);
      const result = response?.data ?? response;
      if (result?.status === false) {
        throw new Error(result.message || "Unable to save notification settings.");
      }
      onSettingsChange?.(updated);
    } catch (saveError) {
      setSettings(previous);
      setError(saveError.message || "Unable to save notification settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="modal-backdrop show" aria-hidden="true" onClick={onClose} />
      <div className="modal show d-block" role="dialog" aria-modal="true" aria-labelledby="notification-settings-title">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4 border-0">
            <div className="modal-header border-0 p-3 pb-0">
              <div>
                <h2 className="modal-title fs-5 fw-semibold" id="notification-settings-title">
                  Notification Settings
                </h2>
                <p className="small text-secondary mb-0">
                  Choose which Pro alerts you want to receive.
                </p>
              </div>
              <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
            </div>
            <div className="modal-body p-3">
              {loading ? (
                <div className="text-center py-3">
                  <span className="spinner-border spinner-border-sm text-primary" role="status" />
                </div>
              ) : (
                <div className="border rounded-4 px-3 px-md-4">
                  {OPTIONS.map(([key, label, description, icon], index) => (
                    <div className={`d-flex align-items-center gap-3 py-3 ${index < OPTIONS.length - 1 ? "border-bottom" : ""}`} key={key}>
                      <i className={`bi ${icon} fs-4 text-secondary flex-shrink-0`} aria-hidden="true" />
                      <div className="flex-grow-1">
                        <div className="fw-semibold">{label}</div>
                        <div className="text-secondary">{description}</div>
                      </div>
                      <div className="form-check form-switch mb-0">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id={`notification-${key}`}
                          checked={Boolean(settings?.[key])}
                          onChange={(event) => updateSetting(key, event.target.checked)}
                        disabled={saving || loading || !browserNotificationsEnabled || !settings?.fcmToken}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="d-flex align-items-center gap-3 py-3">
                <div className="flex-grow-1">
                  <div className="fs-6 text-secondary">
                    Allow this browser to show trade alerts
                  </div>
                </div>
                <div className="form-check form-switch mb-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="browser-notifications-enabled"
                    checked={browserNotificationsEnabled}
                    onChange={(event) =>
                      handleBrowserNotificationsChange(event.target.checked)
                    }
                    disabled={saving}
                  />
                </div>
              </div>
              {error && <p className="small text-danger mt-3 mb-0" role="alert">{error}</p>}
              {saving && <div className="small text-secondary mt-2" role="status">Saving notification settings…</div>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
