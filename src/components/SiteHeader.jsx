import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearEapiCredentials,
  selectEapiAuth,
} from "../store/eapiAuthSlice.js";
import {
  clearUapiCredentials,
  selectUapiAuth,
} from "../store/uapiAuthSlice.js";
import { getUserName } from "../utils/authResponse.js";
import api from "../services/api.js";
import { getNotificationFcmToken } from "../notificationService.js";
import NotificationSettingsModal from "./NotificationSettingsModal.jsx";

function StatusBadge({ complete }) {
  return (
    <span
      className={`badge rounded-pill ${complete ? "text-bg-success" : "text-bg-warning"}`}
    >
      {complete ? "Completed" : "Pending"}
    </span>
  );
}

function SiteHeader({
  isHome,
  onHome,
  onLogin,
  onProfile,
  onDashboard,
  onDownload,
  onKyc,
  onAgreement,
  onLiveCalls,
  onCashIntraday,
  onStockFutureIntraday,
  onLogout,
  notify,
  statuses,
  hideLogin = false,
}) {
  const dispatch = useDispatch();
  const uapiAuth = useSelector(selectUapiAuth);
  const eapiAuth = useSelector(selectEapiAuth);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] =
    useState(false);
  const [supportMessage, setSupportMessage] = useState("");
  const [supportSubmitting, setSupportSubmitting] = useState(false);
  const menuRef = useRef(null);
  const authenticated = Boolean(
    uapiAuth.token ||
    uapiAuth.refreshToken ||
    eapiAuth.token ||
    eapiAuth.refreshToken ||
    uapiAuth.user ||
    eapiAuth.user,
  );
  const userName =
    getUserName(eapiAuth.user) || getUserName(uapiAuth.user) || "Account";
  const userInitial = userName.trim().charAt(0).toUpperCase() || "A";

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setShowSupport(false);
      }
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const chooseMenuItem = (callback) => {
    setMenuOpen(false);
    callback();
  };

  const submitSupportMessage = async (event) => {
    event.preventDefault();
    const description = supportMessage.trim();
    if (!description || supportSubmitting) return;

    setSupportSubmitting(true);
    try {
      const response = await api.uapi.createSupportRequest({
        type: "help_support",
        description,
      });
      if (response?.status === false || response?.success === false) {
        throw new Error(response.message || "Unable to submit your request.");
      }
      setSupportMessage("");
      setShowSupport(false);
      notify("success", "Your request has been submitted.");
    } catch (requestError) {
      notify("error", requestError.message || "Unable to submit your request.");
    } finally {
      setSupportSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      const fcmToken = await getNotificationFcmToken();
      await api.uapi.logout(fcmToken);
    } catch (error) {
      console.error("Logout request failed:", error);
    }
    dispatch(clearUapiCredentials());
    dispatch(clearEapiCredentials());
    setMenuOpen(false);
    onLogout();
  };

  return (
    <>
      <header
        className={`navbar bg-white border-bottom border-light-subtle py-2`}
      >
        <div
          className={`${authenticated ? "container-fluid px-lg-3" : "container"} d-flex flex-nowrap align-items-center justify-content-between`}
        >
          <button
            className="navbar-brand d-flex align-items-center gap-2 fw-bold m-0 border-0 bg-transparent p-0 text-dark flex-shrink-0"
            type="button"
            onClick={authenticated ? onDashboard : onHome}
            aria-label={
              authenticated ? "Go to dashboard" : "Intraday Traders home"
            }
          >
            <img
              src="/ep-analyst-logo.svg"
              width="180"
              alt="Intraday Traders by EquityPandit"
            />
          </button>
          {authenticated && (
            <nav
              className="d-none align-items-center justify-content-center gap-2 gap-lg-4 flex-grow-1 overflow-x-auto mx-2"
              aria-label="Trading sections"
            >
              <button
                className="btn btn-link link-dark text-decoration-none fw-semibold text-nowrap p-0"
                type="button"
                onClick={onHome}
              >
                Home
              </button>
              <button
                className="btn btn-link link-dark text-decoration-none fw-semibold text-nowrap p-0"
                type="button"
                onClick={onLiveCalls}
              >
                Live calls
              </button>
              <button
                className="btn btn-link link-dark text-decoration-none fw-semibold text-nowrap p-0"
                type="button"
                onClick={onCashIntraday}
              >
                Cash intraday
              </button>
              <button
                className="btn btn-link link-dark text-decoration-none fw-semibold text-nowrap p-0"
                type="button"
                onClick={onStockFutureIntraday}
              >
                Stock future intraday
              </button>
            </nav>
          )}
          {!authenticated && !hideLogin && (
            <button
              className="btn btn-warning btn-sm fw-semibold rounded-3 site-header-login"
              type="button"
              onClick={onLogin}
            >
              Login
            </button>
          )}
          {authenticated && (
            <div
              className="dropdown position-relative flex-shrink-0"
              ref={menuRef}
            >
              <button
                className="btn border-0 rounded-circle bg-transparent p-0"
                type="button"
                aria-label={`Open ${userName} account menu`}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                onClick={() => setMenuOpen((open) => !open)}
              >
                <span
                  className="d-inline-flex align-items-center justify-content-center rounded-circle fw-bold text-white shadow-sm"
                  style={{
                    width: "32px",
                    height: "32px",
                    fontSize: ".8rem",
                    background:
                      "linear-gradient(180deg, #FE7902 0%, #F6530B 100%)",
                  }}
                  aria-hidden="true"
                >
                  {userInitial}
                </span>
              </button>
              {menuOpen && (
                <div
                  className="dropdown-menu dropdown-menu-end show end-0 mt-2 p-2 shadow border rounded-2"
                  role="menu"
                >
                  <button
                    className="dropdown-item rounded bg-light d-flex align-items-center gap-2 py-2 mb-1"
                    type="button"
                    role="menuitem"
                    onClick={() => chooseMenuItem(onProfile)}
                  >
                    <i className="bi bi-person" />
                    Profile
                  </button>
                  <button
                    className={`dropdown-item rounded bg-light d-flex align-items-center gap-2 py-2 mb-1 ${statuses.kycComplete ? "text-secondary" : ""}`}
                    type="button"
                    role="menuitem"
                    onClick={() => chooseMenuItem(onKyc)}
                  >
                    <i
                      className={`bi ${statuses.kycComplete ? "bi-patch-check-fill text-success" : "bi-exclamation-circle text-warning"}`}
                    />
                    <span className="me-auto">KYC</span>
                    <StatusBadge complete={statuses.kycComplete} />
                  </button>
                  <button
                    className={`dropdown-item rounded bg-light d-flex align-items-center gap-2 py-2 ${statuses.agreementComplete ? "text-secondary" : ""}`}
                    type="button"
                    role="menuitem"
                    onClick={() => chooseMenuItem(onAgreement)}
                  >
                    <i
                      className={`bi ${statuses.agreementComplete ? "bi-patch-check-fill text-success" : "bi-exclamation-circle text-warning"}`}
                    />
                    <span className="me-auto">Agreement</span>
                    <StatusBadge complete={statuses.agreementComplete} />
                  </button>
                  <div className="dropdown-divider my-2" />
                  {/* {statuses.paymentComplete && statuses.kycComplete && statuses.agreementComplete && ( */}
                  {statuses.paymentComplete && (
                    <button
                      className="dropdown-item rounded bg-light d-flex align-items-center gap-2 py-2 mb-1"
                      type="button"
                      role="menuitem"
                      onClick={() =>
                        chooseMenuItem(() => setShowNotificationSettings(true))
                      }
                    >
                      <i className="bi bi-bell" aria-hidden="true" />
                      Notifications
                    </button>
                  )}
                  <button
                    className="dropdown-item rounded bg-light d-flex align-items-center gap-2 py-2 mb-1"
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      setShowSupport(true);
                    }}
                  >
                    <i className="bi bi-headset" aria-hidden="true" />
                    Help &amp; Support
                  </button>
                  <button
                    className="dropdown-item rounded bg-light d-flex align-items-center gap-2 py-2 mb-1"
                    type="button"
                    role="menuitem"
                    onClick={() => chooseMenuItem(onDownload)}
                  >
                    <i className="bi bi-download" aria-hidden="true" />
                    Download App
                  </button>
                  <a
                    className="dropdown-item rounded bg-light d-flex align-items-center gap-2 py-2"
                    href="https://equitypandit.in/regulatory-disclosure"
                    target="_blank"
                    rel="noopener noreferrer"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                  >
                    <i className="bi bi-flag" aria-hidden="true" />
                    Regulatory Disclosure
                  </a>
                  <div className="dropdown-divider my-2" />
                  <button
                    className="dropdown-item rounded bg-light d-flex align-items-center gap-2 py-2 text-danger"
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>
      {showSupport && (
        <>
          <div className="modal-backdrop fade show" />
          <div
            className="modal d-block"
            role="dialog"
            aria-modal="true"
            aria-labelledby="support-dialog-title"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setShowSupport(false);
            }}
          >
            <div className="modal-dialog modal-dialog-centered modal-md mx-3 mx-sm-auto">
              <div className="modal-content rounded-4 border-0 p-3">
                <form onSubmit={submitSupportMessage}>
                  <div className="d-flex align-items-center gap-2 gap-sm-3 mb-3">
                    <span
                      className="d-inline-flex align-items-center justify-content-center rounded-4 p-2 p-sm-3 fs-4"
                      style={{ backgroundColor: "#fff0e4", color: "#ff7900" }}
                      aria-hidden="true"
                    >
                      <i className="bi bi-headset" />
                    </span>
                    <div className="flex-grow-1">
                      <h2
                        className="fs-5 fw-bold mb-1"
                        id="support-dialog-title"
                      >
                        Help Desk
                      </h2>
                      <p className="text-secondary mb-0">
                        Tell us how we can help.
                      </p>
                    </div>
                    <button
                      className="btn btn-link text-secondary fs-3 p-0"
                      type="button"
                      aria-label="Close help desk"
                      onClick={() =>
                        !supportSubmitting && setShowSupport(false)
                      }
                      disabled={supportSubmitting}
                    >
                      <i className="bi bi-x-lg" aria-hidden="true" />
                    </button>
                  </div>
                  <label className="visually-hidden" htmlFor="support-message">
                    Enter your message
                  </label>
                  <textarea
                    className="form-control rounded-3 border-2 p-2 p-sm-3 mb-2"
                    id="support-message"
                    rows="4"
                    maxLength={1000}
                    placeholder="Enter your message"
                    value={supportMessage}
                    onChange={(event) => setSupportMessage(event.target.value)}
                    disabled={supportSubmitting}
                    required
                  />
                  <div className="text-end text-secondary small mb-3">
                    {supportMessage.length}/1000
                  </div>
                  <div className="row g-2">
                    <div className="col-6">
                      <button
                        className="btn btn-outline-secondary rounded-3 w-100 py-2"
                        type="button"
                        onClick={() =>
                          !supportSubmitting && setShowSupport(false)
                        }
                        disabled={supportSubmitting}
                      >
                        Cancel
                      </button>
                    </div>
                    <div className="col-6">
                      <button
                        className="btn btn-warning rounded-3 w-100 py-2 fw-semibold"
                        type="submit"
                        disabled={!supportMessage.trim() || supportSubmitting}
                      >
                        {supportSubmitting ? "Submitting..." : "Submit"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
      {/* {showNotificationSettings && statuses.paymentComplete && statuses.kycComplete && statuses.agreementComplete && ( */}
      {showNotificationSettings && statuses.paymentComplete && (
        <NotificationSettingsModal
          onClose={() => setShowNotificationSettings(false)}
        />
      )}
    </>
  );
}

export default SiteHeader;
