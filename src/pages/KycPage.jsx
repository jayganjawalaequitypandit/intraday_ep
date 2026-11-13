import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import api from "../services/api.js";
import { selectEapiAuth } from "../store/eapiAuthSlice.js";
import { selectUapiAuth } from "../store/uapiAuthSlice.js";
import { getUserId, getUserName } from "../utils/authResponse.js";
import { trackMetaCustomEvent } from "../utils/metaPixel.js";
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

const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const mobilePattern = /^[6-9][0-9]{9}$/;
const datePattern = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const formatLocalDate = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const getDobBounds = () => {
  const today = new Date();
  const birthdayCutoff = (age) => {
    const year = today.getFullYear() - age;
    const month = today.getMonth();
    const day = Math.min(today.getDate(), new Date(year, month + 1, 0).getDate());
    return new Date(year, month, day);
  };
  const oldest = birthdayCutoff(96);
  oldest.setDate(oldest.getDate() + 1);
  return { minDob: formatLocalDate(oldest), maxDob: formatLocalDate(birthdayCutoff(18)) };
};
const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const payloadOf = (response) =>
  response?.data?.data ?? response?.data ?? response ?? null;
const dateValue = (value) => String(value || "").slice(0, 10);
const stateValue = (value) => {
  const normalizedValue = String(value || "").trim().toLowerCase();
  return states.find((stateName) => stateName.toLowerCase() === normalizedValue) || "";
};

function kycIsComplete(source) {
  if (!source || typeof source !== "object") return false;
  const values = [
    source.kycComplete,
    source.isKycComplete,
    source.isKycCompleted,
    source.isVerified,
    source.verified,
    source.kycStatus,
    source.status,
  ];
  if (values.some((value) => value === true || value === 1)) return true;
  if (
    values.some(
      (value) =>
        typeof value === "string" &&
        ["complete", "completed", "approved", "verified"].includes(
          value.toLowerCase(),
        ),
    )
  )
    return true;
  return Object.values(source).some(
    (value) => value && typeof value === "object" && kycIsComplete(value),
  );
}

function KycPage({ onComplete, notify }) {
  const eapiAuth = useSelector(selectEapiAuth);
  const uapiAuth = useSelector(selectUapiAuth);
  const [pan, setPan] = useState("");
  const [fullName, setFullName] = useState(
    getUserName(eapiAuth.user) || getUserName(uapiAuth.user),
  );
  const [email, setEmail] = useState(
    eapiAuth.user?.email || uapiAuth.user?.email || "",
  );
  const [mobile, setMobile] = useState(
    String(
      eapiAuth.user?.mobile ||
        uapiAuth.mobileNumber ||
        uapiAuth.user?.mobile ||
        "",
    ),
  );
  const [dateOfBirth, setDateOfBirth] = useState(
    dateValue(
      eapiAuth.user?.dob || uapiAuth.user?.dob || uapiAuth.user?.dateOfBirth,
    ),
  );
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState(
    stateValue(eapiAuth.user?.state || uapiAuth.user?.state),
  );
  const [country, setCountry] = useState("India");
  const [manualEntryRequired, setManualEntryRequired] = useState(false);
  const [panInfoOpen, setPanInfoOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [requestId, setRequestId] = useState(null);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef([]);
  const epUserId =
    getUserId(eapiAuth.user) || getUserId(eapiAuth.loginResponse);

  const { minDob, maxDob } = getDobBounds();
  const parsedDob = new Date(`${dateOfBirth}T00:00:00`);
  const errors = {
    pan: !pan
      ? "PAN card number is required."
      : panPattern.test(pan)
        ? ""
        : "Enter a valid PAN card number.",
    mobile: !mobile
      ? "Mobile number is required."
      : mobilePattern.test(mobile)
        ? ""
        : "Enter a valid 10-digit Indian mobile number.",
    dateOfBirth: !dateOfBirth
      ? "Date of birth is required."
      : !datePattern.test(dateOfBirth) ||
          Number.isNaN(parsedDob.getTime()) ||
          formatLocalDate(parsedDob) !== dateOfBirth
        ? "Enter a valid date of birth."
        : dateOfBirth < minDob || dateOfBirth > maxDob
          ? "You must be between 18 and 95 years old."
          : "",
    fullName: !manualEntryRequired || fullName.trim() ? "" : "Full name is required.",
    email: !manualEntryRequired
      ? ""
      : !email.trim()
        ? "Email address is required."
        : emailPattern.test(email.trim())
          ? ""
          : "Enter a valid email address.",
    address: !manualEntryRequired || address.trim() ? "" : "Address is required.",
    city: !manualEntryRequired || city.trim() ? "" : "City is required.",
    state: !manualEntryRequired || state ? "" : "State is required.",
    country: !manualEntryRequired || country.trim() ? "" : "Country is required.",
  };
  const valid = Object.values(errors).every((error) => !error);
  const fieldClass = (name) =>
    submitted ? (errors[name] ? "is-invalid" : "is-valid") : "";

  const checkKyc = async (showPendingMessage = false) => {
    if (!epUserId) {
      if (showPendingMessage)
        notify("error", "EP user ID is missing. Please log in again.");
      return false;
    }
    try {
      const response = await api.eapi.getKycByUserId(epUserId);
      const payload = payloadOf(response);
      setPan(
        String(
          payload?.pan || payload?.panNumber || payload?.panCardNumber || "",
        ).toUpperCase(),
      );
      setMobile(String(payload?.mobile || mobile));
      setDateOfBirth(
        dateValue(payload?.dob || payload?.dateOfBirth || dateOfBirth),
      );
      setFullName(
        String(
          payload?.name ||
            payload?.fullName ||
            getUserName(eapiAuth.user) ||
            getUserName(uapiAuth.user) ||
            fullName,
        ),
      );
      setEmail(String(payload?.email || eapiAuth.user?.email || uapiAuth.user?.email || email));
      setAddress(String(payload?.address || payload?.addressLine1 || address));
      setCity(String(payload?.city || city));
      setState(stateValue(payload?.state || payload?.stateName || state));
      setCountry(String(payload?.country || country || "India"));
      if (kycIsComplete(payload)) {
        onComplete();
        return true;
      }
      if (showPendingMessage)
        notify("error", "Your KYC is pending. Please complete it to continue.");
    } catch (error) {
      if (error.status !== 404)
        notify("error", error.message || "Unable to check KYC status");
    }
    return false;
  };

  useEffect(() => {
    let active = true;
    const runCheck = async () => {
      await checkKyc(false);
      if (active) setLoading(false);
    };
    runCheck();
    return () => {
      active = false;
    };
    // The KYC status is checked once when this route opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (checking) return;
    if (otpSent) {
      await handleOtpVerify();
      return;
    }
    setSubmitted(true);
    if (!valid) {
      notify("error", "Please correct the highlighted fields");
      return;
    }
    setChecking(true);
    const formattedDob = dateOfBirth.replace(/-/g, "/");
    if (manualEntryRequired) {
      if (!valid) {
        notify("error", "Please complete the manual KYC details");
        setChecking(false);
        return;
      }

      try {
        if (!epUserId)
          throw new Error("EP user ID is missing. Please log in again.");
        await api.eapi.saveKyc({
          userId: Number(epUserId) || epUserId,
          isCompleted: false,
          name: fullName.trim(),
          email: email.trim(),
          pan,
          mobile,
          dob: formattedDob,
          address: address.trim(),
          city: city.trim(),
          state,
          country: country.trim(),
        });
        trackMetaCustomEvent("KYCCompleted", { method: "manual" });
        trackAnalyticsEvent(ANALYTICS_EVENTS.KYC_COMPLETE);
        notify("success", "KYC details saved successfully");
        onComplete();
      } catch (error) {
        notify("error", error.message || "Unable to save KYC details");
      } finally {
        setChecking(false);
      }
      return;
    }

    try {
      const response = await api.eapi.sendKycOtp({ pan, mobile });
      const payload = payloadOf(response);
      const sentRequestId = payload?.request_id ?? payload?.requestId;
      if (!sentRequestId) {
        notify("error", "OTP request ID is missing. Please try again.");
        return;
      }
      setRequestId(sentRequestId);
      setOtpSent(true);
      trackMetaCustomEvent("KYCInitiated", { method: "otp" });
      notify("success", response?.message || "OTP sent successfully");
      window.setTimeout(() => otpRefs.current[0]?.focus(), 0);
    } catch {
      try {
        await api.eapi.fetchKyc({ pan, dob: formattedDob });
        trackAnalyticsEvent(ANALYTICS_EVENTS.KYC_COMPLETE);
        notify("success", "KYC fetched successfully");
        onComplete();
      } catch {
        setManualEntryRequired(true);
        notify(
          "warning",
          "We couldn't fetch your KYC details. Please enter them manually.",
        );
      }
    } finally {
      setChecking(false);
    }
  };

  const updateOtp = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const nextOtp = [...otp];
    nextOtp[index] = digit;
    setOtp(nextOtp);
    if (digit && index < otp.length - 1) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpBackspace = (event, index) => {
    if (event.key !== "Backspace") return;
    if (otp[index]) return;
    if (index > 0) {
      const nextOtp = [...otp];
      nextOtp[index - 1] = "";
      setOtp(nextOtp);
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpVerify = async () => {
    if (checking) return;
    if (!/^\d{6}$/.test(otp.join(""))) {
      notify("error", "Please enter the complete 6-digit OTP.");
      return;
    }
    if (!epUserId || !requestId) {
      notify("error", "User ID or OTP request ID is missing. Please try again.");
      return;
    }
    setChecking(true);
    try {
      const response = await api.eapi.verifyKycOtp({
        userId: epUserId,
        request_id: requestId,
        otp: otp.join(""),
      });
      trackMetaCustomEvent("KYCCompleted", { method: "otp" });
      trackAnalyticsEvent(ANALYTICS_EVENTS.KYC_COMPLETE);
      notify("success", response?.message || "KYC OTP verified successfully");
      onComplete();
    } catch (error) {
      notify("error", error.message || "Unable to verify KYC OTP");
    } finally {
      setChecking(false);
    }
  };

  const closePanInfo = () => setPanInfoOpen(false);

  if (loading)
    return (
      <main className="container flex-grow-1 d-flex align-items-center justify-content-center py-4 py-md-5">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Checking KYC status</span>
        </div>
      </main>
    );

  return (
    <main
      className="container flex-grow-1 py-4 py-md-5"
      id="main-content"
    >
      <div className="row justify-content-center w-100 mx-0">
        <div className="col-12 col-lg-6">
          <section
            className="card border rounded-4 shadow-sm"
            aria-labelledby="kyc-title"
          >
            <div className="card-body p-4 ">
              <div className="d-inline-flex align-items-center justify-content-center rounded-4 border border-warning-subtle bg-warning-subtle text-warning-emphasis fs-4 p-3 mb-4" aria-hidden="true">
                <i className="bi bi-person-vcard" />
              </div>
              <h1 className="fs-2 fw-bold mb-2" id="kyc-title">
                Complete Your KYC
              </h1>
              {/* <p className="text-secondary mb-4">All fields are required.</p> */}
              <form onSubmit={handleSubmit} noValidate>
                {manualEntryRequired && (
                  <div className="alert alert-warning small" role="alert">
                    We couldn't fetch your KYC details. Please enter them
                    manually.
                  </div>
                )}
                <div className="mb-3">
                  <label
                    className="form-label text-muted d-flex align-items-center gap-2"
                    htmlFor="kyc-pan"
                  >
                    <span>PAN Card Number *</span>
                    <button
                      className="btn btn-link text-warning-emphasis p-0 lh-1"
                      type="button"
                      aria-label="Why PAN card is required"
                      onClick={() => setPanInfoOpen(true)}
                    >
                      <i className="bi bi-info-circle fs-6" aria-hidden="true" />
                    </button>
                  </label>
                  <input
                    className={`form-control text-uppercase ${fieldClass("pan")}`}
                    id="kyc-pan"
                    value={pan}
                    onChange={(event) =>
                      setPan(
                        event.target.value
                          .replace(/[^a-z0-9]/gi, "")
                          .toUpperCase()
                          .slice(0, 10),
                      )
                    }
                    pattern="[A-Z]{5}[0-9]{4}[A-Z]"
                    placeholder="ABCDE1234F"
                    title="Enter 5 letters, 4 digits, and 1 letter"
                    maxLength="10"
                    autoComplete="off"
                    aria-describedby="kyc-pan-error"
                    disabled={otpSent || checking}
                    required
                  />
                  <div className="invalid-feedback" id="kyc-pan-error">
                    {errors.pan}
                  </div>
                </div>
                <div className="mb-3">
                  <label
                    className="form-label text-muted"
                    htmlFor="kyc-mobile"
                  >
                    Mobile Number Linked With PAN Card*
                  </label>
                  <input
                    className={`form-control ${fieldClass("mobile")}`}
                    id="kyc-mobile"
                    inputMode="numeric"
                    value={mobile}
                    onChange={(event) =>
                      setMobile(
                        event.target.value.replace(/\D/g, "").slice(0, 10),
                      )
                    }
                    pattern="[6-9][0-9]{9}"
                    title="Enter a valid 10-digit Indian mobile number"
                    minLength="10"
                    maxLength="10"
                    autoComplete="tel-national"
                    aria-describedby="kyc-mobile-error"
                    disabled={otpSent || checking}
                    required
                  />
                  <div className="invalid-feedback" id="kyc-mobile-error">
                    {errors.mobile}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="form-label text-muted" htmlFor="kyc-dob">
                    Date Of Birth (dd/mm/yyyy) *
                  </label>
                  <input
                    className={`form-control ${fieldClass("dateOfBirth")}`}
                    id="kyc-dob"
                    type="date"
                    value={dateOfBirth}
                    onChange={(event) => setDateOfBirth(event.target.value)}
                    min={minDob}
                    max={maxDob}
                    aria-describedby="kyc-dob-error"
                    disabled={otpSent || checking}
                    required
                  />
                  <div className="invalid-feedback" id="kyc-dob-error">
                    {errors.dateOfBirth}
                  </div>
                </div>
                {manualEntryRequired && (
                  <>
                    <div className="mb-3">
                      <label className="form-label text-muted" htmlFor="kyc-name">
                        Full Name *
                      </label>
                      <input
                        className={`form-control ${fieldClass("fullName")}`}
                        id="kyc-name"
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        autoComplete="name"
                        maxLength="80"
                        aria-describedby="kyc-name-error"
                        disabled={checking}
                        required
                      />
                      <div className="invalid-feedback" id="kyc-name-error">
                        {errors.fullName}
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted" htmlFor="kyc-email">
                        Email Address *
                      </label>
                      <input
                        className={`form-control ${fieldClass("email")}`}
                        id="kyc-email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        autoComplete="email"
                        aria-describedby="kyc-email-error"
                        disabled={checking}
                        required
                      />
                      <div className="invalid-feedback" id="kyc-email-error">
                        {errors.email}
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted" htmlFor="kyc-address">
                        Address *
                      </label>
                      <textarea
                        className={`form-control ${fieldClass("address")}`}
                        id="kyc-address"
                        rows="2"
                        value={address}
                        onChange={(event) => setAddress(event.target.value)}
                        autoComplete="street-address"
                        aria-describedby="kyc-address-error"
                        disabled={checking}
                        required
                      />
                      <div className="invalid-feedback" id="kyc-address-error">
                        {errors.address}
                      </div>
                    </div>
                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <label className="form-label text-muted" htmlFor="kyc-city">
                          City *
                        </label>
                        <input
                          className={`form-control ${fieldClass("city")}`}
                          id="kyc-city"
                          value={city}
                          onChange={(event) => setCity(event.target.value)}
                          autoComplete="address-level2"
                          aria-describedby="kyc-city-error"
                          disabled={checking}
                          required
                        />
                        <div className="invalid-feedback" id="kyc-city-error">
                          {errors.city}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted" htmlFor="kyc-state">
                          State *
                        </label>
                        <select
                          className={`form-select ${fieldClass("state")}`}
                          id="kyc-state"
                          value={state}
                          onChange={(event) => setState(event.target.value)}
                          aria-describedby="kyc-state-error"
                          disabled={checking}
                          required
                        >
                          <option value=""></option>
                          {states.map((stateName) => (
                            <option key={stateName} value={stateName}>
                              {stateName}
                            </option>
                          ))}
                        </select>
                        <div className="invalid-feedback" id="kyc-state-error">
                          {errors.state}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted" htmlFor="kyc-country">
                          Country *
                        </label>
                        <input
                          className={`form-control ${fieldClass("country")}`}
                          id="kyc-country"
                          value={country}
                          onChange={(event) => setCountry(event.target.value)}
                          autoComplete="country-name"
                          aria-describedby="kyc-country-error"
                          disabled={checking}
                          required
                        />
                        <div className="invalid-feedback" id="kyc-country-error">
                          {errors.country}
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {!otpSent && (
                  <button
                    className="btn btn-warning fw-semibold px-4 py-3 w-100"
                    type="submit"
                    disabled={checking}
                  >
                    {checking && (
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        aria-hidden="true"
                      />
                    )}
                    {checking
                      ? "Processing..."
                      : manualEntryRequired
                        ? "Save KYC Details"
                        : "Continue"}
                    {!checking && (
                      <i
                        className="bi bi-arrow-right ms-2"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                )}
                {otpSent && (
                  <div>
                    <label className="form-label text-muted">
                      Enter OTP *
                    </label>
                    <div className="row g-2 mb-3">
                      {otp.map((digit, index) => (
                        <div className="col" key={index}>
                          <input
                            ref={(element) => {
                              otpRefs.current[index] = element;
                            }}
                            className="form-control text-center fw-bold px-1"
                            inputMode="numeric"
                            maxLength="1"
                            value={digit}
                            disabled={checking}
                            onChange={(event) =>
                              updateOtp(index, event.target.value)
                            }
                            onKeyDown={(event) =>
                              handleOtpBackspace(event, index)
                            }
                            aria-label={`KYC OTP digit ${index + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                    <button
                      className="btn btn-warning fw-semibold px-4 py-3 w-100"
                      type="button"
                      onClick={handleOtpVerify}
                      disabled={checking || otp.some((digit) => !digit)}
                    >
                      {checking ? "Verifying..." : "Verify OTP"}{" "}
                      <i
                        className="bi bi-arrow-right ms-2"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                )}
              </form>
            </div>
          </section>
        </div>
      </div>
      {panInfoOpen && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true" aria-labelledby="pan-info-title">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className="modal-header border-0 pb-0">
                  <div className="d-flex align-items-center gap-2">
                    <span className="d-inline-flex align-items-center justify-content-center rounded-circle bg-warning-subtle text-warning-emphasis" style={{ width: "40px", height: "40px" }}>
                      <i className="bi bi-shield-check" aria-hidden="true" />
                    </span>
                    <h2 className="h5 fw-bold mb-0" id="pan-info-title">
                      Why PAN is required
                    </h2>
                  </div>
                  <button
                    className="btn-close"
                    type="button"
                    aria-label="Close"
                    onClick={closePanInfo}
                  />
                </div>
                <div className="modal-body pt-3">
                  <p className="text-secondary mb-0">
                    PAN card is require for KYC as per SEBI Guidelines.
                  </p>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button
                    className="btn btn-warning fw-semibold px-4"
                    type="button"
                    onClick={closePanInfo}
                  >
                    Got it
                  </button>
                </div>
              </div>
            </div>
          </div>
          <button
            className="modal-backdrop fade show border-0"
            type="button"
            aria-label="Close PAN information"
            onClick={closePanInfo}
          />
        </>
      )}
    </main>
  );
}

export default KycPage;
