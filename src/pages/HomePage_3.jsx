"use client";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../services/api.js";
import {
  selectUapiAuth,
  setUapiCredentials,
  setUapiLoginResponse,
  setUapiMobileNumber,
} from "../store/uapiAuthSlice.js";
import { setEapiCredentials } from "../store/eapiAuthSlice.js";
import { APP_STORE_URL, GOOGLE_PLAY_URL } from "../constants/appLinks.js";
import {
  assertSuccessfulResponse,
  isValidMobileNumber,
} from "../utils/authResponse.js";

const stats = [
  {
    number: "21+",
    title: "Years Of Market Experience",
  },
  {
    number: "5L+",
    title: "Traders & Investors",
  },
  {
    number: "NSE",
    title: "Listed Stocks Covered",
  },
  {
    number: "24X7",
    title: "App Access",
  },
];

const features = [
  {
    image: "/images/homepage-3/icons/intraday-calls.svg",
    title: "Intraday Calls",
    text: "Research-backed buy and sell recommendations with clear levels.",
  },
  {
    image: "/images/homepage-3/icons/entry-target.svg",
    title: "Entry, Target & SL",
    text: "Defined entry, target and stop-loss levels for every published call.",
  },
  {
    image: "/images/homepage-3/icons/live-updates.svg",
    title: "Live Updates",
    text: "Timely follow-up alerts when a published trading call changes.",
  },
  {
    image: "/images/homepage-3/icons/market-insights.svg",
    title: "Market Insights",
    text: "Market context for cash, stock futures, index options and stock options.",
  },
  {
    image: "/images/homepage-3/icons/app-notifications.svg",
    title: "App Notifications",
    text: "Receive new calls and important updates through app notifications.",
  },
  {
    image: "/images/homepage-3/icons/research-history.svg",
    title: "Research History",
    text: "Review previously published calls and their follow-up updates.",
  },
];

const steps = [
  {
    image: "/images/homepage-3/step1.png",
    title: "Enter your phone",
    text: "number or email.",
  },
  {
    image: "/images/homepage-3/step2.png",
    title: "Select plan ",
    text: "complete payment in minutes.",
  },
  {
    image: "/images/homepage-3/step3.png",
    title: "Complete your KYC in minutes",
    text: "using Aadhaar & PAN.",
  },
];

const tradingAccordion = [
  {
    id: "live-calls",
    title: "Live Options Recommendations",
    description:
      "Get live options recommendations with entry, target and stop-loss levels.",
    image: "/images/homepage-3/cash-intraday.png",
    iconImage: "/images/homepage-3/icons/live-options.svg",
  },
  {
    id: "cash-intraday",
    title: "Cash Intraday Trades",
    description:
      "Track intraday cash trades with clear entry, target and stop-loss levels.",
    image: "/images/homepage-3/live-calls.png",
    iconImage: "/images/homepage-3/icons/cash-intraday.svg",
  },
  {
    id: "stock-futures",
    title: "Stock Futures Intraday Trades",
    description:
      "Track, manage and switch to stock futures intraday trades with live updates.",
    image: "/images/homepage-3/stock-futures.png",
    iconImage: "/images/homepage-3/icons/stock-futures.svg",
  },
  {
    id: "trade-alerts",
    title: "Live Trade Alerts",
    description:
      "Stay updated with instant trade alerts and follow-up notifications.",
    image: "/images/homepage-3/live-calls.png",
    iconImage: "/images/homepage-3/icons/trade-alerts.svg",
  },
];

export const homePage3Faqs = [
  {
    question: "What are intraday trading calls?",
    answer:
      "Intraday trading calls are research-based buy or sell recommendations intended for the same trading session. A published call may include an entry level or range, targets, a stop-loss and follow-up updates.",
  },
  {
    question: "Do you provide cash intraday calls?",
    answer:
      "Yes. Intraday Traders covers selected cash-market opportunities with defined entry, target and stop-loss levels when suitable setups are identified.",
  },
  {
    question: "Do you provide stock futures calls?",
    answer:
      "Yes. The service may publish intraday stock futures calls with entry, target, stop-loss and follow-up updates, depending on market conditions.",
  },
  {
    question: "Do you cover Nifty and Bank Nifty index options?",
    answer:
      "Yes. Intraday Traders covers Nifty and Bank Nifty index options when the research team identifies a suitable opportunity. The availability of calls varies with market conditions.",
  },
  {
    question: "Are stock options calls included?",
    answer:
      "The service covers selected stock options in addition to index options, cash intraday and stock futures. Coverage depends on liquidity, risk and prevailing market conditions.",
  },
  {
    question: "What information does each trading call contain?",
    answer:
      "A published trading call may include the instrument, buy or sell direction, entry level or range, target levels and a stop-loss. Follow-up alerts may communicate important changes or closure updates.",
  },
  {
    question: "How are live trading updates delivered?",
    answer:
      "Subscribers receive published trading calls and follow-up alerts through the Intraday Traders app. Enable app notifications so important updates are not missed.",
  },
  {
    question: "Is Intraday Traders SEBI registered?",
    answer:
      "Intraday Traders is a research service from Equitypandit Financial Services Private Limited, a SEBI-registered Research Analyst with registration number INH000029829.",
  },
  {
    question: "How can I view subscription plans?",
    answer:
      "Enter and verify your mobile number to view the currently available subscription plans. You can review the plan price, duration and renewal details before completing payment.",
  },
];

export default function HomePage_3({ authenticated = false, onGetStarted, onOtpSent, notify }) {
  const dispatch = useDispatch();
  const savedMobileNumber = useSelector(selectUapiAuth).mobileNumber;
  const [mobileNumber, setMobileNumber] = React.useState(
    String(savedMobileNumber ?? ""),
  );
  const [mobileError, setMobileError] = React.useState("");
  const [sendingOtp, setSendingOtp] = React.useState(false);
  const startsWithZero = mobileNumber.startsWith("0");
  const [activeTrade, setActiveTrade] = React.useState(tradingAccordion[0].id);
  const mobileCarouselRef = React.useRef(null);
  const tradingListRef = React.useRef(null);
  const tradingItemRefs = React.useRef({});
  const tradeDirectionRef = React.useRef(1);
  const heroMobileRef = React.useRef(null);

  const updateMobileNumber = (event) => {
    const nextMobileNumber = event.target.value.replace(/\D/g, "").slice(0, 10);
    setMobileNumber(nextMobileNumber);
    setMobileError("");
  };

  const handleMobileSubmit = async (event) => {
    event.preventDefault();
    if (authenticated) {
      onGetStarted?.();
      return;
    }
    if (sendingOtp) return;
    if (!isValidMobileNumber(mobileNumber)) {
      setMobileError("Enter a valid 10-digit mobile number.");
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
        source:
          new URLSearchParams(window.location.search).get("sr") || "idt-home",
      });
      assertSuccessfulResponse(
        response,
        "Unable to send OTP. Please check your mobile number and try again.",
      );
      dispatch(setUapiMobileNumber(mobileNumber));
      dispatch(setUapiLoginResponse(response));
      notify?.("success", response?.message || "OTP sent successfully");
      onOtpSent?.();
    } catch (requestError) {
      dispatch(setUapiCredentials({ token: null, user: null }));
      dispatch(setUapiLoginResponse(null));
      dispatch(setEapiCredentials({ token: null, user: null }));
      notify?.(
        "error",
        requestError.message ||
          "Unable to send OTP. Please check your mobile number and try again.",
      );
    } finally {
      setSendingOtp(false);
    }
  };

  React.useEffect(() => {
    const carouselElement = mobileCarouselRef.current;
    if (!carouselElement) return undefined;
    const syncActiveTrade = (event) => {
      setActiveTrade(tradingAccordion[event.to].id);
    };
    carouselElement.addEventListener("slid.bs.carousel", syncActiveTrade);
    return () => {
      carouselElement.removeEventListener("slid.bs.carousel", syncActiveTrade);
    };
  }, []);

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveTrade((currentTrade) => {
        const currentIndex = tradingAccordion.findIndex(
          (item) => item.id === currentTrade,
        );
        let nextIndex = currentIndex + tradeDirectionRef.current;

        if (nextIndex >= tradingAccordion.length) {
          tradeDirectionRef.current = -1;
          nextIndex = tradingAccordion.length - 2;
        } else if (nextIndex < 0) {
          tradeDirectionRef.current = 1;
          nextIndex = 1;
        }

        mobileCarouselRef.current
          ?.querySelector(`[data-bs-slide-to="${nextIndex}"]`)
          ?.click();
        return tradingAccordion[nextIndex].id;
      });
    }, 3500);

    return () => window.clearInterval(timer);
  }, []);

  React.useEffect(() => {
    const list = tradingListRef.current;
    const activeElement = tradingItemRefs.current[activeTrade];
    if (!list || !activeElement) return;

    list.scrollTo({
      top:
        activeElement.offsetTop -
        list.offsetTop -
        (list.clientHeight - activeElement.offsetHeight) / 2,
      behavior: "smooth",
    });
  }, [activeTrade]);

  const activeItem =
    tradingAccordion.find((item) => item.id === activeTrade) ||
    tradingAccordion[0];

  const showTradeAtIndex = (index) => {
    const normalizedIndex =
      (index + tradingAccordion.length) % tradingAccordion.length;
    setActiveTrade(tradingAccordion[normalizedIndex].id);
    mobileCarouselRef.current
      ?.querySelector(`[data-bs-slide-to="${normalizedIndex}"]`)
      ?.click();
  };

  return (
    <main className="bg-white">
      {/* ================= HERO ================= */}
      <section>
        <div
          className="container"
          style={{
            backgroundColor: "#FFFAF6",
            backgroundImage: "url('/images/homepage-3/hero_bg.svg')",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center bottom",
            backgroundSize: "100% auto",
          }}
        >
          {/* Badge */}
          <div className="row py-5">
            <div className="col-12 text-center">
              <span
                className="badge rounded-pill px-3 py-2 fw-normal"
                style={{
                  backgroundColor: "#FFF5ED",
                  color: "#F58011",
                }}
              >
                SEBI Registered Research Analyst · INH000029829
              </span>
            </div>
          </div>

          {/* Heading */}
          <div className="row justify-content-center text-center">
            <div className="col-12 col-lg-6">
              <h1 className="display-3 text-body-emphasis fw-normal mb-2 page-title">
                Get Live Intraday Trading Calls Daily.
              </h1>

              <p className="fs-6 text-body-secondary mb-3">
                Research-backed calls for cash intraday, stock futures, Nifty
                and Bank Nifty index options, and selected stock options.
              </p>

              {/* Mobile Input */}
              <div className="row justify-content-center">
                <div className="col-12 col-lg-9">
                  <form
                    onSubmit={handleMobileSubmit}
                    noValidate
                    className="input-group rounded-pill overflow-hidden"
                    style={{
                      border: "1px solid #D1D5DB",
                      backgroundColor: "#ffffff",
                    }}
                  >
                    <div className="input-group-text border-0 bg-white">
                      <i className="fa-solid fa-grip text-body-secondary"></i>
                    </div>

                    <input
                      ref={heroMobileRef}
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      maxLength="10"
                      pattern="[1-9][0-9]{9}"
                      required
                      aria-label="Mobile number"
                      title="Mobile number must not start with 0"
                      aria-invalid={startsWithZero || Boolean(mobileError)}
                      aria-describedby={startsWithZero || mobileError ? "home3-hero-mobile-error" : undefined}
                      className={`form-control form-control-sm border-0 shadow-none ${startsWithZero || mobileError ? "is-invalid" : ""}`}
                      placeholder="Enter Your Mobile Number"
                      value={mobileNumber}
                      onChange={updateMobileNumber}
                    />

                    <button
                      type="submit"
                      disabled={sendingOtp}
                      className="btn rounded-pill px-4 text-black"
                      style={{
                        backgroundColor: "#F78A18",
                      }}
                    >
                      {sendingOtp ? "Sending OTP..." : "Get Started"}
                    </button>
                  </form>
                  {(startsWithZero || mobileError) && (
                    <p className="small text-danger mt-2 mb-0" id="home3-hero-mobile-error" role="alert">
                      {startsWithZero
                        ? "Mobile number must not start with 0."
                        : mobileError}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* HERO IMAGE / BACKGROUND ARTWORK */}
          <div className="row justify-content-center mt-4">
            <div className="col-12 col-lg-10 position-relative">
              <div className="d-flex d-lg-none justify-content-center align-items-center flex-nowrap gap-3 mb-2">
                <img
                  src="/images/homepage-3/sebi-registered.png"
                  alt="SEBI Registered"
                  style={{ width: "clamp(100px, 24vw, 120px)", height: "auto" }}
                />
                <img
                  src="/images/homepage-3/bse-enlisted.png"
                  alt="BSE Enlisted"
                  style={{ width: "clamp(100px, 24vw, 120px)", height: "auto" }}
                />
              </div>
              <div
                className="w-100"
                style={{
                  height: "clamp(220px, 38vw, 400px)",
                  backgroundImage: "url('/images/homepage-3/homepage3-hero.png')",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center bottom",
                  backgroundSize: "contain",
                }}
                aria-label="Intraday Traders Mobile Trading App"
                role="img"
              />
              <img
                src="/images/homepage-3/sebi-registered.png"
                alt="SEBI Registered"
                className="position-absolute d-none d-md-block sebi-badge-float"
                style={{
                  top: "60%",
                  left: "10%",
                  transform: "translateY(-50%)",
                }}
              />
              <img
                src="/images/homepage-3/bse-enlisted.png"
                alt="BSE Enlisted"
                className="position-absolute d-none d-md-block sebi-badge-float sebi-badge-float--delayed"
                style={{
                  top: "82%",
                  right: "7%",
                  transform: "translateY(-50%)",
                  width: "141px",
                  height: "auto",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="py-5">
        <div className="container">
          <div className="row g-3">
            {stats.map((stat) => (
              <div className="col-6 col-lg-3" key={stat.number}>
                <div
                  className="text-center rounded-3 p-3 h-100"
                  style={{
                    border: "1px solid #ECECEC",
                    backgroundColor: "#F5F5F5",
                  }}
                >
                  <p className="fs-3 text-body-emphasis fw-semibold mb-0">
                    {stat.number}
                  </p>

                  <p className="text-body-emphasis mb-0">{stat.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= REALTIME ALERTS ================= */}
      <section className="py-5">
        <div className="container">
          <div className="row align-items-center g-3">
            {/* ================= IMAGE ================= */}
            <div className="col-12 col-lg-6 text-center d-none d-lg-block">
              <img
                src={activeItem.image}
                alt={activeItem.title}
                className="img-fluid w-100"
                style={{
                  maxWidth: "360px",
                }}
              />
            </div>

            {/* ================= ACCORDION ================= */}
            <div className="col-12 col-lg-6">
              <h2 className="display-4 fw-normal text-body-emphasis mb-3 page-title">
                Realtime Alerts&nbsp; & Trading Signals
              </h2>

              <p className="fs-6 text-body-secondary mb-4">
                Get instant notifications for intraday trade ideas, entry
                levels, targets, stop-loss updates and key market movements.
              </p>

              <div
                id="realtimeAlertsCarousel"
                ref={mobileCarouselRef}
                className="d-lg-none text-center mb-4 carousel slide"
                data-bs-touch="true"
                role="region"
                aria-label="Trading signal images"
                aria-roledescription="carousel"
              >
                <div className="carousel-inner">
                  {tradingAccordion.map((item, index) => (
                    <div
                      key={item.id}
                      className={`carousel-item${index === 0 ? " active" : ""}`}
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="img-fluid w-100"
                        style={{ maxWidth: "250px" }}
                      />
                    </div>
                  ))}
                </div>
                <div className="carousel-indicators position-relative mt-2">
                  {tradingAccordion.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      data-bs-target="#realtimeAlertsCarousel"
                      data-bs-slide-to={index}
                      className={`bg-dark${index === 0 ? " active" : ""}`}
                      aria-current={index === 0 ? "true" : undefined}
                      aria-label={`Slide ${index + 1}: ${item.title}`}
                    />
                  ))}
                </div>
              </div>

              <div
                ref={tradingListRef}
                className="accordion accordion-flush realtime-alerts-list"
                id="tradingAccordion"
                // style={{ maxHeight: "330px", overflowY: "auto", scrollBehavior: "smooth" }}
              >
                {tradingAccordion.map((item) => {
                  const isActive = activeTrade === item.id;

                  return (
                    <div
                      ref={(element) => {
                        tradingItemRefs.current[item.id] = element;
                      }}
                      className="accordion-item"
                      key={item.id}
                    >
                      <div
                        className="d-flex align-items-start py-3"
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          showTradeAtIndex(
                            tradingAccordion.findIndex(
                              (trade) => trade.id === item.id,
                            ),
                          )
                        }
                      >
                        {/* Icon column */}
                        <div className="flex-shrink-0 d-flex justify-content-center">
                          <img
                            src={item.iconImage}
                            className="img-fluid me-2"
                            alt=""
                            style={{
                              width: "30px",
                              height: "30px",
                              objectFit: "contain",
                            }}
                          />
                        </div>
                        {/* Content column */}
                        <div className="flex-grow-1">
                          <div className="fs-5 fw-normal text-body-emphasis page-title">
                            {item.title}
                          </div>

                          {isActive && (
                            <div className="mt-2">
                              <p className="text-secondary mb-0">
                                {item.description}
                              </p>

                              <button
                                type="button"
                                className="btn btn-dark rounded-pill px-4 mt-3"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  onGetStarted?.();
                                }}
                              >
                                Explore
                                <i className="fa-solid fa-arrow-right ms-2"></i>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section
        className="py-5"
        style={{
          backgroundColor: "#060B14",
        }}
      >
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-12 col-lg-8">
              <h2 className="display-4 fw-normal text-white mb-3 page-title">
                Everything you need for a smarter intraday experience.
              </h2>

              <p className="fs-6 text-white-50 mb-4">
                Useful features, clear information and a calmer visual hierarchy
                — designed around real trader workflows.
              </p>
            </div>
          </div>

          <div className="row g-3 d-none d-md-flex">
            {features.map((feature) => (
              <div className="col-12 col-md-6 col-lg-4" key={feature.title}>
                <div
                  className="rounded-4 p-4 h-100"
                  style={{
                    border: "1px solid #FFFFFF14",
                    background: "linear-gradient(180deg, #FFFFFF06, #FFFFFF04)",
                  }}
                >
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="img-fluid mb-4"
                    style={{
                      width: "48px",
                      height: "48px",
                      objectFit: "contain",
                    }}
                  />

                  <h3 className="fs-3 text-white fw-normal mb-2">
                    {feature.title}
                  </h3>

                  <p className="mb-0 text-white-50">{feature.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="feature-marquee d-md-none" aria-label="Features">
            <div className="feature-marquee__track">
              {[false, true].map((isDuplicate) => (
                <div
                  className="feature-marquee__group"
                  key={isDuplicate ? "duplicate" : "original"}
                  aria-hidden={isDuplicate ? "true" : undefined}
                >
                  {features.map((feature) => (
                    <div className="feature-marquee__item" key={feature.title}>
                      <div
                        className="rounded-4 p-4 h-100"
                        style={{
                          border: "1px solid #FFFFFF14",
                          background:
                            "linear-gradient(180deg, #FFFFFF06, #FFFFFF04)",
                        }}
                      >
                        <img
                          src={feature.image}
                          alt=""
                          className="img-fluid mb-4"
                          style={{
                            width: "48px",
                            height: "48px",
                            objectFit: "contain",
                          }}
                        />
                        <h3 className="fs-3 text-white fw-normal mb-2">
                          {feature.title}
                        </h3>
                        <p className="mb-0 text-white-50">{feature.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="row">
            <div className="col-12 text-center mt-4">
              <button type="button" onClick={onGetStarted} className="btn bg-white text-black fw-semibold rounded-pill py-2 px-3">
                Get Started Now
                <i className="fa-solid fa-arrow-right ms-2"></i>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= THREE STEPS ================= */}
      <section className="py-5">
        <div className="container">
          <div className="row justify-content-center text-center mb-5">
            <div className="col-12 col-lg-6">
              <h2 className="display-4 fw-normal text-body-emphasis mb-3 page-title">
                Your Path to Traders, in Three Simple Steps
              </h2>
            </div>
          </div>

          <div className="row g-3 justify-content-center bg-body-tertiary py-2 rounded-3">
            {steps.map((step, index) => (
              <div className="col-12 col-md-4 text-center" key={index}>
                <img
                  src={step.image}
                  alt={`Step ${index + 1}`}
                  className="img-fluid mb-3"
                  style={{
                    maxHeight: "120px",
                    // objectFit: "contain",
                  }}
                />

                <p className="text-body-emphasis">
                  {step.title}
                  <br />
                  {step.text}
                </p>
              </div>
            ))}
          </div>

          <div className="row">
            <div className="col-12 text-center mt-5">
              <button type="button" onClick={onGetStarted} className="btn bg-dark text-white fw-semibold rounded-pill py-2 px-3">
                Get Started Now
                <i className="fa-solid fa-arrow-right ms-2"></i>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section className="py-5 " id="intraday-faqs">
        <div className="container">
          <div className="row justify-content-center text-center mb-5">
            <div className="col-12 col-lg-8">
              <span
                className="badge rounded-pill px-3 py-2 fw-normal mb-3"
                style={{ backgroundColor: "#FFF5ED", color: "#F58011" }}
              >
                Intraday Trading FAQs
              </span>
              <h2 className="display-4 fw-normal text-body-emphasis mb-3 page-title">
                Questions About Our Intraday Trading Calls
              </h2>
              <p className="fs-5 text-body-secondary mb-0">
                Learn what the service covers, how calls are delivered and what
                to consider before subscribing.
              </p>
            </div>
          </div>

          <div className="row justify-content-center">
            <div className="col-12 col-lg-9">
              <div className="d-grid gap-3">
                {homePage3Faqs.map(({ question, answer }) => (
                  <details
                    className="card border-0 rounded-4 shadow-sm"
                    key={question}
                  >
                    <summary className="card-header bg-white border-0 rounded-4 p-4 fw-semibold">
                      {question}
                    </summary>
                    <div className="card-body pt-0 px-4 pb-4 text-body-secondary">
                      {answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= JOIN CTA ================= */}
      <section className="py-5">
        <div className="container">
          <div
            className="rounded-3 overflow-hidden"
            style={{
              backgroundColor: "#F6F6F6",
            }}
          >
            <div className="row g-0">
              {/* Left */}
              <div className="col-12 col-lg-5 p-3 p-lg-5">
                <h2 className="display-4 fw-normal text-body-emphasis mb-2 page-title">
                  Join Intraday Traders Today
                </h2>

                <p className="fs-6 text-body-secondary mb-3">
                  Get actionable research, real-time alerts and market insights
                  in one place.
                </p>

                {/* Store buttons */}
                <div className="row g-2 mb-4">
                  <div className="col-auto">
                    <a
                      className="btn btn-dark"
                      href={APP_STORE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Download Intraday Traders from the App Store"
                    >
                      <i className="bi bi-apple me-2" aria-hidden="true" />
                      App Store
                    </a>
                  </div>

                  <div className="col-auto">
                    <a
                      className="btn btn-dark"
                      href={GOOGLE_PLAY_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Download Intraday Traders from Google Play"
                    >
                      <i
                        className="bi bi-google-play me-2"
                        aria-hidden="true"
                      />
                      Google Play
                    </a>
                  </div>
                </div>

                {/* Mobile */}
                <div className="row">
                  <div className="col-12 col-md-12">
                    <form
                      onSubmit={handleMobileSubmit}
                      noValidate
                      className="input-group rounded-pill overflow-hidden"
                      style={{
                        border: "1px solid #dddddd",
                        backgroundColor: "#ffffff",
                      }}
                    >
                      <span className="input-group-text bg-white border-0">
                        <i className="fa-solid fa-grip"></i>
                      </span>

                      <input
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel-national"
                        maxLength="10"
                        pattern="[1-9][0-9]{9}"
                        required
                        aria-label="Mobile number"
                        title="Mobile number must not start with 0"
                        aria-invalid={startsWithZero || Boolean(mobileError)}
                        aria-describedby={startsWithZero || mobileError ? "home3-cta-mobile-error" : undefined}
                        className={`form-control form-control-sm border-0 shadow-none ${startsWithZero || mobileError ? "is-invalid" : ""}`}
                        placeholder="Enter your mobile number"
                        value={mobileNumber}
                        onChange={updateMobileNumber}
                      />

                      <button
                        type="submit"
                        disabled={sendingOtp}
                        className="btn rounded-pill px-4 shadow-sm"
                        style={{
                          backgroundColor: "#F78A18",
                        }}
                      >
                        {sendingOtp ? "Sending OTP..." : "Get Started"}
                      </button>
                    </form>
                    {(startsWithZero || mobileError) && (
                      <p className="small text-danger mt-2 mb-0" id="home3-cta-mobile-error" role="alert">
                        {startsWithZero
                          ? "Mobile number must not start with 0."
                          : mobileError}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right image */}
              <div className="col-12 col-lg-7 text-center">
                <img
                  src="/images/homepage-3/cta.png"
                  alt="Join Intraday Traders"
                  className="img-fluid w-100"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
