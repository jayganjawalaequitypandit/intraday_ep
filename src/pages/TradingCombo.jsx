"use client";

import { useState } from "react";

const COLORS = {
  navy: "#071D49",
  orange: "#FF6500",
  orangeLight: "#FFF3EA",
  purpleLight: "#F6F0FF",
  greenLight: "#EFFAF5",
  blueLight: "#EEF6FF",
  lightBg: "#F8FAFD",
  border: "#E6EBF2",
};

const services = [
  {
    title: "Live Options Recommendations",
    icon: "fa-chart-line",
    bgColor: "#f7f0ff",
    iconColor: "#6f42c1",
    items: [
      "High probability trade setups",
      "Nifty, BankNifty and key stocks",
      "Intraday and positional opportunities",
    ],
    link: "Get Options Insights",
  },
  {
    title: "Cash Intraday Trades",
    icon: "fa-arrow-trend-up",
    bgColor: "#eefbf5",
    iconColor: "#198754",
    items: [
      "Actionable intraday trade calls",
      "NSE listed stocks",
      "Real-time entry, targets & stop loss",
    ],
    link: "Start Intraday Trading",
  },
  {
    title: "Stock Futures Intraday Trades",
    icon: "fa-building-columns",
    bgColor: "#eef5ff",
    iconColor: "#0d6efd",
    items: [
      "Futures trading opportunities",
      "Nifty, BankNifty and top stocks",
      "Clear entry, targets & stop loss",
    ],
    link: "Explore Futures Trades",
  },
];

const stats = [
  [
    "fa-shield-halved",
    "SEBI Registered",
    "Research Analyst",
    "Registration No.: INH000029829",
  ],
  ["fa-users", "1M+", "Chosen by Registered Users", "Your Trusted Partner"],
  [
    "fa-star",
    "11+",
    "National & International Awards",
    "Recognized For Excellence",
  ],
  ["fa-arrow-up-right-dots", "21+", "Years Experience", "Market Experience"],
];

const faqs = [
  [
    "What is included in Trading Combo?",
    "Trading Combo includes live options recommendations, cash intraday trades, stock futures intraday trades, entry price, targets, stop loss and follow-up updates.",
  ],
  [
    "Which market segments are covered?",
    "The service covers Options, Cash Intraday and Stock Futures opportunities across relevant market instruments.",
  ],
  [
    "Will I receive entry, targets and stop loss?",
    "Yes. The brief specifies clear entry, targets and stop loss information for the relevant trade recommendations.",
  ],
  [
    "How long is the subscription valid?",
    "Subscription duration depends on the selected plan. The landing page intentionally does not display pricing or a specific validity period.",
  ],
  [
    "Where will I receive the recommendations?",
    "Recommendations and updates are designed to be accessible through the mobile app and web experience.",
  ],
  [
    "Is Trading Combo suitable for beginners?",
    "The service is presented as a structured way to access research-backed recommendations. Users should consider their own experience, risk tolerance and financial circumstances before trading.",
  ],
];

const validMobile = (value) => /^[6-9]\d{9}$/.test(value.replace(/\D/g, ""));

export default function TradingCombo() {
  const [toast, setToast] = useState("");
  const [mobile, setMobile] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [finalMobile, setFinalMobile] = useState("");
  const [finalSubmitted, setFinalSubmitted] = useState(false);

  const [openFaq, setOpenFaq] = useState(null);

  const showToast = (message) => {
    setToast(message);

    window.clearTimeout(window.__tradingComboToast);

    window.__tradingComboToast = window.setTimeout(() => {
      setToast("");
    }, 3500);
  };

  const leadValid = validMobile(mobile) && consent;

  const handleLeadSubmit = (e) => {
    e.preventDefault();

    setSubmitted(true);

    if (!validMobile(mobile) || !consent) return;

    showToast("Thank you! Your Trading Combo request has been captured.");

    setMobile("");
    setConsent(false);
    setSubmitted(false);
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();

    setFinalSubmitted(true);

    if (!validMobile(finalMobile)) return;

    showToast(
      "Thank you! We'll use your number to continue the registration flow.",
    );

    setFinalMobile("");
    setFinalSubmitted(false);
  };

  const scrollToRegistration = () => {
    document.getElementById("registration")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  return (
    <div className="bg-white text-dark">
      <main>
        {/* HERO */}
        <section
          id="home"
          className="py-5"
          style={{
            background:
              "linear-gradient(135deg, #FFFAF7 0%, #FFFFFF 55%, #FFF4ED 100%)",
          }}
        >
          <div className="container">
            <div className="row align-items-center g-3">
              <div className="col-12 col-lg-7">
                <div
                  className="d-inline-flex align-items-center gap-2 border rounded-pill bg-white px-3 py-2 small fw-semibold shadow-sm mb-4"
                  style={{
                    borderColor: COLORS.border,
                  }}
                >
                  <i
                    className="fa-solid fa-circle shadow-sm"
                    style={{ color: "#198754" }}
                  />

                  <small>SEBI Registered Research Analyst</small>

                  <small
                    className="border-start ps-2"
                    style={{
                      color: COLORS.orange,
                    }}
                  >
                    INH000029829
                  </small>
                </div>

                <h1
                  className="display-5 fw-bold lh-1 mb-3"
                  style={{ color: COLORS.navy }}
                >
                  One Plan.
                  <br />
                  <span style={{ color: COLORS.orange }}>
                    More Market Opportunities.
                  </span>
                </h1>

                <p className="lead text-secondary fs-5 mb-4">
                  Get expert-backed recommendations across Options, Cash &
                  Futures with clear entry, targets and stop loss.
                </p>

                <button
                  type="button"
                  className="btn text-white fw-semibold px-4 py-3 rounded-3 shadow-sm"
                  style={{
                    backgroundColor: COLORS.orange,
                    borderColor: COLORS.orange,
                  }}
                  onClick={scrollToRegistration}
                >
                  Get Trading Combo
                  <i className="fa-solid fa-arrow-right ms-2" />
                </button>
              </div>

              {/* REGISTRATION */}
              <div className="col-12 col-lg-5">
                <div
                  id="registration"
                  className="bg-white rounded-4 p-4 p-lg-4 shadow-sm"
                  style={{
                    border: "1px solid #dbe5f1",
                    borderLeftColor: "#ff7a00",
                    borderTopColor: "#ffb27a",
                    borderRightColor: "#b8d5ff",
                    borderBottomColor: "#b8d5ff",
                  }}
                >
                  <h3
                    className="h5 fw-bold mb-1"
                    style={{ color: COLORS.navy }}
                  >
                    Get Trading Combo Access
                  </h3>

                  <p className="small text-secondary mb-4">
                    Enter your details to get started
                  </p>

                  <form onSubmit={handleLeadSubmit} noValidate>
                    {/* MOBILE */}
                    <div className="mb-3">
                      <label
                        htmlFor="mobile"
                        className="form-label small fw-semibold"
                      >
                        Mobile Number
                      </label>

                      <div className="input-group">
                        <span className="input-group-text bg-light">+91</span>

                        <input
                          id="mobile"
                          value={mobile}
                          inputMode="numeric"
                          maxLength={10}
                          placeholder="Enter 10-digit mobile number"
                          autoComplete="tel"
                          className={`form-control ${
                            submitted && !validMobile(mobile)
                              ? "is-invalid"
                              : ""
                          }`}
                          onChange={(e) =>
                            setMobile(
                              e.target.value.replace(/\D/g, "").slice(0, 10),
                            )
                          }
                        />
                      </div>

                      {submitted && !validMobile(mobile) && (
                        <div className="invalid-feedback d-block">
                          Please enter a valid 10-digit mobile number.
                        </div>
                      )}
                    </div>

                    {/* CONSENT */}
                    <div className="form-check small mb-3">
                      <input
                        id="consent"
                        type="checkbox"
                        className="form-check-input"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                      />

                      <label
                        htmlFor="consent"
                        className="form-check-label text-secondary"
                      >
                        I agree to be contacted by Intraday Traders regarding
                        trading insights, products and services via call, SMS or
                        WhatsApp.
                      </label>
                    </div>

                    <div className="small text-secondary mb-3">
                      By submitting your details, you agree to our{" "}
                      <a
                        href="#"
                        className="text-decoration-none"
                        style={{ color: COLORS.orange }}
                      >
                        Terms
                      </a>{" "}
                      &{" "}
                      <a
                        href="#"
                        className="text-decoration-none"
                        style={{ color: COLORS.orange }}
                      >
                        Privacy Policy
                      </a>
                      .
                    </div>

                    <button
                      type="submit"
                      className="btn w-100 py-3 fw-semibold rounded-3 text-white"
                      style={{
                        backgroundColor: leadValid ? COLORS.orange : "#D9D9D9",
                        borderColor: leadValid ? COLORS.orange : "#D9D9D9",
                      }}
                      disabled={!leadValid}
                    >
                      Get Started
                      <i className="fa-solid fa-arrow-right ms-2" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="py-3 bg-white">
          <div className="container">
            <div
              className="row g-0 rounded-4 shadow-sm overflow-hidden"
              style={{
                border: `1px solid ${COLORS.border}`,
              }}
            >
              {stats.map(([icon, title, text, sub], index) => (
                <div
                  key={title}
                  className={`col-12 col-sm-6 col-lg-3 p-3 p-lg-4 ${
                    index !== 3 ? "border-end" : ""
                  } ${index < 2 ? "border-bottom" : ""}`}
                >
                  <div className="d-flex align-items-start gap-3">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-3 p-2"
                      style={{
                        backgroundColor: COLORS.orangeLight,
                        color: COLORS.orange,
                      }}
                    >
                      <i className={`fa-solid ${icon}`} />
                    </div>

                    <div>
                      <div className="fw-bold" style={{ color: COLORS.navy }}>
                        {title}
                      </div>

                      <div className="small text-secondary">{text}</div>

                      <div className="small text-secondary">{sub}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* INCLUDED */}
        <section className="py-5" id="why">
          <div className="container py-lg-4">
            <div className="text-center mx-auto mb-5">
              <div
                className="fw-bold text-uppercase small mb-2"
                style={{ color: "#ff6b00" }}
              >
                — What's Included
              </div>

              <h2 className="display-6 fw-bold mb-3">
                What’s Included in the{" "}
                <span style={{ color: "#ff6b00" }}>Trading Combo</span>
              </h2>

              <p className="text-secondary mb-0">
                A complete solution to help you trade multiple market segments
                with discipline and confidence.
              </p>
            </div>

            <div className="row g-3">
              {services.map((service) => (
                <div className="col-12 col-md-6 col-lg-4" key={service.title}>
                  <article
                    className="h-100 rounded-4 p-4"
                    style={{
                      backgroundColor: service.bgColor,
                      border: `1px solid ${service.iconColor}20`,
                    }}
                  >
                    {/* ICON */}
                    <div
                      className="d-inline-flex align-items-center justify-content-center rounded-3 mb-4"
                      style={{
                        width: "42px",
                        height: "42px",
                        backgroundColor: "#ffffff",
                        color: service.iconColor,
                      }}
                    >
                      <i className={`fa-solid ${service.icon} fa-lg`} />
                    </div>

                    {/* TITLE */}
                    <h3 className="h5 fw-bold mb-3">{service.title}</h3>

                    {/* FEATURES */}
                    <ul className="list-unstyled small text-secondary mb-4">
                      {service.items.map((item) => (
                        <li className="mb-2" key={item}>
                          <i
                            className="fa-solid fa-check me-2"
                            style={{
                              color: service.iconColor,
                            }}
                          />

                          {item}
                        </li>
                      ))}
                    </ul>

                    {/* LINK */}
                    <a
                      href="#registration"
                      onClick={scrollToRegistration}
                      className="small fw-bold text-decoration-none"
                      style={{
                        color: service.iconColor,
                      }}
                    >
                      {service.link}

                      <i
                        className="fa-solid fa-arrow-right ms-2"
                        style={{
                          color: service.iconColor,
                        }}
                      />
                    </a>
                  </article>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-5" style={{ backgroundColor: COLORS.lightBg }}>
          <div className="container py-lg-4">
            <div className="text-center mx-auto mb-5">
              <div
                className="fw-bold text-uppercase small mb-2"
                style={{ color: COLORS.orange }}
              >
                — Simple Process
              </div>

              <h2
                className="display-6 fw-bold mb-3"
                style={{ color: COLORS.navy }}
              >
                How It <span style={{ color: COLORS.orange }}>Works</span>
              </h2>

              <p className="text-secondary mb-0">
                Get started with Trading Combo in a few simple steps.
              </p>
            </div>

            <div className="row g-3">
              {[
                [
                  "01",
                  "Register",
                  "Enter your mobile number and complete registration.",
                  "fa-user-plus",
                ],
                [
                  "02",
                  "Choose the Plan",
                  "Select Trading Combo and complete activation.",
                  "fa-list-check",
                ],
                [
                  "03",
                  "Receive Recommendations",
                  "Get options, cash intraday and futures trade ideas.",
                  "fa-bell",
                ],
                [
                  "04",
                  "Track Updates",
                  "Receive target updates, stop loss alerts and market insights.",
                  "fa-chart-column",
                ],
              ].map(([num, title, text, icon]) => (
                <div className="col-12 col-md-6 col-lg-3 text-center" key={num}>
                  <div className="d-flex flex-column align-items-center h-100">
                    <div
                      className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold mb-3 shadow-sm"
                      style={{
                        width: 42,
                        height: 42,
                        backgroundColor: COLORS.orange,
                      }}
                    >
                      {num}
                    </div>

                    <div className="mb-2" style={{ color: COLORS.orange }}>
                      <i className={`fa-solid ${icon}`} />
                    </div>

                    <h3 className="h6 fw-bold" style={{ color: COLORS.navy }}>
                      {title}
                    </h3>

                    <p className="small text-secondary mb-0">{text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-5">
              <button
                type="button"
                className="btn text-white fw-semibold px-4 py-3"
                style={{
                  backgroundColor: COLORS.orange,
                  borderColor: COLORS.orange,
                }}
                onClick={scrollToRegistration}
              >
                Get Started Now
                <i className="fa-solid fa-arrow-right ms-2" />
              </button>
            </div>
          </div>
        </section>

        {/* COMBO */}
        <section className="py-5">
          <div className="container py-lg-4">
            <div
              className="rounded-4 text-white p-4 p-lg-5 shadow"
              style={{
                backgroundColor: COLORS.navy,
              }}
            >
              <div className="row align-items-center g-3">
                <div className="col-12 col-lg-6">
                  <div
                    className="fw-bold text-uppercase small mb-2"
                    style={{ color: COLORS.orange }}
                  >
                    — One Complete Solution
                  </div>

                  <h2 className="display-6 fw-bold">Trading Combo</h2>

                  <p className="text-white-50">
                    Trade across options, cash and futures with expert guidance.
                  </p>

                  <div className="row g-3 small">
                    {[
                      "Live Options Recommendations",
                      "Cash Intraday Trades",
                      "Stock Futures Intraday Trades",
                      "Entry Price, Targets & Stop Loss",
                      "Trade follow-up updates",
                      "Research-backed recommendations",
                      "Access via mobile app & web",
                      "Multiple market opportunities",
                    ].map((item) => (
                      <div className="col-12 col-sm-6" key={item}>
                        <i
                          className="fa-solid fa-check me-2"
                          style={{ color: COLORS.orange }}
                        />
                        {item}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="btn text-white fw-semibold mt-4 px-4 py-3"
                    style={{
                      backgroundColor: COLORS.orange,
                      borderColor: COLORS.orange,
                    }}
                    onClick={scrollToRegistration}
                  >
                    Get Trading Combo
                    <i className="fa-solid fa-arrow-right ms-2" />
                  </button>
                </div>

                <div className="col-12 col-lg-6">
                  <div className="text-center">
                    <div
                      className="position-relative mx-auto"
                      style={{
                        width: 220,
                        height: 180,
                      }}
                    >
                      <div
                        className="position-absolute top-50 start-50 translate-middle rounded-circle opacity-50"
                        style={{
                          width: 170,
                          height: 170,
                          border: "1px solid rgba(255,255,255,.25)",
                        }}
                      />

                      <div
                        className="position-absolute top-50 start-50 translate-middle rounded-circle opacity-50"
                        style={{
                          width: 110,
                          height: 110,
                          border: "1px solid rgba(255,255,255,.25)",
                        }}
                      />

                      <div
                        className="position-absolute top-50 start-50 translate-middle rounded-circle shadow"
                        style={{
                          width: 22,
                          height: 22,
                          backgroundColor: COLORS.orange,
                        }}
                      />

                      <svg
                        className="position-absolute top-0 start-0 w-100 h-100"
                        viewBox="0 0 220 180"
                        aria-hidden="true"
                      >
                        <polyline
                          points="15,145 55,128 82,138 110,95 136,110 164,62 185,77 214,28"
                          fill="none"
                          stroke={COLORS.orange}
                          strokeWidth="3"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* APP */}
        <section className="py-5" style={{ backgroundColor: "#F4F8FE" }}>
          <div className="container py-lg-4">
            <div className="row align-items-center justify-content-between g-3">
              <div className="col-12 col-lg-5">
                <div
                  className="fw-bold text-uppercase small mb-2"
                  style={{ color: COLORS.orange }}
                >
                  — Mobile App
                </div>

                <h2
                  className="display-6 fw-bold"
                  style={{ color: COLORS.navy }}
                >
                  Everything You Need.
                  <br />
                  Right on Your Phone.
                </h2>

                <p className="text-secondary">
                  Get real-time trade recommendations, updates and track your
                  portfolio — all in one powerful app.
                </p>

                <div className="d-flex flex-wrap gap-2 mb-3">
                  <a
                    href="#"
                    className="btn btn-dark d-flex align-items-center gap-2"
                  >
                    <i className="fa-brands fa-google-play"></i>

                    <span className="text-start">
                      <small className="d-block">GET IT ON</small>
                      <strong>Google Play</strong>
                    </span>
                  </a>

                  <a
                    href="#"
                    className="btn btn-dark d-flex align-items-center gap-2"
                  >
                    <i className="fa-brands fa-app-store"></i>

                    <span className="text-start">
                      <small className="d-block">DOWNLOAD ON THE</small>
                      <strong>App Store</strong>
                    </span>
                  </a>
                </div>

                <button
                  type="button"
                  className="btn text-white fw-semibold px-4 py-3"
                  style={{
                    backgroundColor: COLORS.orange,
                    borderColor: COLORS.orange,
                  }}
                  onClick={scrollToRegistration}
                >
                  Download App
                  <i className="fa-solid fa-download ms-2" />
                </button>
              </div>

              <div className="col-12 col-lg-6">
                <div className="row justify-content-center align-items-center g-3">
                  {/* <div className="col-6 col-md-5">
                    <Phone back />
                  </div>

                  <div className="col-6 col-md-5">
                    <Phone />
                  </div> */}
                  <img
                    src="/combo.png"
                    alt="EquityPandit SEBI Registered Research Analyst"
                    className="img-fluid object-fit-contain"
                    style={{
                      maxHeight: "450px",
                      width: "auto",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-5" id="faqs">
          <div className="container py-lg-4">
            <div className="text-center mx-auto mb-5">
              <div
                className="fw-bold text-uppercase small mb-2"
                style={{ color: COLORS.orange }}
              >
                — Help Center
              </div>

              <h2 className="display-6 fw-bold" style={{ color: COLORS.navy }}>
                Frequently Asked{" "}
                <span style={{ color: COLORS.orange }}>Questions</span>
              </h2>

              <p className="text-secondary">
                Find answers to common questions about the Trading Combo.
              </p>
            </div>

            <div className="row justify-content-center">
              <div className="col-12 col-lg-9">
                <div
                  className="border-top"
                  style={{ borderColor: COLORS.border }}
                >
                  {faqs.map(([question, answer], index) => {
                    const isOpen = openFaq === index;

                    return (
                      <div className="row border-bottom" key={question}>
                        <div className="col-12">
                          <button
                            type="button"
                            className="btn w-100 text-start py-4 px-0 border-0 shadow-none d-flex justify-content-between align-items-center"
                            onClick={() => setOpenFaq(isOpen ? null : index)}
                            aria-expanded={isOpen}
                          >
                            <span className="fw-semibold pe-3">{question}</span>

                            <span
                              className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                              style={{
                                width: 28,
                                height: 28,
                                backgroundColor: COLORS.orangeLight,
                                color: COLORS.orange,
                              }}
                            >
                              <i
                                className={`fa-solid ${
                                  isOpen ? "fa-minus" : "fa-plus"
                                }`}
                              />
                            </span>
                          </button>

                          {isOpen && (
                            <div className="row pb-4">
                              <div className="col-12 col-md-11">
                                <p className="text-secondary small mb-0">
                                  {answer}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section
          className="py-5 text-white"
          id="contact"
          style={{
            backgroundColor: COLORS.navy,
            backgroundImage:
              "linear-gradient(135deg, rgba(255,255,255,.03) 25%, transparent 25%), linear-gradient(315deg, rgba(255,255,255,.03) 25%, transparent 25%)",
            backgroundSize: "30px 30px",
          }}
        >
          <div className="container py-lg-4">
            <div className="row align-items-center g-3">
              <div className="col-12 col-lg-7">
                <div
                  className="fw-bold text-uppercase small mb-2"
                  style={{ color: COLORS.orange }}
                >
                  — Take The Next Step
                </div>

                <h2 className="display-5 fw-bold">
                  Your Next Trading
                  <br />
                  Opportunity
                  <br />
                  <span style={{ color: COLORS.orange }}>Starts Here.</span>
                </h2>

                <p className="text-white-50 mb-0">
                  Get expert recommendations across Options, Cash and Futures.
                </p>
              </div>

              <div className="col-12 col-lg-5">
                <form
                  className="bg-white text-dark rounded-4 p-4 shadow"
                  onSubmit={handleFinalSubmit}
                  noValidate
                >
                  <label
                    htmlFor="finalMobile"
                    className="form-label small fw-semibold"
                  >
                    Mobile number
                  </label>

                  <div className="input-group mb-2">
                    <span className="input-group-text bg-light">+91</span>

                    <input
                      id="finalMobile"
                      value={finalMobile}
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="Enter your mobile number"
                      className={`form-control ${
                        finalSubmitted && !validMobile(finalMobile)
                          ? "is-invalid"
                          : ""
                      }`}
                      onChange={(e) => {
                        setFinalMobile(
                          e.target.value.replace(/\D/g, "").slice(0, 10),
                        );

                        setFinalSubmitted(false);
                      }}
                    />
                  </div>

                  {finalSubmitted && !validMobile(finalMobile) && (
                    <div className="invalid-feedback d-block">
                      Please enter a valid 10-digit mobile number.
                    </div>
                  )}

                  <button
                    className="btn text-white w-100 py-3 fw-semibold mt-2"
                    style={{
                      backgroundColor: COLORS.orange,
                      borderColor: COLORS.orange,
                    }}
                    type="submit"
                  >
                    Get Started
                    <i className="fa-solid fa-arrow-right ms-2" />
                  </button>

                  <div className="small text-secondary text-center mt-2">
                    By submitting your mobile number, you agree to our{" "}
                    <a href="#" style={{ color: COLORS.orange }}>
                      Terms
                    </a>{" "}
                    &{" "}
                    <a href="#" style={{ color: COLORS.orange }}>
                      Privacy Policy
                    </a>
                    .
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer
        className="py-4 text-white border-top"
        style={{
          backgroundColor: COLORS.navy,
          borderColor: "rgba(255,255,255,.15)",
        }}
      >
        <div className="container">
          <div className="row align-items-center gy-3 small">
            <div className="col-12 col-md-8 text-center text-md-start">
              © 2026 Intraday Traders by EquityPandit. All rights reserved.
            </div>

            <div className="col-12 col-md-4">
              <div className="row g-2 justify-content-center justify-content-md-end">
                <div className="col-auto">
                  <a href="#" className="text-white text-decoration-none">
                    Terms
                  </a>
                </div>

                <div className="col-auto">
                  <a href="#" className="text-white text-decoration-none">
                    Privacy Policy
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* TOAST */}
      {toast && (
        <div
          className="position-fixed bottom-0 end-0 m-3 p-3 bg-dark text-white rounded-3 shadow"
          role="status"
          aria-live="polite"
          style={{ zIndex: 1080 }}
        >
          <div className="row align-items-center g-2">
            <div className="col-auto">
              <i
                className="fa-solid fa-circle-check"
                style={{ color: "#22C55E" }}
              />
            </div>

            <div className="col">{toast}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function Phone({ back = false }) {
  return (
    <div
      className="bg-dark rounded-5 p-2 shadow-lg mx-auto"
      style={{
        transform: back ? "rotate(-7deg)" : "rotate(5deg)",
      }}
    >
      <div className="bg-light rounded-4 p-3 text-dark">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <strong className="small">
            {back ? "Markets" : "Intraday Traders"}
          </strong>

          <span
            className="rounded-circle"
            style={{
              width: 10,
              height: 10,
              backgroundColor: COLORS.orange,
            }}
          />
        </div>

        {back ? (
          <>
            {[
              ["NIFTY 50", "+0.84%", "24,985.40"],
              ["BANKNIFTY", "+0.61%", "57,842.15"],
              ["RELIANCE", "+1.12%", "1,425.70"],
              ["SBIN", "+0.45%", "812.35"],
            ].map(([name, change, price]) => (
              <div className="bg-white border rounded-3 p-2 mb-2" key={name}>
                <div className="d-flex justify-content-between align-items-center">
                  <strong className="small">{name}</strong>

                  <span className="badge text-bg-success">{change}</span>
                </div>

                <small className="text-secondary">{price}</small>
              </div>
            ))}
          </>
        ) : (
          <>
            <div
              className="text-white rounded-3 p-3 mb-2"
              style={{
                backgroundColor: COLORS.navy,
              }}
            >
              <small className="d-block" style={{ color: COLORS.orange }}>
                ACTIVE RECOMMENDATION
              </small>

              <strong className="d-block">NIFTY CALL</strong>

              <small>Entry 24,950 • Target 25,020</small>
            </div>

            {[
              [
                "Options Recommendation",
                "LIVE",
                "BankNifty • Target 1: Achieved",
              ],
              ["Cash Intraday", "BUY", "Entry • Targets • Stop Loss"],
              ["Futures Trade", "ACTIVE", "Follow-up update available"],
            ].map(([name, pill, text]) => (
              <div className="bg-white border rounded-3 p-2 mb-2" key={name}>
                <div className="d-flex justify-content-between align-items-center">
                  <strong className="small">{name}</strong>

                  <span className="badge text-bg-success">{pill}</span>
                </div>

                <small className="text-secondary">{text}</small>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
