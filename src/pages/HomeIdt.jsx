import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../services/api.js";
import {
  selectUapiAuth,
  setUapiCredentials,
  setUapiLoginResponse,
  setUapiMobileNumber,
} from "../store/uapiAuthSlice.js";
import { setEapiCredentials } from "../store/eapiAuthSlice.js";
import {
  assertSuccessfulResponse,
  isValidMobileNumber,
} from "../utils/authResponse.js";

const segments = [
  // "Index Options Recommendations",
  // "Stock Options Recommendations",
  // "Stock Futures Trades",
  // "Cash Intraday Trades",
  "Get 1-2 Index Options Trades Daily",
  "Get 1-2 Stock Options Trades Daily",
  "Get Stock Futures Trades Daily",
  "Get Cash Intraday Trades Daily",
];

const benefits = [
  ["bi-lightning-charge", "Real Time Updates & Follow-ups"],
  ["bi-bullseye", "Clear Entry, Targets & SL"],
  ["bi-file-earmark-bar-graph", "Research Rationale"],
  ["bi-bell", "Instant Notifications"],
  ["bi-headphones", "Quick Help & Support"],
  ["bi-gear", "50+ Tools for Intraday Trading"],
];

const plans = [
  {
    id: "1_month",
    title: "1 Month",
    description: "Billed monthly, cancel anytime.",
    originalPrice: 6000,
    price: 999,
    tag: "83% OFF",
    tagColor: "",
  },
  {
    id: "3_months",
    title: "3 Months",
    description: "One-time payment.",
    originalPrice: 18000,
    price: 2697,
    tag: "85% OFF",
    tagColor: "",
  },
  {
    id: "12_months",
    title: "12 Months",
    description: "One-time payment.",
    originalPrice: 72000,
    price: 7992,
    tag: "89% OFF",
    tagColor: "",
  },
];

const money = (value) =>
  Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

function OfferTimer() {
  const storageKey = "intraday_offer_timer_end";
  const duration = 60 * 60 * 1000;
  const getRemaining = () => {
    const saved = Number(localStorage.getItem(storageKey));
    const end = saved > Date.now() ? saved : Date.now() + duration;
    if (end !== saved) localStorage.setItem(storageKey, String(end));
    return Math.max(0, end - Date.now());
  };
  const [remaining, setRemaining] = useState(getRemaining);

  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(getRemaining()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const totalSeconds = Math.floor(remaining / 1000);
  const parts = [
    Math.floor(totalSeconds / 3600),
    Math.floor((totalSeconds % 3600) / 60),
    totalSeconds % 60,
  ];

  return (
    <span
      className="d-inline-flex gap-1 text-nowrap small flex-shrink-0 text-danger fs-6"
      aria-label="Offer time remaining"
    >
      {parts.map((part, index) => (
        <span
          className="d-inline-flex align-items-baseline gap-1 fw-bold"
          key={index}
        >
          {String(part).padStart(2, "0")}
          <small className="fw-normal">{["h", "m", "s"][index]}</small>
          {index < 2 && <span className="fw-normal">:</span>}
        </span>
      ))}
    </span>
  );
}

export default function HomeIdt({ authenticated = false, onGetStarted, onOtpSent, notify }) {
  const dispatch = useDispatch();
  const savedMobileNumber = useSelector(selectUapiAuth).mobileNumber;
  const [mobileNumber, setMobileNumber] = useState(String(savedMobileNumber ?? ""));
  const [mobileError, setMobileError] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [selectedId, setSelectedId] = useState(plans[0].id);

  const handleCheckOffer = async (event) => {
    event.preventDefault();
    if (sendingOtp) return;
    if (authenticated) {
      onGetStarted();
      return;
    }
    if (!isValidMobileNumber(mobileNumber)) {
      setMobileError("Enter a valid 10-digit mobile number that does not start with 0.");
      return;
    }

    setMobileError("");
    setSendingOtp(true);
    dispatch(setUapiCredentials({ token: null, user: null }));
    dispatch(setEapiCredentials({ token: null, user: null }));
    try {
      const response = await api.uapi.login({
        countryCode: "+91",
        mobile: mobileNumber,
        otpVia: "text",
        registeredVia: "web",
        source: new URLSearchParams(window.location.search).get("sr") ?? "home-idt",
      });
      assertSuccessfulResponse(response, "Unable to send OTP. Please try again.");
      dispatch(setUapiMobileNumber(mobileNumber));
      dispatch(setUapiLoginResponse(response));
      notify("success", response?.message || "OTP sent successfully");
      onOtpSent();
    } catch (error) {
      dispatch(setUapiCredentials({ token: null, user: null }));
      dispatch(setUapiLoginResponse(null));
      dispatch(setEapiCredentials({ token: null, user: null }));
      notify("error", error.message || "Unable to send OTP. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  return (
    <main
      className="min-vh-100 text-body"
      style={{
        backgroundImage: 'url("/images/idt-bg.jpg")',
        backgroundSize: "cover",
      }}
    >
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="text-center">
              <img
                className="img-fluid"
                src="/ep-advisor-logo-dark.png"
                style={{ maxHeight: "40px" }}
                alt="EquityPandit Research Analyst"
              />
              <small className="d-block text-muted mt-2">
                <i className="bi bi-patch-check-fill text-primary me-1" />
                SEBI Registered Research Analyst: INH000029829
              </small>
              <img
                className="img-fluid mt-2 mb-2"
                src="/images/idt-dusserah2.png"
                alt="EquityPandit Research Analyst"
              />
            </div>
          </div>
        </div>

        <section
          className="card border-0 rounded-4 shadow mx-auto overflow-hidden"
          style={{ maxWidth: 540 }}
        >
          <div className="text-center pt-4 px-3">
            <h1 className="fs-2 fw-bold text-uppercase mb-1">Intraday Combo</h1>
            <small
              class="fs-3 fw-bold text-success d-block text-center mb-2"
              style={{
                "font-weight": 900,
                "-webkit-text-stroke": "1px #198754",
              }}
            >
              UPTO 89% OFF
            </small>
            {/* <p className="text-muted mb-4">
              One subscription for research across 4 intraday trading segments.
            </p> */}
          </div>
          <div class="d-flex justify-content-center align-items-center gap-2 px-3 py-2 bg-danger bg-opacity-10">
            <small class="d-block">
              <span class="text-uppercase fw-semibold">
                🔥 Limited-time Offer:
              </span>
            </small>

            <OfferTimer />
          </div>
          <div className="d-flex d-none flex-nowrap justify-content-between align-items-center bg-danger-subtle px-4 py-2">
            <small className="fw-semibold text-uppercase text-nowrap">
              Limited-time offer:
            </small>
            <OfferTimer />
          </div>

          <div className="card-body p-3 p-md-4">
            <p className="d-none">
              <strong>Intraday Combo</strong> gives you structured intraday
              recommendations, market insights and timely updates, so you can
              make informed trading decisions.
            </p>

            <p className="small text-secondary text-capitalize fw-semibold mb-2">
              One Plan. Four Segments. Complete Intraday Research.
            </p>
            <ul className="list-unstyled mb-0">
              {segments.map((segment) => (
                <li
                  className=" fw-bold d-flex align-items-center"
                  key={segment}
                >
                  <i
                    className={`bi bi-check fs-4 me-1`}
                    style={{ color: "#FA5B05" }}
                  />
                  {segment}
                </li>
              ))}
            </ul>

            <p className="small text-secondary text-uppercase fw-semibold mt-4 mb-2 d-none">
              Included with every plan
            </p>
            <ul className="list-unstyled mb-0 d-none">
              {benefits.map(([icon, text]) => (
                <li className="mb-2" key={text}>
                  <i
                    className={`bi ${icon} mx-1 me-2`}
                    style={{ color: "#FA5B05" }}
                  />
                  {text}
                </li>
              ))}
            </ul>

            <p className="d-none small text-secondary text-uppercase fw-semibold mt-4 mb-2">
              Choose your plan
            </p>
            <div className="d-grid gap-3 mb-3 d-none">
              {plans.map((plan) => {
                const selected = plan.id === selectedId;
                return (
                  <label
                    className={`border rounded-3 p-3 ${selected ? "border-warning bg-warning bg-opacity-10 shadow-sm" : "bg-white"}`}
                    role="button"
                    key={plan.id}
                  >
                    <span className="d-flex justify-content-between align-items-center gap-3">
                      <span className="d-flex gap-2 align-items-center">
                        <input
                          className="form-check-input mt-0 flex-shrink-0"
                          type="radio"
                          name="subscription-plan"
                          checked={selected}
                          onChange={() => setSelectedId(plan.id)}
                        />
                        <span>
                          <strong>{plan.title}</strong>
                          {plan.tag && (
                            <small
                              className={`badge ms-2 fw-semibold`}
                              style={{ backgroundColor: "#FA5B05" }}
                            >
                              {plan.tag}
                            </small>
                          )}
                          <small className="d-block text-muted mt-1">
                            {plan.description}
                          </small>
                        </span>
                      </span>
                      <span className="text-end flex-shrink-0">
                        {plan.originalPrice > plan.price && (
                          <s className="d-block text-muted small pb-2">
                            ₹{money(plan.originalPrice)}
                          </s>
                        )}
                        <strong
                          className="d-block lh-1 fs-5"
                          style={{ color: "#FA5B05" }}
                        >
                          ₹{money(plan.price)}
                        </strong>
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
            <div className="row justify-content-center">
            <div className="col-md-9 " >
            <form className="mt-4 text-center" onSubmit={handleCheckOffer} noValidate>
              <label className="form-label" htmlFor="home-idt-mobile">
                <small className="fst-italic">Enter Mobile Number To Check The Offer</small>
              </label>
              <div className="input-group">
                <span className="input-group-text">+91</span>
                <input
                  id="home-idt-mobile"
                  autoFocus
                  className={`form-control form-control-lg ${mobileError ? "is-invalid" : ""}`}
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"wase
                  placeholder=""
                  maxLength={10}
                  value={mobileNumber}
                  disabled={sendingOtp}
                  onChange={(event) => {
                    setMobileNumber(event.target.value.replace(/\D/g, "").slice(0, 10));
                    setMobileError("");
                  }}
                  aria-invalid={Boolean(mobileError)}
                  aria-describedby={mobileError ? "home-idt-mobile-error" : undefined}
                  required
                />
              </div>
              {mobileError && (
                <p className="small text-danger mt-2 mb-0" id="home-idt-mobile-error" role="alert">
                  {mobileError}
                </p>
              )}              
              <button
                className="btn btn-warning fw-semibold btn-lg w-100 mt-3 shadow-sm"
                type="submit"
                disabled={sendingOtp}
              >
                {sendingOtp && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
                {/* {sendingOtp ? "Sending OTP..." : "Check Offer Now"} */}
                {sendingOtp ? "Sending OTP..." : "Continue"}
              </button>
            </form>
            </div>
            </div>
            <div className=" text-center mt-4">
              <small className="text-muted ">
                Recommendations Given By{" "}
                <br className="d-block d-md-none" /> SEBI Registered Research
                Analyst.
              </small>
            </div>
            {/* <small className="d-block text-center text-muted mt-2">
              <i className="bi bi-shield-fill-check text-success me-1" />
              Secure payment. Access starts right after you subscribe.
            </small> */}
            <small className="d-block text-center text-muted lh-sm mt-2">
              {/* <small> */}
                Investments in securities markets are subject to market risk.
                Read all related documents carefully before investing.
              {/* </small> */}
            </small>
          </div>

          <footer className="card-footer border-top bg-body-tertiary text-center p-3">
            <small className="text-muted">
              For any query, contact our support team.
            </small>
            <a
              className="d-block mt-2 text-decoration-none"
              href="tel:8000816688"
            >
              <i className="bi bi-telephone me-1" />
              8000 816 688
            </a>
            <a
              className="d-block mt-2 text-decoration-none"
              href="mailto:support@equitypandit.com"
            >
              <i className="bi bi-envelope me-1" />
              support@equitypandit.com
            </a>
          </footer>
        </section>
      </div>
    </main>
  );
}
