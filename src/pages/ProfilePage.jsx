import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import api from "../services/api.js";
import { selectEapiAuth } from "../store/eapiAuthSlice.js";
import { selectUapiAuth } from "../store/uapiAuthSlice.js";
import { getUserName } from "../utils/authResponse.js";
import { payloadOf, paymentIsComplete } from "../utils/onboardingStatus.js";
import idtBlackLogo from "../assets/idt-logo-black.svg";
import DashboardBreadcrumb from "../components/DashboardBreadcrumb.jsx";

function firstValue(...values) {
  return (
    values.find(
      (value) => value !== undefined && value !== null && String(value).trim(),
    ) || "—"
  );
}

function formatDate(value) {
  if (!value || value === "—") return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value).slice(0, 10).replace(/-/g, "/")
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

function getSubscriptionId(payment) {
  return (
    payment.subscriptionId ??
    payment.subscription_id ??
    payment.subscription?.subscriptionId
  );
}

function ProfilePage({ onServices, notify }) {
  const uapiAuth = useSelector(selectUapiAuth);
  const eapiAuth = useSelector(selectEapiAuth);
  const [activeSection, setActiveSection] = useState("profile");
  const [subscription, setSubscription] = useState(null);
  const [cancelledSubscriptionIds, setCancelledSubscriptionIds] = useState([]);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState("");
  const [cancellationLoading, setCancellationLoading] = useState(false);
  const [openCancelMenuIndex, setOpenCancelMenuIndex] = useState(null);
  const [showCancellationConfirmation, setShowCancellationConfirmation] =
    useState(false);
  const [cancellationSubscriptionId, setCancellationSubscriptionId] =
    useState(null);
  const subscriptionMenuRef = useRef(null);
  const uapiUser = uapiAuth.user || {};
  const eapiUser = eapiAuth.user || {};

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!subscriptionMenuRef.current?.contains(event.target)) {
        setOpenCancelMenuIndex(null);
      }
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpenCancelMenuIndex(null);
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const profile = [
    {
      label: "Name",
      icon: "bi-person",
      value: firstValue(getUserName(eapiUser), getUserName(uapiUser)),
    },
    {
      label: "Email",
      icon: "bi-envelope",
      value: firstValue(eapiUser.email, uapiUser.email),
    },
    {
      label: "Mobile",
      icon: "bi-phone",
      value: firstValue(
        eapiUser.mobile,
        eapiUser.mobileNumber,
        uapiUser.mobile,
        uapiUser.mobileNumber,
        uapiAuth.mobileNumber,
      ),
    },
    {
      label: "Date of birth",
      icon: "bi-calendar3",
      value: formatDate(
        firstValue(
          eapiUser.dob,
          eapiUser.dateOfBirth,
          uapiUser.dob,
          uapiUser.dateOfBirth,
        ),
      ),
    },
  ];

  const openSubscription = async () => {
    setActiveSection("subscription");
    setSubscriptionError("");
    setSubscriptionLoading(true);
    try {
      const response = await api.uapi.getMySubscription();
      const payload = payloadOf(response);
      const record = Array.isArray(payload)
        ? payload[0]
        : Array.isArray(payload?.subscriptions)
          ? payload.subscriptions[0]
          : (payload?.subscription ?? payload);
      const paymentStatus = String(
        record?.payment?.status ??
          record?.paymentStatus ??
          record?.payment_status ??
          record?.subscriptionStatus ??
          record?.subscription_status ??
          record?.status ??
          payload?.paymentStatus ??
          payload?.payment_status ??
          "",
      )
        .trim()
        .toLowerCase()
        .replace(/[\s-]+/g, "_");
      const paymentPending = [
        "pending",
        "payment_pending",
        "initiated",
        "initiation_pending",
        "awaiting_payment",
        "processing",
        "in_progress",
        "created",
        "incomplete",
      ].includes(paymentStatus);
      const dataList = Array.isArray(payload?.dataList) ? payload.dataList : [];
      const hasSubscription =
        payload?.isInProUser === true ||
        payload?.isSubscribed === true ||
        paymentIsComplete(record) ||
        paymentIsComplete(response);

      if (paymentPending || !hasSubscription || dataList.length === 0) {
        onServices?.();
        return;
      }
      setSubscription({ record, dataList });
    } catch (error) {
      setSubscriptionError(
        error?.message || "Unable to load your subscription.",
      );
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const cancelSubscription = async () => {
    if (!cancellationSubscriptionId || cancellationLoading) return;

    setCancellationLoading(true);
    setSubscriptionError("");
    try {
      await api.uapi.cancelSubscription(cancellationSubscriptionId);
      setCancelledSubscriptionIds((ids) => [
        ...ids,
        String(cancellationSubscriptionId),
      ]);
      notify?.("success", "Recurring subscription cancelled successfully.");
      setShowCancellationConfirmation(false);
      setCancellationSubscriptionId(null);
    } catch (error) {
      notify?.(
        "error",
        error?.message || "Unable to cancel your subscription.",
      );
    } finally {
      setCancellationLoading(false);
    }
  };
  const openCancellationConfirmation = (subscriptionId) => {
    setOpenCancelMenuIndex(null);
    setCancellationSubscriptionId(subscriptionId);
    setShowCancellationConfirmation(true);
  };
  const subscriptionCards = (subscription?.dataList ?? []).map(
    (payment, index) => {
      const details =
        payment.subscription ??
        subscription.record?.subscription ??
        subscription.record ??
        payment;
      const startDate = payment.startDate ?? payment.start_date;
      const endDate = payment.endDate ?? payment.end_date;
      const daysLeft = payment.leftDays;
      const duration =
        startDate && endDate
          ? Math.max(
              1,
              Math.ceil((new Date(endDate) - new Date(startDate)) / 86400000),
            )
          : 0;
      const subscriptionId = getSubscriptionId(payment);

      return {
        key: subscriptionId ?? index,
        startDate,
        endDate,
        daysLeft,
        progress: duration
          ? Math.min(100, Math.round((Number(daysLeft) / duration) * 100))
          : 0,
        planName: firstValue(
          payment.planName,
          payment.plan_name,
          payment.name,
          details.planName,
          details.plan_name,
          details.name,
          "Pro Subscription",
        ),
        planStatus: firstValue(
          payment.subscription?.subscriptionStatus,
          payment.subscriptionStatus,
          payment.status,
          "ACTIVE",
        ),
        amount: payment.amount ?? payment.price ?? payment.subscriptionAmount,
        subscriptionId,
        canCancel:
          payment.isRecurringPayment === true &&
          String(
            payment.subscription?.subscriptionStatus ?? "",
          ).toUpperCase() === "ACTIVE" &&
          Boolean(subscriptionId) &&
          !cancelledSubscriptionIds.includes(String(subscriptionId)),
      };
    },
  );

  return (
    <main className="bg-light flex-grow-1" id="main-content">
      <div className="container-fluid py-3">
        <DashboardBreadcrumb currentPage="Profile" />
        <div className="row g-3">
          <div className="col-12 col-lg-3">
            <aside className="card border-0" aria-label="Profile navigation">
              <div className="card-body p-3">
                <div className="d-flex align-items-center gap-3 mb-4">
                  <span
                    className="d-inline-flex align-items-center justify-content-center rounded-circle bg-warning-subtle text-warning-emphasis fs-4"
                    style={{ width: 48, height: 48 }}
                    aria-hidden="true"
                  >
                    <i className="bi bi-person-circle" />
                  </span>
                  <div className="min-w-0">
                    <div className="fw-semibold text-truncate">
                      {firstValue(getUserName(eapiUser), getUserName(uapiUser))}
                    </div>
                    <div className="small text-secondary text-truncate">
                      {firstValue(eapiUser.email, uapiUser.email)}
                    </div>
                  </div>
                </div>
                <nav className="nav nav-pills flex-column gap-2">
                  <button
                    type="button"
                    className={`nav-link text-start ${activeSection === "profile" ? "" : "text-body"}`}
                    style={
                      activeSection === "profile"
                        ? {
                            backgroundImage:
                              "linear-gradient(180deg, #FE7902 0%, #F6530B 100%)",
                            color: "#fff",
                          }
                        : undefined
                    }
                    aria-current={
                      activeSection === "profile" ? "page" : undefined
                    }
                    onClick={() => setActiveSection("profile")}
                  >
                    <i className="bi bi-person me-2" aria-hidden="true" />
                    My Profile
                  </button>
                  <button
                    type="button"
                    className={`nav-link text-start ${activeSection === "subscription" ? "" : "text-body"}`}
                    style={
                      activeSection === "subscription"
                        ? {
                            backgroundImage:
                              "linear-gradient(180deg, #FE7902 0%, #F6530B 100%)",
                            color: "#fff",
                          }
                        : undefined
                    }
                    aria-current={
                      activeSection === "subscription" ? "page" : undefined
                    }
                    onClick={openSubscription}
                  >
                    <i className="bi bi-gem me-2" aria-hidden="true" />
                    Pro Subscription
                  </button>
                </nav>
              </div>
            </aside>
          </div>

          <div className="col-12 col-lg-9">
            <section
              className="card border-0 h-100"
              aria-labelledby="profile-title"
            >
              <div className="card-body p-3">
                {activeSection === "profile" ? (
                  <>
                    <div className="mb-4">
                      <h1 className="h3 fw-bold mb-2" id="profile-title">
                        My Profile
                      </h1>
                      <p className="text-secondary mb-0">
                        Your personal and contact information.
                      </p>
                    </div>
                    <dl className="mb-0">
                      {profile.map((item, index) => (
                        <div
                          className={`d-flex align-items-start align-items-sm-center gap-3 py-3 ${index < profile.length - 1 ? "border-bottom" : ""}`}
                          key={item.label}
                        >
                          <span
                            className="d-inline-flex align-items-center justify-content-center rounded-3 flex-shrink-0 border border-warning-subtle bg-warning-subtle text-warning-emphasis fs-5"
                            style={{ width: 42, height: 42 }}
                            aria-hidden="true"
                          >
                            <i className={`bi ${item.icon}`} />
                          </span>
                          <div className="row g-1 flex-grow-1 align-items-center">
                            <dt className="col-12 col-sm-4 fw-semibold">
                              {item.label}
                            </dt>
                            <dd className="col-12 col-sm-8 mb-0 text-break">
                              {item.value}
                            </dd>
                          </div>
                        </div>
                      ))}
                    </dl>
                  </>
                ) : (
                  <>
                    <div className="mb-4">
                      <h1 className="h3 fw-bold mb-2" id="profile-title">
                        Pro Subscription
                      </h1>
                      <p className="text-secondary mb-0">
                        View your current plan and subscription validity.
                      </p>
                    </div>
                    {subscriptionLoading ? (
                      <div
                        className="d-flex align-items-center gap-2 text-secondary"
                        role="status"
                      >
                        <span
                          className="spinner-border spinner-border-sm text-warning"
                          aria-hidden="true"
                        />
                        Loading subscription…
                      </div>
                    ) : subscriptionError ? (
                      <div className="alert alert-warning mb-0" role="alert">
                        {subscriptionError}
                      </div>
                    ) : (
                      subscriptionCards.map(
                        (
                          {
                            key,
                            startDate,
                            endDate,
                            daysLeft,
                            progress,
                            planName,
                            planStatus,
                            amount,
                            subscriptionId,
                            canCancel,
                          },
                          index,
                        ) => (
                          <div className="border rounded-3 p-3 mb-3" key={key}>
                            <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
                              <div className="d-flex align-items-center gap-2">
                                <img
                                  src={idtBlackLogo}
                                  alt="IDT"
                                  style={{
                                    width: 40,
                                    height: 40,
                                    objectFit: "contain",
                                  }}
                                />
                                <div>
                                  <div className="fs-6 fw-semibold">
                                    IDT PRO
                                  </div>
                                  <div className="small text-secondary">
                                    {planName}
                                  </div>
                                </div>
                              </div>
                              <div className="d-flex align-items-center gap-2">
                                <div
                                  className="dropdown position-relative flex-shrink-0"
                                  ref={subscriptionMenuRef}
                                >
                                  <button
                                    type="button"
                                    className="btn btn-link text-secondary p-1"
                                    aria-label="Subscription options"
                                    aria-expanded={
                                      openCancelMenuIndex === index
                                    }
                                    onClick={() =>
                                      setOpenCancelMenuIndex((openIndex) =>
                                        openIndex === index ? null : index,
                                      )
                                    }
                                  >
                                    <i
                                      className="bi bi-three-dots-vertical fs-5"
                                      aria-hidden="true"
                                    />
                                  </button>
                                  {openCancelMenuIndex === index && (
                                    <div
                                      className="dropdown-menu dropdown-menu-end show end-0 mt-1 p-1 shadow-sm border rounded-3"
                                      role="menu"
                                    >
                                      <div className="dropdown-item-text d-flex align-items-center gap-2 text-nowrap">
                                        <span className="small text-body-emphasis">
                                          Subscription Status:
                                        </span>
                                        <span className="small text-success">
                                          <i
                                            className="bi bi-check-circle-fill me-1"
                                            aria-hidden="true"
                                          />
                                          {planStatus}
                                        </span>
                                      </div>
                                      {canCancel && (
                                        <button
                                          type="button"
                                          className="btn btn-sm dropdown-item text-body-emphasis"
                                          onClick={() =>
                                            openCancellationConfirmation(
                                              subscriptionId,
                                            )
                                          }
                                        >
                                          Cancel Subscription
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="row g-3 mb-3">
                              <div className="col-6">
                                <div className="small text-secondary mb-1">
                                  Subscription Date
                                </div>
                                <div className="fw-medium">
                                  {formatDate(startDate)}
                                </div>
                              </div>
                              <div className="col-6">
                                <div className="small text-secondary mb-1">
                                  Expiry Date
                                </div>
                                <div className="fw-medium">
                                  {formatDate(endDate)}
                                </div>
                              </div>
                            </div>

                            {endDate && (
                              <div
                                className="progress mb-2"
                                role="progressbar"
                                aria-label="Subscription service remaining"
                                aria-valuenow={progress}
                                aria-valuemin="0"
                                aria-valuemax="100"
                                style={{ height: 8 }}
                              >
                                <div
                                  className="progress-bar"
                                  style={{
                                    width: `${progress}%`,
                                    backgroundColor: "#4b83ed",
                                  }}
                                />
                              </div>
                            )}
                            {daysLeft != null && (
                              <p className="small mb-0">
                                Service Left:{" "}
                                <span className="fw-semibold text-success">
                                  {daysLeft} days left
                                </span>
                              </p>
                            )}

                            {amount !== undefined && amount !== null && (
                              <dl className="row g-2 border-top mt-3 pt-2 mb-0 small">
                                <div className="col-12 col-sm-6">
                                  <dt className="small text-secondary fw-normal">
                                    Amount
                                  </dt>
                                  <dd className="mb-0 fw-medium">{amount}</dd>
                                </div>
                              </dl>
                            )}
                          </div>
                        ),
                      )
                    )}
                  </>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
      {showCancellationConfirmation && (
        <>
          <div
            className="modal-backdrop show"
            aria-hidden="true"
            onClick={() => {
              if (!cancellationLoading) {
                setShowCancellationConfirmation(false);
              }
            }}
          />
          <div
            className="modal show d-block"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-subscription-title"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-4 border-0">
                <div className="modal-body p-4">
                  <h2
                    className="modal-title fs-5 fw-semibold mb-2"
                    id="cancel-subscription-title"
                  >
                    Cancel Subscription
                  </h2>
                  <p className="text-secondary mb-4">
                    Are you sure you want to cancel this subscription?
                  </p>
                  <div className="d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-light"
                      disabled={cancellationLoading}
                      onClick={() => setShowCancellationConfirmation(false)}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      disabled={cancellationLoading}
                      onClick={cancelSubscription}
                    >
                      {cancellationLoading ? "Cancelling…" : "Yes"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

export default ProfilePage;
