import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AuthPageLayout from "../components/AuthPageLayout.jsx";
import OfferCountdown from "../components/OfferCountdown.jsx";
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

function LoginPage({ onOtpSent, notify }) {
  const dispatch = useDispatch();
  const savedMobileNumber = useSelector(selectUapiAuth).mobileNumber;
  const [mobileNumber, setMobileNumber] = useState(
    String(savedMobileNumber ?? ""),
  );
  const [loadingChannel, setLoadingChannel] = useState("");
  const loading = Boolean(loadingChannel);
  const startsWithZero = mobileNumber.startsWith("0");

  const handleSubmit = async (event, otpVia = "text") => {
    event.preventDefault();
    if (loading || !isValidMobileNumber(mobileNumber)) return;

    setLoadingChannel(otpVia);

    const payload = {
      countryCode: "+91",
      // mobile: Number(mobileNumber),
      mobile: mobileNumber,
      otpVia,
      registeredVia: "web",
      source: getSource(),
      // referredBy: 'UMPNVA',
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
    // <AuthPageLayout icon="bi-phone" labelledBy="login-title">
    <AuthPageLayout labelledBy="login-title" promotionalHeader showAdvisorLogo>
      <h6 className="fw-normal mb-3" id="login-title">
        Enter your mobile number
      </h6>
      {/* <p className="text-secondary mb-4">We’ll send you an OTP to verify your number</p> */}
      <form onSubmit={handleSubmit} noValidate>
        {/* <label className="form-label fw-semibold" htmlFor="login-mobile">Mobile number</label> */}
        <div className="input-group mb-3">
          <span className="input-group-text">+91</span>
          <input
            className={`form-control form-control-lg ${startsWithZero ? "is-invalid" : ""}`}
            id="login-mobile"
            autoFocus
            inputMode="numeric"
            type="tel"
            // placeholder="Enter your mobile number"
            pattern="[1-9][0-9]{9}"
            title="Mobile number must not start with 0"
            maxLength="10"
            value={mobileNumber}
            onChange={(event) => {
              setMobileNumber(event.target.value.replace(/\D/g, ""));
            }}
            aria-describedby={
              startsWithZero ? "mobile-help mobile-error" : "mobile-help"
            }
            aria-invalid={startsWithZero}
            autoComplete="tel-national"
            required
          />
        </div>
        {startsWithZero && (
          <p className="small text-danger mb-2" id="mobile-error">
            Mobile number must not start with 0.
          </p>
        )}
        {/* <p className="small text-secondary mb-4" id="mobile-help">Use your 10-digit mobile number to continue.</p> */}
        <div className="d-flex gap-2">
          {[
            ["text", "Via Text", "bi-chat-left-text"],
            ["whatsapp", "Via WhatsApp", "bi-whatsapp"],
          ].map(([channel, label, icon]) => (
            <button
              key={channel}
              className="btn btn-warning fw-semibold py-2 px-3 flex-fill"
              type="button"
              disabled={mobileNumber.length !== 10 || startsWithZero || loading}
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
                  <i className={`bi ${icon} me-2`} aria-hidden="true" />
                  {label}
                </>
              )}
            </button>
          ))}
        </div>
        <p className="text-secondary small text-center mb-0 mt-3">
          By logging in, you agree to our{" "}
          <a
            className="text-decoration-none"
            href="https://equitypandit.in/terms-conditions"
            target="_blank"
          >
            Terms & Conditions.
          </a>
        </p>
        <OfferCountdown />
      </form>
    </AuthPageLayout>
  );
}

export default LoginPage;
