import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useDispatch, useSelector } from "react-redux";
import api from "../services/api.js";
import {
  setEapiCredentials,
  setEapiLoginResponse,
} from "../store/eapiAuthSlice.js";
import {
  selectUapiAuth,
  setUapiCredentials,
  setUapiLoginResponse,
  updateUapiUser,
} from "../store/uapiAuthSlice.js";
import {
  createEapiRegistration,
  extractAuthData,
  getUserId,
  getUserName,
} from "../utils/authResponse.js";
import { trackMetaEvent } from "../utils/metaPixel.js";
import { ANALYTICS_EVENTS, trackAnalyticsEvent } from "../utils/analytics.js";

const states = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const termsConditionsUrl = "https://equitypandit.in/terms-conditions";

function readGoogleProfile(credential) {
  const encodedPayload = credential.split(".")[1];
  const normalizedPayload = encodedPayload
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const paddedPayload = normalizedPayload.padEnd(
    Math.ceil(normalizedPayload.length / 4) * 4,
    "=",
  );
  const bytes = Uint8Array.from(window.atob(paddedPayload), (character) =>
    character.charCodeAt(0),
  );
  return JSON.parse(new TextDecoder().decode(bytes));
}

function ProfileDetailsPage({ onComplete, notify }) {
  const dispatch = useDispatch();
  const {
    mobileNumber,
    user,
    token: uapiToken,
    loginResponse,
  } = useSelector(selectUapiAuth);
  const [fullName, setFullName] = useState(getUserName(user));
  const [email, setEmail] = useState(user?.email || "");
  const [state, setState] = useState(user?.state?.toLowerCase() || "");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [registerWith, setRegisterWith] = useState("manual");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const validationErrors = {
    fullName: fullName.trim() ? "" : "Full name is required.",
    email: !email.trim()
      ? "Email address is required."
      : emailPattern.test(email.trim())
        ? ""
        : "Enter a valid email address.",
    state: state ? "" : "Please select your state.",
    termsAccepted: termsAccepted
      ? ""
      : "You must accept the terms and conditions.",
  };
  const isFormValid = Object.values(validationErrors).every((error) => !error);
  const validationClass = (fieldName) =>
    submitted ? (validationErrors[fieldName] ? "is-invalid" : "is-valid") : "";

  const handleGoogleSuccess = (response) => {
    try {
      const googleProfile = readGoogleProfile(response.credential);
      const googleName =
        googleProfile.name ||
        [googleProfile.given_name, googleProfile.family_name]
          .filter(Boolean)
          .join(" ");

      if (!googleName || !googleProfile.email)
        throw new Error("Google did not return a name and email address");

      setFullName(googleName);
      setEmail(googleProfile.email);
      setRegisterWith("google");
      dispatch(
        updateUapiUser({ firstName: googleName, email: googleProfile.email }),
      );
      notify("success", "Google profile details added");
    } catch (error) {
      notify("error", error.message || "Unable to read your Google profile");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);

    if (!isFormValid) {
      return;
    }

    const verifiedMobileNumber =
      mobileNumber || user?.mobile || user?.mobileNumber;
    if (!verifiedMobileNumber) {
      notify("error", "Mobile number is missing. Please log in again.");
      return;
    }

    const userId = getUserId(user) || getUserId(loginResponse);
    if (!userId) {
      notify("error", "User ID is missing. Please verify your OTP again.");
      return;
    }

    const completedUser = {
      ...user,
      firstName: fullName.trim(),
      email: email.trim(),
      state,
    };
    setLoading(true);

    try {
      const updateResponse = await api.uapi.updateById(userId, {
        firstName: completedUser.firstName,
        email: completedUser.email,
        state,
        isTermAndConditionAccepted: 1,
        registerWith,
      });
      const updatedUapiAuth = extractAuthData(updateResponse);
      dispatch(updateUapiUser(completedUser));
      dispatch(setUapiLoginResponse(updateResponse));
      dispatch(
        setUapiCredentials({
          user: updatedUapiAuth.user || completedUser,
          token: updatedUapiAuth.token || uapiToken,
          ...(updatedUapiAuth.refreshToken ? { refreshToken: updatedUapiAuth.refreshToken } : {}),
        }),
      );

      const registerResponse = await api.eapi.register(
        createEapiRegistration(completedUser, verifiedMobileNumber),
      );
      const eapiAuth = extractAuthData(registerResponse);
      console.log(registerResponse);
      dispatch(setEapiLoginResponse(registerResponse));
      dispatch(
        setEapiCredentials({
          user: eapiAuth.user || completedUser,
          token: eapiAuth.token,
          refreshToken: eapiAuth.refreshToken,
        }),
      );
      notify(
        "success",
        "Profile completed. Check your email for the verification link.",
      );
      trackMetaEvent("CompleteRegistration", {
        content_name: "Intraday Traders Registration",
        status: true,
      });
      trackAnalyticsEvent(ANALYTICS_EVENTS.REGISTRATION);
      onComplete();
    } catch (error) {
      notify("error", error.message || "Unable to complete your profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="container flex-grow-1 py-4 py-md-5"
      id="main-content"
    >
      <div className="row justify-content-center w-100 mx-0">
        <div className="col-12 col-md-4">
          <section
            className="card border rounded-4 shadow-sm"
            aria-labelledby="profile-details-title"
          >
            <div className="card-body p-4 ">
              {/* <div className="d-inline-flex align-items-center justify-content-center rounded-4 border border-warning-subtle bg-warning-subtle text-warning-emphasis fs-4 p-3 mb-4" aria-hidden="true">
                <i className="bi bi-person-plus" />
              </div> */}
              <h2 className=" fs-6 text-center fw-bold mb-2" id="profile-details-title">
                Complete your profile
              </h2>
              {/* <h2 className="h4 fw-bold mb-4">Enter your details</h2> */}
              <div className="d-flex justify-content-center my-3 overflow-hidden ">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() =>
                    notify("error", "Google sign-in was not completed")
                  }
                  type="standard"
                  theme="outline"
                  text="continue_with"
                  shape="rectangular"
                  size="large"
                  logo_alignment="left"
                  width="300"
                />
              </div>
              <div className="d-flex align-items-center gap-2 my-3">
                <hr className="flex-grow-1" />
                <span className="small text-secondary text-nowrap">
                  or Enter Mannualy{" "}
                </span>
                <hr className="flex-grow-1" />
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label
                    className="form-label text-muted"
                    htmlFor="profile-name"
                  >
                    Full name
                  </label>
                  <input
                    className={`form-control ${validationClass("fullName")}`}
                    id="profile-name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    autoComplete="name"
                    maxLength="80"
                    aria-describedby="profile-name-error"
                    required
                  />
                  <div className="invalid-feedback" id="profile-name-error">
                    {validationErrors.fullName}
                  </div>
                </div>
                <div className="mb-3">
                  <label
                    className="form-label text-muted"
                    htmlFor="profile-email"
                  >
                    Email address
                  </label>
                  <input
                    className={`form-control ${validationClass("email")}`}
                    id="profile-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    inputMode="email"
                    pattern="[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}"
                    aria-describedby="profile-email-error"
                    required
                  />
                  <div className="invalid-feedback" id="profile-email-error">
                    {validationErrors.email}
                  </div>
                </div>
                <div className="mb-3">
                  <label
                    className="form-label text-muted"
                    htmlFor="profile-state"
                  >
                    State
                  </label>
                  <select
                    className={`form-select ${validationClass("state")}`}
                    id="profile-state"
                    value={state}
                    onChange={(event) => setState(event.target.value)}
                    aria-describedby="profile-state-error"
                    required
                  >
                    <option value=""></option>
                    {states.map((stateName) => (
                      <option key={stateName} value={stateName.toLowerCase()}>
                        {stateName}
                      </option>
                    ))}
                  </select>
                  <div className="invalid-feedback" id="profile-state-error">
                    {validationErrors.state}
                  </div>
                </div>
                <div className="form-check mb-4">
                  <input
                    className={`form-check-input ${validationClass("termsAccepted")}`}
                    id="profile-terms"
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(event) => setTermsAccepted(event.target.checked)}
                    aria-describedby="profile-terms-error"
                    required
                  />
                  <label
                    className="form-check-label small"
                    htmlFor="profile-terms"
                  >
                    I accept the{" "}
                    <a
                      className="fw-bold text-dark"
                      href={termsConditionsUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      terms and conditions
                    </a>
                    .
                  </label>
                  <div className="invalid-feedback" id="profile-terms-error">
                    {validationErrors.termsAccepted}
                  </div>
                </div>
                <button
                  className="btn btn-warning fw-semibold px-4 py-3 w-100"
                  type="submit"
                  disabled={loading}
                >
                  {loading && (
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      aria-hidden="true"
                    />
                  )}
                  {loading ? "Saving..." : "Continue"}
                  {!loading && (
                    <i className="bi bi-arrow-right ms-2" aria-hidden="true" />
                  )}
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default ProfileDetailsPage;
