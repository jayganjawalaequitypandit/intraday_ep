import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../services/api.js";
import {
  selectUapiAuth,
  setUapiCredentials,
  setUapiLoginResponse,
  setUapiMobileNumber,
  setUapiOtpVia,
} from "../store/uapiAuthSlice.js";
import { setEapiCredentials } from "../store/eapiAuthSlice.js";
import {
  assertSuccessfulResponse,
  getSource,
  isValidMobileNumber,
} from "../utils/authResponse.js";
import { AuthTrustBar } from "../components/AuthPageLayout.jsx";
import OfferCountdown from "../components/OfferCountdown.jsx";

export const LOGIN_SLIDES = [
  {
    src: "/images/login-carousel/idt-app-overview.png",
    alt: "Intraday Traders mobile app overview",
    eyebrow: "ALL-IN-ONE",
    title: "All Your Intraday Trades in One Place",
    description:
      "Access Index Options, Stock Options, Stock Futures, and Cash Intraday recommendations in one place.",
  },
  {
    src: "/images/login-carousel/idt-live-calls.png",
    alt: "Intraday Traders live calls",
    eyebrow: "OPTIONS RECOMMENDATIONS",
    title: "Live Index & Stock Options Calls",
    description:
      "Get research-backed options recommendations with Entry, Targets, Stop-Loss, and timely updates.",
  },
  {
    src: "/images/login-carousel/idt-cash-intraday-signal.png",
    alt: "Intraday Traders cash intraday signal",
    eyebrow: "CASH INTRADAY",
    title: "Cash Intraday Trade Recommendations",
    description:
      "Receive intraday stock recommendations with clear Entry, Targets, Stop-Loss, and follow-up updates.",
  },
  {
    src: "/images/login-carousel/idt-future-intraday-signal.png",
    alt: "Intraday Traders stock futures signal",
    eyebrow: "STOCK FUTURES",
    title: "Stock Futures Trade Recommendations",
    description:
      "Explore futures trading opportunities with defined Entry, Targets, Stop-Loss, and timely updates.",
  },
];

function LoginPagePreview({
  onOtpSent,
  notify,
  showOfferTimer = true,
  compactMobile = false,
}) {
  const dispatch = useDispatch();
  const savedMobileNumber = useSelector(selectUapiAuth).mobileNumber;
  const [mobileNumber, setMobileNumber] = useState(
    String(savedMobileNumber ?? ""),
  );
  const [loadingChannel, setLoadingChannel] = useState("");
  const loading = Boolean(loadingChannel);
  const [mobileError, setMobileError] = useState("");
  const startsWithZero = mobileNumber.startsWith("0");
  const handleSubmit = async (event, otpVia = "text") => {
    event.preventDefault();
    if (loading) return;
    if (!isValidMobileNumber(mobileNumber)) {
      setMobileError(
        startsWithZero
          ? "Mobile number must not start with 0."
          : "Enter a valid 10-digit mobile number.",
      );
      return;
    }
    setMobileError("");
    setLoadingChannel(otpVia);
    const payload = {
      countryCode: "+91",
      mobile: mobileNumber,
      otpVia,
      registeredVia: "web",
      source: getSource(),
    };
    dispatch(setUapiCredentials({ token: null, user: null }));
    dispatch(setEapiCredentials({ token: null, user: null }));
    try {
      const response = await api.uapi.login(payload);
      assertSuccessfulResponse(
        response,
        "Unable to send OTP. Please check your mobile number and try again.",
      );
      dispatch(setUapiMobileNumber(mobileNumber));
      dispatch(setUapiOtpVia(otpVia));
      dispatch(setUapiLoginResponse(response));
      notify("success", response?.message || "OTP sent successfully");
      onOtpSent();
    } catch (requestError) {
      dispatch(setUapiCredentials({ token: null, user: null }));
      dispatch(setUapiLoginResponse(null));
      dispatch(setEapiCredentials({ token: null, user: null }));
      const message =
        requestError.message ||
        "Unable to send OTP. Please check your mobile number and try again.";
      notify("error", message);
    } finally {
      setLoadingChannel("");
    }
  };
  return (
    <main
      // className={`container-fluid bg-white flex-grow-1 p-0 ${compactMobile ? "login-idt-compact" : ""}`}
      className={`container-fluid bg-body-tertiary p-0`}
      id="main-content"
    >
      <div className="row align-items-center justify-content-center g-0 vh-100">
        <div
          className="d-none login-preview-carousel-side col-12 col-lg-6 order-2 order-lg-1 mt-5 mt-md-0"
          style={{
            height: "100vh",
            backgroundColor: "#f3f4f6",
            boxShadow: "inset -1px 0 0 rgba(15, 23, 42, 0.08)",
          }}
        >
          <div
            id="loginPreviewCarousel"
            className="carousel slide h-100"
            data-bs-ride="carousel"
            data-bs-interval="4000"
          >
            <div className="carousel-indicators mb-3">
              {LOGIN_SLIDES.map((slide, index) => (
                <button
                  key={slide.src}
                  type="button"
                  data-bs-target="#loginPreviewCarousel"
                  data-bs-slide-to={index}
                  className={index === 0 ? "active bg-warning" : "bg-warning"}
                  aria-current={index === 0 ? "true" : undefined}
                  aria-label={`Slide ${index + 1}`}
                />
              ))}
            </div>
            <div className="carousel-inner overflow-hidden h-100">
              {LOGIN_SLIDES.map((slide, index) => (
                <div
                  className={`carousel-item h-100 bg-body-tertiary ${index === 0 ? "active" : ""}`}
                  key={slide.src}
                >
                  <div className="login-preview-slide d-flex flex-column align-items-center h-100 px-4 px-xl-5 pt-4 pt-xl-5 text-center">
                    <img
                      src={slide.src}
                      className="login-preview-slide-image d-none d-lg-block img-fluid mb-4"
                      alt={slide.alt}
                      style={{
                        width: index === 0 ? "82%" : "68%",
                        height: "60%",
                        objectFit: "contain",
                        objectPosition: "center bottom",
                        mixBlendMode: "multiply",
                      }}
                    />
                    <div
                      className="login-preview-slide-copy position-relative z-1"
                      style={{ maxWidth: "560px" }}
                    >
                      <span
                        className="badge rounded-pill px-3 py-2 mb-3 d-none"
                        style={{
                          background:
                            "linear-gradient(180deg, #FE7902 0%, #F6530B 100%)",
                        }}
                      >
                        {slide.eyebrow}
                      </span>
                      <h2 className="fw-bold text-body-emphasis mb-2">
                        {slide.title}
                      </h2>
                      <p className="text-body-secondary mb-3">
                        {slide.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="login-preview-form-side col-12  col-lg-6 order-1 order-lg-2 d-flex flex-column align-items-center justify-content-center px-3 py-3 py-lg-0"
          style={{ minHeight: "100vh" }}
        >
          <div
            className="login-preview-form-content bg-body p-3 shadow-sm rounded-3 w-100 mx-auto my-lg-auto"
            style={{ maxWidth: "404px" }}
          >
            <div className="login-preview-brand py-3 mb-4 text-center">
              <img
                className="img-fluid"
                src="/ep-analyst-logo.svg"
                alt="Intraday Traders by EquityPandit"
                style={{ width: "210px" }}
              />
            </div>

            <form
              onSubmit={handleSubmit}
              noValidate
              className="mb-5"
              aria-labelledby="login-preview-title"
            >
              <label
                className=" form-label text-body-emphasis fw-semibold "
                htmlFor="login-preview-mobile"
              >
                {/* Enter Your <br/>
                 <span style={{
                    background:
                      "linear-gradient(180deg, #FE7902 0%, #F6530B 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}>Mobile Number</span> */}
                Enter Your Mobile Number
              </label>
              {/* <p className="text-body-secondary">
                We will send a 4-digit OTP for secure verification.
              </p> */}
              <div className="input-group mb-2">
                <span className="input-group-text bg-white px-3 rounded-start-3">
                  <i
                    className="bi bi-phone text-secondary"
                    aria-hidden="true"
                  />
                  <span className="ms-2 text-secondary">+91</span>
                </span>
                <input
                  className={`form-control form-control-lg rounded-end-3 ${startsWithZero ? "is-invalid" : ""}`}
                  id="login-preview-mobile"
                  autoFocus
                  inputMode="numeric"
                  type="tel"
                  // placeholder="XXXXXXXXXX"
                  pattern="[1-9][0-9]{9}"
                  title="Mobile number must not start with 0"
                  maxLength="10"
                  value={mobileNumber}
                  onChange={(event) => {
                    setMobileNumber(event.target.value.replace(/\D/g, ""));
                    setMobileError("");
                  }}
                  aria-describedby={
                    startsWithZero || mobileError
                      ? "login-preview-error"
                      : undefined
                  }
                  aria-invalid={startsWithZero || Boolean(mobileError)}
                  autoComplete="tel-national"
                  required
                />
              </div>
              {(startsWithZero || mobileError) && (
                <p className="small text-danger mb-2" id="login-preview-error">
                  {startsWithZero
                    ? "Mobile number must not start with 0."
                    : mobileError}
                </p>
              )}

              <small className="text-secondary">
                <small>
                  By logging in, you agree to our{" "}
                  <a
                    className="text-decoration-none"
                    href="https://equitypandit.in/terms-conditions"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Terms & Conditions
                  </a>
                  .
                </small>
              </small>
              {/* <div className="mt-3 text-body-secondary">Get OTP on</div> */}
              <div className="d-flex gap-2 my-2">
                {[
                  // ["text", "Via SMS", "bi-chat-left-text"],
                  ["text", "Send OTP", "bi-chat-left-text"],
                  // ["whatsapp", "Via WhatsApp", "bi-whatsapp"],
                ].map(([channel, label, icon]) => (
                  <button
                    key={channel}
                    className="btn btn-warning fw-semibold flex-fill rounded-3"
                    type="button"
                    disabled={loading}
                    style={{ minHeight: "47px" }}
                    onClick={(event) => handleSubmit(event, channel)}
                  >
                    {loadingChannel === channel ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          aria-hidden="true"
                        />
                        Sending...
                      </>
                    ) : (
                      <>
                        {/* <i className={`bi ${icon} me-2`} aria-hidden="true" /> */}
                        {label}
                      </>
                    )}
                  </button>
                ))}
              </div>
              {showOfferTimer && <OfferCountdown contained />}
            </form>
            <div className=" d-block mb-2 mt-4">
              <AuthTrustBar />
            </div>

            <div className="col-12 order-2">
              <div
                id="loginPreviewCarousel"
                className="carousel slide"
                data-bs-ride="carousel"
                data-bs-interval="4000"
              >
                <div className="carousel-inner">
                  {LOGIN_SLIDES.map((slide, index) => (
                    <div
                      key={slide.src}
                      className={`carousel-item ${index === 0 ? "active" : ""}`}
                    >
                      <div className="d-flex flex-column align-items-center justify-content-center text-center p-2">
                        {/* <span
                          className="badge rounded-pill px-2 py-1 mb-2"
                          style={{
                            background:
                              "linear-gradient(180deg, #FE7902 0%, #F6530B 100%)",
                          }}
                        >
                          {slide.eyebrow}
                        </span> */}
                        <h6 className="fw-bold fs-6 text-body-emphasis mb-1">
                          {slide.title}
                        </h6>

                        <small className="text-body-secondary mb-0">
                          {slide.description}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Indicators */}
                <div className="d-flex justify-content-center gap-2 mt-2">
                  {LOGIN_SLIDES.map((slide, index) => (
                    <button
                      key={slide.src}
                      type="button"
                      data-bs-target="#loginPreviewCarousel"
                      data-bs-slide-to={index}
                      className={`rounded-pill border-0`}
                      style={{
                        width: 20,
                        height: 5,
                        backgroundColor: "#FE7902",
                        cursor: "pointer",
                      }}
                      aria-label={`Slide ${index + 1}`}
                      aria-current={index === 0 ? "true" : undefined}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <footer className="text-start border-top py-1 d-none">
            {/* <p className="text-body-secondary small mb-0">
              SEBI Registrated Reasearch Analyst : <img
                              className="img-fluid"
                              src="/ep-advisor-logo.svg"
                              alt="EquityPandit SEBI Registered Research Analyst"
                              style={{ width: "200px", maxWidth: "65%" }}
                            />
            </p> */}
            <p className="text-body-secondary text-center small mb-1">
              SEBI Registrated Analyst : Equitypandit Financial Services Pvt.
              Ltd.
            </p>
            <p className="text-body-secondary text-center small mb-1">
              SEBI Registration Number: INH000029829
            </p>
          </footer>
        </div>
      </div>
    </main>
  );
}
export default LoginPagePreview;
