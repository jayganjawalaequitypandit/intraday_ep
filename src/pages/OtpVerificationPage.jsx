import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AuthPageLayout, { AuthTrustBar } from "../components/AuthPageLayout.jsx";
import OfferCountdown from "../components/OfferCountdown.jsx";
import { LOGIN_SLIDES } from "./LoginPagePreview.jsx";
import api from "../services/api.js";
import {
  setEapiCredentials,
  setEapiLoginResponse,
} from "../store/eapiAuthSlice.js";
import {
  selectUapiAuth,
  setUapiCredentials,
  setUapiLoginResponse,
} from "../store/uapiAuthSlice.js";
import { trackMetaEvent } from "../utils/metaPixel.js";
import { ANALYTICS_EVENTS, trackAnalyticsEvent } from "../utils/analytics.js";
import {
  assertSuccessfulResponse,
  createEapiRegistration,
  extractAuthData,
  isNewOrIncompleteUser,
  isValidMobileNumber,
} from "../utils/authResponse.js";

const RESEND_COOLDOWN_SECONDS = 15;

function OtpVerificationPage({
  onBack,
  onDetailsRequired,
  onComplete,
  notify,
  variant = "default",
}) {
  const dispatch = useDispatch();
  const { mobileNumber, otpVia = "text" } = useSelector(selectUapiAuth);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(RESEND_COOLDOWN_SECONDS);
  const otpInputRef = useRef(null);

  useEffect(() => {
    otpInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (resendSeconds <= 0) return undefined;

    const timerId = window.setInterval(() => {
      setResendSeconds((seconds) => Math.max(seconds - 1, 0));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [resendSeconds]);

  const updateOtp = (value) => setOtp(value.replace(/\D/g, "").slice(0, 4));

  const maskedMobile = mobileNumber
    ? `${mobileNumber.slice(0, 2)}••••••${mobileNumber.slice(-2)}`
    : "••••••••••";

  const formattedResendTime = `${String(Math.floor(resendSeconds / 60)).padStart(2, "0")}:${String(resendSeconds % 60).padStart(2, "0")}`;

  const handleResend = async () => {
    if (!isValidMobileNumber(mobileNumber)) {
      onBack();
      return;
    }
    if (resending || resendSeconds > 0) return;
    setResending(true);

    try {
      const response = await api.uapi.resendOtp({
        countryCode: "+91",
        mobile: Number(mobileNumber),
        otpVia,
      });
      assertSuccessfulResponse(
        response,
        "Unable to resend OTP. Please try again.",
      );
      setOtp("");
      setResendSeconds(RESEND_COOLDOWN_SECONDS);
      otpInputRef.current?.focus();
      notify("success", response?.message || "OTP resent successfully");
    } catch (error) {
      notify(
        "error",
        error.message || "Unable to resend OTP. Please try again.",
      );
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async (event) => {
    event?.preventDefault();
    if (!isValidMobileNumber(mobileNumber)) {
      onBack();
      return;
    }
    if (loading) return;
    if (!/^\d{4}$/.test(otp)) {
      notify("error", "Please enter a valid 4-digit OTP.");
      otpInputRef.current?.focus();
      return;
    }
    setLoading(true);
    dispatch(setUapiCredentials({ user: null, token: null }));
    dispatch(setEapiCredentials({ user: null, token: null }));

    try {
      const response = await api.uapi.verifyOtp({
        countryCode: "+91",
        mobile: Number(mobileNumber),
        otp: Number(otp),
      });

      assertSuccessfulResponse(
        response,
        "OTP verification failed. Please try again.",
      );
      const uapiAuth = extractAuthData(response);
      // if (!uapiAuth.token) {
      //   throw new Error('OTP verification failed because no authentication token was returned. Please resend the OTP and try again.')
      // }

      if (isNewOrIncompleteUser(response, uapiAuth.user)) {
        dispatch(setUapiLoginResponse(response));
        dispatch(
          setUapiCredentials({
            user: uapiAuth.user,
            token: uapiAuth.token,
            refreshToken: uapiAuth.refreshToken,
          }),
        );
        notify("success", "Mobile number verified successfully");
        onDetailsRequired();
        return;
      }

      const registrationResponse = await api.eapi.register(
        createEapiRegistration(uapiAuth.user, mobileNumber),
      );
      assertSuccessfulResponse(
        registrationResponse,
        "Unable to complete login. Please resend the OTP and try again.",
      );
      const eapiAuth = extractAuthData(registrationResponse);
      // console.log(registrationResponse);
      if (
        !eapiAuth.token &&
        !eapiAuth?.user?.email &&
        !eapiAuth?.user?.firstName
      ) {
        dispatch(setUapiLoginResponse(response));
        dispatch(
          setUapiCredentials({
            user: uapiAuth.user,
            token: uapiAuth.token,
            refreshToken: uapiAuth.refreshToken,
          }),
        );
        dispatch(setEapiLoginResponse(registrationResponse));
        notify(
          "success",
          "Mobile number verified. Please complete your profile details.",
        );
        onDetailsRequired();
        return;
      }
      dispatch(setUapiLoginResponse(response));
      dispatch(
        setUapiCredentials({
          user: uapiAuth.user,
          token: uapiAuth.token,
          refreshToken: uapiAuth.refreshToken,
        }),
      );
      dispatch(setEapiLoginResponse(registrationResponse));
      dispatch(
        setEapiCredentials({
          user: eapiAuth.user || uapiAuth.user,
          token: eapiAuth.token,
          refreshToken: eapiAuth.refreshToken,
        }),
      );
      notify("success", "Logged in successfully");
      trackAnalyticsEvent(ANALYTICS_EVENTS.LOGIN);
      trackMetaEvent("CompleteRegistration", {
        content_name: "Intraday Traders OTP Login",
        status: true,
      });
      onComplete();
    } catch (error) {
      dispatch(setUapiLoginResponse(null));
      dispatch(setUapiCredentials({ user: null, token: null }));
      dispatch(setEapiLoginResponse(null));
      dispatch(setEapiCredentials({ user: null, token: null }));
      setOtp("");
      setResendSeconds(0);
      otpInputRef.current?.focus();
      notify(
        "error",
        error.message ||
          "OTP verification failed. Please try again or resend the OTP.",
      );
    } finally {
      setLoading(false);
    }
  };

  const otpForm = (
    <div className="mb-5">
      {/* <button
        className="btn btn-link d-inline-flex align-items-center gap-2 text-dark text-decoration-none fw-semibold p-0 mb-3"
        type="button"
        onClick={onBack}
        aria-label="Back to login"
      >
        <i className="bi bi-arrow-left fs-5" aria-hidden="true" />
        <span>Back to login</span>
      </button> */}
      <label
        className=" form-label text-body-emphasis mb-0 fw-semibold "
        htmlFor="login-preview-mobile"
      >
        Enter the OTP shared
      </label>
      <br />
      {/* <h5
        className={variant === "idt" ? "fw-semibold" : "fw-normal h6 mb-2"}
        id="otp-title"
      >
        Enter the OTP shared
      </h5> */}
      <small className="text-secondary mb-2">
        <small>
          OTP sent to <strong>+91 {maskedMobile}</strong>{" "}
          <button
            className="btn btn-link text-primary text-decoration-none p-0"
            type="button"
            onClick={onBack}
          >
            <i className="bi bi-pencil-square ms-1" aria-hidden="true" />
          </button>
        </small>
      </small>
      <form onSubmit={handleVerify}>
        <div className="my-2">
          <input
            ref={otpInputRef}
            className="form-control form-control-lg rounded-end-3"
            autoFocus
            autoComplete="one-time-code"
            inputMode="numeric"
            maxLength="4"
            pattern="[0-9]{4}"
            required
            value={otp}
            onChange={(event) => updateOtp(event.target.value)}
            aria-label="4-digit OTP"
            aria-describedby="otp-help"
            placeholder=""
          />
          <small className="d-block text-secondary mt-2" id="otp-help">
            <small>
              {resendSeconds > 0 ? (
                <p className="text-secondary mb-0">
                  Resend OTP in <strong>{formattedResendTime}</strong>
                </p>
              ) : (
                <small
                  // >
                  //   <button
                  className="btn btn-link btn-xs text-primary text-decoration-none fw-semibold p-0"
                  type="button"
                  onClick={handleResend}
                  disabled={resending || !mobileNumber}
                >
                  {resending && (
                    <span
                      className="small spinner-border spinner-border-sm me-2"
                      aria-hidden="true"
                    />
                  )}
                  {resending ? "Resending OTP..." : "Resend OTP"}
                  {/* </button> */}
                </small>
              )}
            </small>
          </small>
        </div>
        <button
          className="btn btn-warning fw-semibold w-100 rounded-3"
          style={{ minHeight: "47px" }}
          type="submit"
          disabled={loading || otp.length !== 4}
        >
          {loading && (
            <span
              className="spinner-border spinner-border-sm me-2"
              aria-hidden="true"
            />
          )}
          {loading ? "Verifying..." : "Continue"}
        </button>
        {/* <div className="text-center mt-2" aria-live="polite">
          {resendSeconds > 0 ? (
            <p className="small text-secondary mb-0">Resend OTP in <strong>{formattedResendTime}</strong></p>
          ) : (
            <button className="btn btn-link text-primary text-decoration-none fw-semibold p-0" type="button" onClick={handleResend} disabled={resending || !mobileNumber}>
              {resending && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
              {resending ? 'Resending OTP...' : 'Resend OTP'}
            </button>
          )}
        </div> */}
        {/* <OfferCountdown contained={variant === 'idt'} /> */}
      </form>
    </div>
  );

  if (variant === "idt") {
    return (
      <main
        // className="login-idt-compact container-fluid bg-white flex-grow-1 p-0"
        className=" container-fluid bg-body-tertiary p-0"
        id="main-content"
      >
        <div className="row align-items-center justify-content-center g-0 vh-100">
          <div
            className="d-none login-preview-carousel-side col-12 col-lg-6 mt-5 mt-md-0 order-2 order-lg-1"
            style={{
              height: "100vh",
              backgroundColor: "#f3f4f6",
              boxShadow: "inset -1px 0 0 rgba(15, 23, 42, 0.08)",
            }}
          >
            <div
              id="otpPreviewCarousel"
              className="carousel slide h-100"
              data-bs-ride="carousel"
              data-bs-interval="4000"
            >
              <div className="carousel-indicators mb-3">
                {LOGIN_SLIDES.map((slide, index) => (
                  <button
                    key={slide.src}
                    type="button"
                    data-bs-target="#otpPreviewCarousel"
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
                    className={`carousel-item h-100 ${index === 0 ? "active" : ""}`}
                    key={slide.src}
                    style={{ backgroundColor: "#f3f4f6" }}
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
                        {/* <span
                          className="badge rounded-pill px-3 py-2 mb-3"
                          style={{
                            background:
                              "linear-gradient(180deg, #FE7902 0%, #F6530B 100%)",
                          }}
                        >
                          {slide.eyebrow}
                        </span> */}
                        <h2 className="fw-bold text-body-emphasis mb-2">
                          {slide.title}
                        </h2>
                        <p className="text-body-secondary mb-3 small">
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
            className="login-preview-form-side col-12 col-lg-6 order-1 order-lg-2 d-flex flex-column align-items-center justify-content-center px-3 py-3 py-lg-0"
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
              {otpForm}
              <div className="login-preview-trust d-block my-3" >
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

  return (
    <AuthPageLayout labelledBy="otp-title" promotionalHeader showAdvisorLogo>
      {otpForm}
    </AuthPageLayout>
  );
}

export default OtpVerificationPage;
