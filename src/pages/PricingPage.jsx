import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { load } from "@cashfreepayments/cashfree-js";
import { useSelector } from "react-redux";
import { AuthTrustBar } from "../components/AuthPageLayout.jsx";
import OfferCountdown from "../components/OfferCountdown.jsx";
import api from "../services/api.js";
import { selectEapiAuth } from "../store/eapiAuthSlice.js";
import { getSource, getUserId } from "../utils/authResponse.js";
import {
  agreementIsComplete,
  kycIsComplete,
  paymentIsComplete,
  payloadOf,
} from "../utils/onboardingStatus.js";
import { trackMetaEvent } from "../utils/metaPixel.js";
import { ANALYTICS_EVENTS, trackAnalyticsEvent } from "../utils/analytics.js";

const money = (amount) => `₹${Number(amount || 0).toLocaleString("en-IN")}`;
const privacyPolicyUrl = "https://equitypandit.in/privacy-policy";
const termsConditionsUrl = "https://equitypandit.in/terms-conditions";

const includedServices = [
  {
    icon: "bi-graph-up-arrow",
    color: "#078f68",
    background: "#dcf7ec",
    title: "Live Options",
    subtitle: "Trades",
  },
  {
    icon: "bi-bar-chart-fill",
    color: "#0686a8",
    background: "#e0f4fa",
    title: "Cash Intraday",
    subtitle: "Trades",
  },
  {
    icon: "bi-file-earmark-bar-graph",
    color: "#5534d8",
    background: "#ece8ff",
    title: "Stock Futures",
    subtitle: "Intraday Trades",
  },
];

const planBenefits = [
  {
    icon: "bi-camera-video",
    title: "Live research calls",
    description:
      "Get live market trading calls for Nifty, BankNifty and Sensex.",
  },
  {
    icon: "bi-graph-up-arrow",
    title: "Entry, target & stop-loss updates",
    description:
      "Get clear trade levels and timely updates throughout the trade.",
  },
  {
    icon: "bi-file-earmark-text",
    title: "Analyst rationale",
    description: "Understand the research and logic behind every call.",
  },
  {
    icon: "bi-bell",
    title: "Instant notifications",
    description:
      "Be among the first to know about new trade ideas and updates.",
  },
];

function PlanBenefits() {
  return (
    <section className="p-4 h-100" aria-labelledby="plan-benefits-title">
      <span
        className="d-inline-flex align-items-center justify-content-center rounded-circle"
        style={{
          width: "64px",
          height: "64px",
          color: "#FA5B05",
          backgroundColor: "#fff",
        }}
      >
        <i className="bi bi-stars fs-2" aria-hidden="true" />
      </span>
      <h2 className="display-6 fw-bold mb-2" id="plan-benefits-title">
        What you’ll receive
      </h2>
      <p className="text-secondary mb-4">
        Everything you need to trade confidently with research-backed insights.
      </p>
      <div className="d-grid gap-4">
        {planBenefits.map((benefit) => (
          <div className="d-flex align-items-start gap-3" key={benefit.title}>
            <span
              className="d-inline-flex align-items-center justify-content-center rounded-3 bg-white shadow-sm flex-shrink-0"
              style={{
                width: "40px",
                height: "40px",
                color: "#FA5B05",
                backgroundColor: "#fff1e8",
              }}
            >
              <i className={`bi ${benefit.icon}`} aria-hidden="true" />
            </span>
            <div>
              <strong className="d-block text-dark">{benefit.title}</strong>
              <span
                className="d-block text-secondary lh-sm mt-1"
                style={{ fontSize: ".875rem" }}
              >
                {benefit.description}
              </span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-secondary mt-4 small">
        For any grievances/support, contact our support team at{" "}
        <a
          className="fw-bold text-dark text-decoration-none"
          href="mailto:support@equitypandit.com"
        >
          support@equitypandit.com
        </a>{" "}
        or call us at{" "}
        <a
          className="fw-bold text-dark text-decoration-none"
          href="tel:8000816688"
        >
          8000 816 688
        </a>
      </p>
    </section>
  );
}

function ServiceOverview() {
  return (
    <div className="text-center mb-4">
      <div className="text-center mb-3 d-none">
        <span
          className="d-inline-flex align-items-center justify-content-center gap-2 px-3 py-1 border rounded-pill small"
          style={{
            borderColor: "#f5c58c",
            background: "#fffaf5",
            fontWeight: 700,
          }}
        >
          <i className="bi bi-gem" style={{ color: "#e6a000" }}></i>
          Exclusively For You
        </span>
      </div>

      <h1
        className="fw-bold mb-4 d-none"
        id="services-title"
        style={{ color: "#071126", fontSize: "clamp(2rem, 6vw, 2.7rem)" }}
      >
        Intraday <span style={{ color: "#FA5B05" }}>PRO</span>
      </h1>

      <div className="row g-0 py-2 mb-3 d-none">
        {includedServices.map((service, index) => (
          <div
            className={`col-4 position-relative px-1 px-sm-3 py-2 ${index === 1 ? "" : ""}`}
            key={service.title}
          >
            <span
              className="d-inline-flex align-items-center justify-content-center rounded-3 p-2 mb-2"
              style={{
                color: service.color,
                backgroundColor: service.background,
                width: "56px",
                height: "56px",
              }}
            >
              {index === 1 ? (
                <span
                  className="d-flex align-items-end gap-1"
                  aria-hidden="true"
                >
                  <span
                    className="d-block rounded-1 bg-success"
                    style={{ width: "7px", height: "25px" }}
                  />
                  <span
                    className="d-block rounded-1 bg-success"
                    style={{ width: "7px", height: "36px" }}
                  />
                  <span
                    className="d-block rounded-1 bg-danger"
                    style={{ width: "7px", height: "29px" }}
                  />
                </span>
              ) : (
                <i className={`bi ${service.icon} fs-3`} aria-hidden="true" />
              )}
            </span>
            <strong
              className="d-block text-dark lh-sm"
              style={{ fontSize: "clamp(.78rem, 2.4vw, 1rem)" }}
            >
              {service.title}
            </strong>
            <span
              className="d-block text-secondary lh-sm mt-1"
              style={{ fontSize: "clamp(.7rem, 2.1vw, .875rem)" }}
            >
              {service.subtitle}
            </span>
            {index < includedServices.length - 1 && (
              <span
                className="position-absolute end-0 top-50 translate-middle-y border-end h-75"
                aria-hidden="true"
              />
            )}
          </div>
        ))}
      </div>

      <div
        className="d-flex align-items-center gap-3 rounded-3 border text-start px-3 py-2 d-none"
        style={{
          borderRadius: "20px",
          borderColor: "#bcdcff",
          background: "linear-gradient(90deg, #edf7ff, #f7fbff)",
        }}
      >
        <span
          className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 text-primary flex-shrink-0"
          style={{ width: "42px", height: "42px" }}
        >
          <i className="bi bi-bullseye fs-4" aria-hidden="true" />
        </span>
        <small>
          <span className="small text-secondary">
            All services will include
            <strong className="d-block text-primary">
              Entry Price, Targets &amp; Stop Loss.
            </strong>
          </span>
        </small>
      </div>
    </div>
  );
}

const mobileSegments = [
  { icon: "bi-bar-chart-fill", label: "Index Options" },
  { icon: "bi-graph-up-arrow", label: "Stock Options" },
  { icon: "bi-stack", label: "Stock Futures" },
  { icon: "bi-bar-chart-steps", label: "Cash Intraday" },
];

const mobileFeatures = [
  { icon: "bi-lightning-charge", label: "Real-Time Updates & Follow-Ups" },
  { icon: "bi-bullseye", label: "Clear Entry, Targets & SL" },
  { icon: "bi-file-earmark-text", label: "Research Rationales" },
  { icon: "bi-bell", label: "Instant Notifications" },
  { icon: "bi-headset", label: "Quick Help & Support" },
  { icon: "bi-gear", label: "50+ Tools for Intraday Trading" },
];

function MobileServiceList({
  loading,
  loadError,
  plans,
  selectedPlanId,
  setSelectedPlanId,
  statuses,
  termsAccepted,
  setTermsAccepted,
  paymentLoading,
  cashfreeReady,
  handleSubscribe,
  loadPlansAndStatuses,
}) {
  const plansRef = useRef(null);

  return (
    <main className="bg-body-tertiary d-md-none" id="main-content">
      <div className="p-3">
        <section
          className="shadow-sm bg-body rounded-3"
          aria-labelledby="mobile-combo-title"
        >
          <div className="p-3">
          <h2 id="mobile-combo-title" className="text-center">
            Intraday Combo
          </h2>
          <small className="small mb-0 text-center text-muted text-capitalize d-block mt-2">
            One subscription for research across 4 intraday trading segments.
          </small>
          </div>
          <div className=" border bg-light px-3 pt-2 pb-3 d-none">
            <OfferCountdown flush label="Limited Time Offer" />
            <button
              className="btn btn-warning fw-semibold w-100 rounded-3 py-2"
              type="button"
              onClick={() =>
                plansRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                })
              }
            >
              Check The Offer
            </button>
          </div>
          <div className="p-3 d-none">
          <h3 className="mobile-services__eyebrow my-3">Segments</h3>
          <div className="row g-2">
            {mobileSegments.map((segment) => (
              <div className="col-6" key={segment.label}>
                <div className="rounded-3 bg-body-tertiary p-2">
                  <i
                    className={`bi ${segment.icon} me-2`}
                    style={{ color: "#fb7914" }}
                    aria-hidden="true"
                  />
                  <small>{segment.label}</small>
                </div>
              </div>
            ))}
          </div>

          {/* <div className="mobile-services__divider" /> */}
          <h3 className="mobile-services__eyebrow my-3">Features</h3>
          <ul className="list-unstyled">
            {mobileFeatures.map((feature) => (
              <li className="mb-2" key={feature.label}>
                <div className="d-inline-block p-1 rounded-2 me-2" style={{"color": " #fb7914",background:"#fb791410"}}>
                <i className={`bi ${feature.icon} mx-1`} aria-hidden="true" />
                </div>
                <small>{feature.label}</small>
              </li>
            ))}
          </ul>
          <hr/>
          <div className="text-center text-muted small mt-3">
            <span className="d-block fw-semibold">
              <i class="bi bi-patch-check-fill text-primary" /> SEBI Registered
              Research Analyst.
            </span>
            <span>SEBI Registration No.: INH000029829</span>
          </div>
          </div>
        </section>
        <section
          className="bg-body p-3 shadow-sm mt-3 rounded-3"
          ref={plansRef}
          aria-labelledby="mobile-plans-title"
        >
          <OfferCountdown flush label="This Offer Ends In" />

          <h2 id="mobile-plans-title" className="text-center">
            Choose a plan
          </h2>
          {loading && (
            <div className="spinner-border text-warning my-4" role="status">
              <span className="visually-hidden">Loading plans</span>
            </div>
          )}
          {!loading && loadError && (
            <div className="alert alert-light border">
              <p>{loadError}</p>
              <button
                className="btn btn-outline-dark btn-sm"
                type="button"
                onClick={loadPlansAndStatuses}
              >
                Try again
              </button>
            </div>
          )}
          {!loading && !loadError && !plans.length && (
            <p className="text-secondary">
              No subscription plans are available right now.
            </p>
          )}
          {!loading &&
            !loadError &&
            plans.map((plan) => {
              const selected = selectedPlanId === plan.id;
              return (
                <label
                  className={`mobile-services__plan rounded-3 ${selected ? "is-selected" : ""}`}
                  key={plan.id}
                >
                  <input
                    type="radio"
                    name="mobile-subscription-plan"
                    checked={selected}
                    onChange={() => setSelectedPlanId(plan.id)}
                  />
                  <span>
                    <strong>{plan.name}</strong>
                    <small>{plan.note}</small>
                  </span>
                  <span className="text-end">
                    {plan.originalPrice > plan.price && (
                      <small className="d-block text-secondary text-decoration-line-through">
                        {money(plan.originalPrice)}
                      </small>
                    )}
                    <strong className="d-block mobile-services__plan-price">
                      {money(plan.price)}
                    </strong>
                  </span>
                </label>
              );
            })}
          {!loading &&
            !loadError &&
            plans.length > 0 &&
            !statuses.paymentComplete && (
              <div className="form-check my-3 small">
                <input
                  className="form-check-input"
                  id="subscription-consent"
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(event) => setTermsAccepted(event.target.checked)}
                  disabled={paymentLoading}
                />
                <label
                  className="form-check-label text-muted small"
                  htmlFor="subscription-consent"
                >
                  I agree to the{" "}
                  <a
                    className="text-muted"
                    href={termsConditionsUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    MITC
                  </a>{" "}
                  and{" "}
                  <a
                    className="text-muted"
                    href={privacyPolicyUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Privacy Policy
                  </a>
                  .
                </label>
              </div>
            )}
          {!loading && !loadError && plans.length > 0 && (
            <button
              className="btn btn-warning fw-semibold w-100 rounded-3 d-flex align-items-center justify-content-center gap-3 py-2 mt-3"
              type="button"
              disabled={
                !selectedPlanId ||
                paymentLoading ||
                (!statuses.paymentComplete &&
                  (!cashfreeReady || !termsAccepted))
              }
              onClick={handleSubscribe}
            >
              <span>
                {paymentLoading
                  ? "Starting payment..."
                  : statuses.paymentComplete
                    ? "Continue"
                    : "Pay Now"}
              </span>
            </button>
          )}
        </section>
        {/* <footer className="mobile-services__footer"><span>Research service only. No assured or guaranteed returns.</span><span><a href={termsConditionsUrl} target="_blank" rel="noreferrer">Terms</a> · <a href={privacyPolicyUrl} target="_blank" rel="noreferrer">Privacy Policy</a></span></footer> */}
      </div>
    </main>
  );
}

function findResponseValue(source, keys) {
  if (!source) return "";

  if (typeof source === "string") {
    const trimmedValue = source.trim();
    const lookingForSubscription = keys.some(
      (key) =>
        key.toLowerCase().includes("subscription") ||
        key.toLowerCase().includes("subs"),
    );
    if (lookingForSubscription && trimmedValue.startsWith("sub_session_"))
      return trimmedValue;

    try {
      return findResponseValue(JSON.parse(trimmedValue), keys);
    } catch {
      return "";
    }
  }

  if (typeof source !== "object") return "";

  const normalizedKeys = new Set(
    keys.map((key) => key.replace(/[^a-z0-9]/gi, "").toLowerCase()),
  );

  for (const [key, value] of Object.entries(source)) {
    const normalizedKey = key.replace(/[^a-z0-9]/gi, "").toLowerCase();
    if (
      normalizedKeys.has(normalizedKey) &&
      value !== undefined &&
      value !== null &&
      String(value).trim()
    )
      return value;
  }

  for (const value of Object.values(source)) {
    const nestedValue = findResponseValue(value, keys);
    if (nestedValue) return nestedValue;
  }

  return "";
}

function subscriptionList(response) {
  const payload = payloadOf(response);
  if (Array.isArray(payload)) return payload;
  return (
    payload?.subscriptions ||
    payload?.plans ||
    payload?.results ||
    payload?.rows ||
    []
  );
}

function normalizePlan(plan, index) {
  const rawMonths =
    plan.durationInMonths ??
    plan.months ??
    plan.duration ??
    plan.validityMonths ??
    1;
  const parsedMonths = Number.parseInt(rawMonths, 10);
  const months =
    Number.isFinite(parsedMonths) && parsedMonths > 0 ? parsedMonths : 1;
  const price = Number(months * (plan.discountedPrice ?? 0));
  const originalPrice = Number(months * (plan.actualPrice ?? 0));
  const name =
    plan.name || plan.title || `${months} ${months === 1 ? "Month" : "Months"}`;
  const note = plan.note;

  return {
    ...plan,
    id: plan.id || plan._id || plan.subscriptionId || `${name}-${index}`,
    name,
    price,
    originalPrice,
    note,
    autoRenew: Boolean(plan.autoRenew ?? plan.isAutoRenew ?? months === 1),
  };
}

const PENDING_PLAN_KEY = "idt:pendingPaymentPlanId";

function readPendingPlanId() {
  try {
    return sessionStorage.getItem(PENDING_PLAN_KEY) || "";
  } catch {
    return "";
  }
}

function writePendingPlanId(planId) {
  try {
    if (planId) sessionStorage.setItem(PENDING_PLAN_KEY, planId);
    else sessionStorage.removeItem(PENDING_PLAN_KEY);
  } catch {
    // Storage unavailable (private mode etc.) — plan simply won't be preselected.
  }
}

function ServiceListPage({
  onContinue,
  onStatusChange,
  onCheckCompliance,
  onComplianceRequired,
  notify,
}) {
  const eapiAuth = useSelector(selectEapiAuth);
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [statuses, setStatuses] = useState({
    kycComplete: false,
    agreementComplete: false,
    paymentComplete: false,
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [cashfree, setCashfree] = useState({});
  const [cashfreeReady, setCashfreeReady] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const paymentRedirected = useRef(false);
  const paymentAttempted = useRef(false);

  useEffect(() => {
    let active = true;

    const initializeSDK = async () => {
      try {
        const cash = await load({ mode: CASHFREE_ENV });
        if (active) {
          setCashfree(cash || {});
          setCashfreeReady(Boolean(cash));
        }
      } catch (error) {
        if (active)
          notify(
            "error",
            error.message || "Unable to initialize Cashfree checkout",
          );
      }
    };

    initializeSDK();
    return () => {
      active = false;
    };
  }, [notify]);

  const loadPlansAndStatuses = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    try {
      const epUserId =
        getUserId(eapiAuth.user) || getUserId(eapiAuth.loginResponse);
      const [subscriptionsResult, agreementResult] = await Promise.allSettled([
        api.uapi.getSubscriptions(),
        api.uapi.checkAgreementStatus(),
      ]);

      if (subscriptionsResult.status === "rejected")
        throw subscriptionsResult.reason;

      const nextPlans = subscriptionList(subscriptionsResult.value)
        .filter((plan) => plan.isShow === true)
        .map(normalizePlan);
      setPlans(nextPlans);
      const pendingPlanId = readPendingPlanId();
      setSelectedPlanId((currentId) =>
        nextPlans.some((plan) => plan.id === currentId)
          ? currentId
          : nextPlans.some((plan) => plan.id === pendingPlanId)
            ? pendingPlanId
            : nextPlans[0]?.id || "",
      );

      const statusResponse =
        agreementResult.status === "fulfilled" ? agreementResult.value : null;
      const paymentComplete = paymentIsComplete(statusResponse);
      let kycComplete = false;

      if (eapiAuth.token && epUserId) {
        try {
          const kycResponse = await api.eapi.getKycByUserId(epUserId);
          kycComplete = kycIsComplete(kycResponse);
        } catch (error) {
          if (error.status !== 404)
            notify("error", error.message || "Unable to check KYC status");
        }
      }

      const nextStatuses = {
        agreementComplete: agreementIsComplete(statusResponse),
        paymentComplete,
        kycComplete,
      };
      setStatuses(nextStatuses);
      onStatusChange(nextStatuses);

      if (agreementResult.status === "rejected")
        notify(
          "error",
          agreementResult.reason?.message ||
            "Unable to check agreement and payment status",
        );
    } catch (error) {
      setLoadError(error.message || "Unable to load subscription plans");
    } finally {
      setLoading(false);
    }
  }, [eapiAuth.loginResponse, eapiAuth.token, eapiAuth.user, notify, onStatusChange]);

  useEffect(() => {
    loadPlansAndStatuses();
  }, [loadPlansAndStatuses]);

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId),
    [plans, selectedPlanId],
  );

  useEffect(() => {
    if (
      loading ||
      loadError ||
      !statuses.paymentComplete ||
      !selectedPlan ||
      paymentRedirected.current
    )
      return;

    paymentRedirected.current = true;
    notify("success", "Payment completed successfully");
    if (paymentAttempted.current) {
      trackAnalyticsEvent(ANALYTICS_EVENTS.PAYMENT_SUCCESS, {
        value: Number(selectedPlan.price || 0),
        currency: "INR",
      });
      paymentAttempted.current = false;
    }
    onContinue({ plan: selectedPlan, statuses });
  }, [loadError, loading, notify, onContinue, selectedPlan, statuses]);

  const handleSubscribe = async () => {
    if (!selectedPlan) return;

    if (statuses.paymentComplete) {
      onContinue({ plan: selectedPlan, statuses });
      return;
    }

    if (!termsAccepted) {
      notify("error", "Please accept the MITC and Privacy Policy to subscribe");
      return;
    }

    setPaymentLoading(true);
    let latestStatuses = statuses;
    try {
      latestStatuses = (await onCheckCompliance?.()) || statuses;
    } finally {
      setPaymentLoading(false);
    }

    if (latestStatuses.paymentComplete) {
      writePendingPlanId("");
      onContinue({ plan: selectedPlan, statuses: latestStatuses });
      return;
    }

    if (!latestStatuses.kycComplete || !latestStatuses.agreementComplete) {
      writePendingPlanId(selectedPlan.id);
      notify(
        "error",
        !latestStatuses.kycComplete
          ? "Please complete your KYC before making the payment"
          : "Please sign the agreement before making the payment",
      );
      onComplianceRequired?.(latestStatuses);
      return;
    }
    writePendingPlanId("");

    const recurringPayment = Boolean(selectedPlan.cfPlanId);
    const checkoutAvailable = recurringPayment
      ? typeof cashfree.subscriptionsCheckout === "function"
      : typeof cashfree.checkout === "function";

    if (!cashfreeReady || !checkoutAvailable) {
      notify("error", "Payment checkout is still loading. Please try again.");
      return;
    }

    trackMetaEvent("InitiateCheckout", {
      content_ids: [String(selectedPlan.planId ?? selectedPlan.id)],
      content_name:
        selectedPlan.name || selectedPlan.title || "Subscription Plan",
      content_type: "product",
      value: Number(selectedPlan.price || 0),
      currency: "INR",
      num_items: 1,
    });
    paymentAttempted.current = true;
    trackAnalyticsEvent(ANALYTICS_EVENTS.PAYMENT_INIT, {
      value: Number(selectedPlan.price || 0),
      currency: "INR",
    });

    const planId = selectedPlan.planId ?? selectedPlan.id;
    const paymentPayload = {
      planId,
      // prevPageUrl: `/recurring-return-url`,
      prevPageUrl: getSource(),
      platform: "web",
      // source: getSource(),
    };

    if (!recurringPayment) paymentPayload.isWalletApplied = true;

    setPaymentLoading(true);
    try {
      const response = recurringPayment
        ? await api.uapi.initializeCashfreeRecurringPayment(paymentPayload)
        : await api.uapi.initializeCashfreePayment(paymentPayload);
      const subscriptionSessionId = findResponseValue(response, [
        "subscription_session_id",
        "subscriptionSessionId",
        "subscriptionSessionID",
        "cf_subscription_session_id",
        "subsSessionId",
      ]);

      if (subscriptionSessionId) {
        if (typeof cashfree.subscriptionsCheckout !== "function")
          throw new Error("Cashfree subscription checkout is unavailable");

        const checkoutResult = await cashfree.subscriptionsCheckout({
          subsSessionId: subscriptionSessionId,
        });
        if (checkoutResult?.error)
          throw new Error(
            checkoutResult.error.message ||
              "Recurring payment was not completed",
          );
        await loadPlansAndStatuses();
        return;
      }

      if (recurringPayment)
        throw new Error(
          "Subscription session ID was not returned by the server",
        );

      const paymentSessionId = findResponseValue(response, [
        "paymentSessionId",
        "payment_session_id",
        "cfPaymentSessionId",
        "sessionId",
      ]);

      if (!paymentSessionId)
        throw new Error("Payment session ID was not returned by the server");

      const checkoutResult = await cashfree.checkout({
        paymentSessionId,
        redirectTarget: "_modal",
      });
      if (checkoutResult?.error)
        throw new Error(
          checkoutResult.error.message || "Payment was not completed",
        );
      await loadPlansAndStatuses();
    } catch (error) {
      trackAnalyticsEvent(ANALYTICS_EVENTS.PAYMENT_FAILED, {
        value: Number(selectedPlan.price || 0),
        currency: "INR",
      });
      paymentAttempted.current = false;
      notify("error", error.message || "Unable to start payment");
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <>
      <MobileServiceList
        loading={loading}
        loadError={loadError}
        plans={plans}
        selectedPlanId={selectedPlanId}
        setSelectedPlanId={setSelectedPlanId}
        statuses={statuses}
        termsAccepted={termsAccepted}
        setTermsAccepted={setTermsAccepted}
        paymentLoading={paymentLoading}
        cashfreeReady={cashfreeReady}
        handleSubscribe={handleSubscribe}
        loadPlansAndStatuses={loadPlansAndStatuses}
      />
      <main
        className="container flex-grow-1 py-3 d-none d-lg-block"
        id="desktop-services-content"
      >
        <div className="row justify-content-between align-items-stretch g-4">
          <div className="col-12 col-lg-7 order-2 order-lg-1">
            <PlanBenefits />
          </div>
          <div className="col-12 col-lg-5 order-1 order-lg-2">
            <div
              className="card border rounded-3 shadow-sm overflow-hidden"
              aria-labelledby="services-title"
            >
              <div className="px-md-4 px-3 py-3">
                <OfferCountdown flush label="This Offer Ends In" />
                <header className="mb-2">
                  <h5
                    className="mb-3 fw-semibold d-block text-center "
                    id="services-title"
                  >
                    Choose a plan
                  </h5>
                  <p className="text-secondary mb-0 small">
                    {/* <span
                    className="d-md-block text-nowrap mt-1"
                    style={{ color: "#FA5B05", fontSize: "clamp(.75rem, 3.4vw, .875rem)" }}
                  >
                     SEBI Registered Research Analyst.
                  </span> */}
                  </p>
                </header>

                {loading && (
                  <div className="text-center py-5">
                    <div className="spinner-border text-warning" role="status">
                      <span className="visually-hidden">Loading plans</span>
                    </div>
                  </div>
                )}
                {!loading && loadError && (
                  <div className="alert alert-danger mb-0" role="alert">
                    <p className="mb-3">{loadError}</p>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      type="button"
                      onClick={loadPlansAndStatuses}
                    >
                      Try again
                    </button>
                  </div>
                )}
                {!loading && !loadError && !plans.length && (
                  <div className="alert alert-secondary mb-0">
                    No subscription plans are available right now.
                  </div>
                )}
                {!loading && !loadError && (
                  <div className="d-grid gap-3 mb-2">
                    {plans.map((plan) => {
                      const selected = selectedPlanId === plan.id;

                      return (
                        <label
                          key={plan.id}
                          htmlFor={`subscription-plan-${plan.id}`}
                          className={`border rounded-3 p-3 ${selected ? "shadow-sm bg-warning bg-opacity-10 border-warning" : "bg-white"}`}
                          // style={
                          //   selected
                          //     ? {
                          //         borderColor: "#ff9f00",
                          //         backgroundColor: "#fff9e8",
                          //         cursor: "pointer",
                          //       }
                          //     : { cursor: "pointer" }
                          // }
                        >
                          <div className="d-flex align-items-center justify-content-between gap-3">
                            <div className="d-flex align-items-center gap-3">
                              <input
                                className="form-check-input mt-0 flex-shrink-0"
                                id={`subscription-plan-${plan.id}`}
                                type="radio"
                                name="subscription-plan"
                                value={plan.id}
                                checked={selected}
                                onChange={() => setSelectedPlanId(plan.id)}
                                // style={{
                                //   accentColor: "#FA5B05",
                                //   transform: "scale(1.3)",
                                // }}
                              />
                              <div>
                                <strong className="d-block fs-6">
                                  {plan.name}
                                </strong>
                                <small>
                                  <small className="d-block text-muted mt-1">
                                    {plan.note}
                                  </small>
                                </small>
                                {/* {plan.cfPlanId && (
                                <small>
                                  {" "}
                                  <small className="d-block text-muted mt-1">
                                    Charged Monthly.
                                  </small>
                                </small>
                              )} */}
                              </div>
                            </div>

                            <div className="d-flex align-items-center gap-2 flex-shrink-0">
                              <div className="text-end">
                                {plan.originalPrice > plan.price && (
                                  <span className="small text-secondary text-decoration-line-through d-block pb-2">
                                    {money(plan.originalPrice)}
                                  </span>
                                )}
                                <strong
                                  className="d-block lh-1"
                                  style={{ color: "#FA5B05" }}
                                >
                                  {money(plan.price)}
                                </strong>
                              </div>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
                {!loading &&
                  !loadError &&
                  plans.length > 0 &&
                  !statuses.paymentComplete && (
                    <div className="form-check my-3 small">
                      <input
                        className="form-check-input"
                        id="subscription-consent"
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(event) =>
                          setTermsAccepted(event.target.checked)
                        }
                        disabled={paymentLoading}
                      />
                      <label
                        className="form-check-label text-muted small"
                        htmlFor="subscription-consent"
                      >
                        I agree to the{" "}
                        <a
                          className="text-muted"
                          href={termsConditionsUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          MITC
                        </a>{" "}
                        and{" "}
                        <a
                          className="text-muted"
                          href={privacyPolicyUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Privacy Policy
                        </a>
                        .
                      </label>
                    </div>
                  )}
                {!loading && !loadError && plans.length > 0 && (
                  <>
                    <button
                      className={`btn btn-warning fw-semibold p-3 w-100 shadow-sm ${!statuses.paymentComplete ? "" : ""}`}
                      type="button"
                      disabled={
                        !selectedPlan ||
                        paymentLoading ||
                        (!statuses.paymentComplete &&
                          (!cashfreeReady || !termsAccepted))
                      }
                      onClick={handleSubscribe}
                    >
                      <span>
                        {paymentLoading && (
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            aria-hidden="true"
                          />
                        )}
                        {paymentLoading
                          ? "Starting payment..."
                          : statuses.paymentComplete
                            ? "Continue"
                            : "Pay Now"}
                      </span>
                      {/* {!paymentLoading &&
                      !statuses.paymentComplete &&
                      selectedPlan && (
                        <strong className="text-nowrap">
                          {money(selectedPlan.price)}{" "}
                          <i
                            className="bi bi-arrow-right ms-2"
                            aria-hidden="true"
                          />
                        </strong>
                      )} */}
                    </button>
                    {/* {!statuses.paymentComplete && selectedPlan?.cfPlanId && (
                    <div className="d-flex align-items-center gap-3 mt-3">
                      <hr className="flex-grow-1 text-secondary" />
                      <p className="small text-secondary text-center text-nowrap mb-0">
                        <i
                          className="bi bi-arrow-repeat me-2"
                          aria-hidden="true"
                        />
                        Renew Monthly. Cancel Anytime.
                      </p>
                      <hr className="flex-grow-1 text-secondary" />
                    </div>
                  )} */}
                  </>
                )}
                <div className="text-center mt-3">
                  <span className="small text-muted d-block">
                    <small>SEBI Registered Research Analyst.</small>
                  </span>
                  {/* <br></br> */}
                  <span className="small text-muted">
                    <small>SEBI Registration No.: INH000029829</small>
                  </span>
                </div>
              </div>
              {/* <div className="card-footer bg-light text-center text-secondary small py-3">
              KYC is mandatory for all subscriptions. Market risks apply.
            </div> */}
            </div>
            {/* <AuthTrustBar /> */}
          </div>
        </div>
      </main>
    </>
  );
}

export default ServiceListPage;
