import { useCallback, useEffect, useState } from "react";
import api from "../services/api.js";
import DashboardBreadcrumb from "../components/DashboardBreadcrumb.jsx";

function getCalls(response) {
  const payload = response?.data ?? response;
  const calls = payload?.data ?? payload?.calls ?? payload;
  return Array.isArray(calls) ? calls : [];
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  })
    .format(date)
    .toUpperCase();
}

function getRationaleUrl(path) {
  if (!path) return "";
  const apiBase = new URL(import.meta.env.VITE_UAPI_PROCESS_URL);
  apiBase.pathname = apiBase.pathname.replace(/api\/v1\/?$/, "");
  return new URL(String(path).replace(/^\/+/, ""), apiBase).toString();
}

function formatGeneratedDate(calls) {
  const callDate = calls.find((call) => call?.date)?.date;
  const date = callDate ? new Date(callDate) : new Date();
  const generatedDate = Number.isNaN(date.getTime()) ? new Date() : date;
  const parts = new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).formatToParts(generatedDate);
  const part = (type) => parts.find((item) => item.type === type)?.value || "";
  return `${part("day")} ${part("month")}, ${part("year")}`;
}

export default function OptionsSignals() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCalls = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.uapi.getLiveOptionCalls();
      setCalls(getCalls(response));
    } catch (requestError) {
      setError(requestError.message || "Unable to load live options calls.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCalls();
  }, [loadCalls]);

  return (
    <main className="bg-light flex-grow-1">
      <div className="container-fluid py-3">
        <DashboardBreadcrumb currentPage="Live Calls" />
        <h1 className="fs-2 fw-bold mb-1">Live Calls</h1>
        <p className="small text-body-secondary mb-3">
          Generated on {formatGeneratedDate(calls)}
        </p>
        <div className="row g-3">
          <div className="col-md-8 position-relative">
            {loading ? (
              <div
                className="border rounded-3 bg-body p-4 text-center text-body-secondary"
                role="status"
              >
                <span
                  className="spinner-border spinner-border-sm text-warning me-2"
                  aria-hidden="true"
                />
                Loading calls…
              </div>
            ) : error ? (
              <div className="alert alert-warning rounded-3 mb-0" role="alert">
                <div className="mb-2">{error}</div>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={loadCalls}
                >
                  Try again
                </button>
              </div>
            ) : calls.length ? (
              calls.map((call, index) => {
                const isFollowUp = ["FOLLOW_UP", "FOLLOWUP"].includes(
                  String(call.call_type || "").toUpperCase(),
                );
                return (
                  <article
                    className="bg-body d-flex border rounded-3 mb-3"
                    key={call.id ?? call._id ?? `${call.date}-${index}`}
                  >
                    <div
                      className={`d-flex flex-column rounded-3 py-3 px-2 w-100`}
                    >
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <span
                          className={`badge mb-0 ${isFollowUp ? "bg-warning bg-opacity-50 text-warning-emphasis" : "bg-primary bg-opacity-50 text-primary-emphasis"}`}
                        >
                          {isFollowUp ? "Follow Up" : "New Call"}
                        </span>
                        <div className="d-flex align-items-center gap-2 ms-auto">
                          <time
                            className="small text-uppercase text-body-secondary"
                            dateTime={call.date || undefined}
                          >
                            {formatDate(call.date)}
                          </time>
                          {call.rationale && (
                            <a
                              className="btn btn-sm text-dark p-0"
                              href={getRationaleUrl(call.rationale)}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="Open call rationale PDF"
                              title="View rationale PDF"
                            >
                              <i
                                className="bi bi-filetype-pdf fs-5"
                                aria-hidden="true"
                              />
                            </a>
                          )}
                        </div>
                      </div>
                      <p
                        className="small text-body-emphasis mb-0"
                        style={{ whiteSpace: "pre-wrap" }}
                      >
                        {call.msg || call.message || "Options call update"}
                      </p>
                      {isFollowUp && call.main_msg && (
                        <div
                          className="small p-2 rounded-3 mt-2 text-body-secondary bg-primary bg-opacity-10"
                          style={{ whiteSpace: "pre-wrap" }}
                        >
                          {call.main_msg}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="border rounded-3 bg-body p-3 text-body-secondary">
                No calls generated
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
