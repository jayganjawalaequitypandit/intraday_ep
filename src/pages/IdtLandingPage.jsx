import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { APP_STORE_URL, GOOGLE_PLAY_URL } from "../constants/appLinks.js";
import appQrImage from "../assets/idt-app-qr.png";
import appStoreHeroBadge from "../assets/app-store-hero.svg";
import googlePlayHeroBadge from "../assets/google-play-hero.svg";
import api from "../services/api.js";
import {
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
import heroDashboardImage from "../assets/idt-hero-dashboard.png";
import heroLiveCallsImage from "../assets/idt-hero-live-calls.png";
import heroSignalsImage from "../assets/idt-hero-signals.png";
import heroMarketPulseImage from "../assets/idt-hero-market-pulse.png";
import heroScansImage from "../assets/idt-hero-scans.png";
import heroStockPriceImage from "../assets/idt-hero-stock-price.png";
import marketPulseCardImage from "../assets/idt-market-pulse-card.svg";
import yearsTimelineArtwork from "../assets/idt-years-timeline.png";
import tradersArtwork from "../assets/container-5l-plus.svg";
import timelineMorningIcon from "../assets/idt-timeline-morning.svg";
import timelinePremarketIcon from "../assets/idt-timeline-premarket.svg";
import timelineOpeningBellIcon from "../assets/idt-timeline-opening-bell.svg";
import timelineTradingHoursIcon from "../assets/idt-timeline-trading-hours.svg";
import timelineMarketCloseIcon from "../assets/idt-timeline-market-close.svg";
import timelineAfterMarketIcon from "../assets/idt-timeline-after-market.svg";
import timelineEveningIcon from "../assets/idt-timeline-evening.svg";
import diyaImage from "../assets/Diya.gif";
import "./IdtLandingPage.css";

const DIWALI_OFFER_END = new Date("2026-11-08T14:20:00+05:30").getTime();

function DiwaliOfferCountdown({ campaign = false }) {
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    Math.max(0, Math.floor((DIWALI_OFFER_END - Date.now()) / 1000)),
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemainingSeconds(
        Math.max(0, Math.floor((DIWALI_OFFER_END - Date.now()) / 1000)),
      );
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const units = [
    { label: "DAYS", value: Math.floor(remainingSeconds / 86400) },
    { label: "HRS", value: Math.floor((remainingSeconds % 86400) / 3600) },
    { label: "MIN", value: Math.floor((remainingSeconds % 3600) / 60) },
    { label: "SEC", value: remainingSeconds % 60 },
  ];

  return (
    <div
      className={`${campaign ? "diwali-offer-countdown diwali-campaign-countdown " : ""}d-flex py-3 align-items-center gap-2`}
      role="timer"
      aria-label="Offer ends in"
    >
      {/* <span className="small text-dark me-1">{"Offer ends in:"}</span> */}
      {units.map(({ label, value }) => (
        <span
          className="diwali-offer-countdown-unit d-flex flex-column align-items-center justify-content-center"
          key={label}
        >
          <strong>{String(value).padStart(2, "0")}</strong>
          <small>{label}</small>
        </span>
      ))}
    </div>
  );
}

function IdtLandingPage({ onLogin, onOtpSent, notify }) {
  const dispatch = useDispatch();
  const [mobileNumbers, setMobileNumbers] = useState({ hero: "", final: "" });
  const [formMessages, setFormMessages] = useState({});
  const [loadingForm, setLoadingForm] = useState("");

  const handleMobileSubmit = async (event, formId) => {
    event.preventDefault();
    if (loadingForm) return;

    const mobileNumber = mobileNumbers[formId] || "";
    if (!isValidMobileNumber(mobileNumber)) {
      setFormMessages((current) => ({
        ...current,
        [formId]: "Enter a valid 10-digit Indian mobile number.",
      }));
      return;
    }

    setFormMessages((current) => ({ ...current, [formId]: "" }));
    setLoadingForm(formId);
    dispatch(setUapiCredentials({ token: null, user: null }));
    dispatch(setEapiCredentials({ token: null, user: null }));

    try {
      const response = await api.uapi.login({
        countryCode: "+91",
        mobile: mobileNumber,
        otpVia: "text",
        registeredVia: "web",
        source: getSource(),
      });
      assertSuccessfulResponse(
        response,
        "Unable to send OTP. Please check your mobile number and try again.",
      );
      dispatch(setUapiMobileNumber(mobileNumber));
      dispatch(setUapiOtpVia("text"));
      dispatch(setUapiLoginResponse(response));
      notify?.("success", response?.message || "OTP sent successfully");
      onOtpSent?.();
    } catch (requestError) {
      dispatch(setUapiCredentials({ token: null, user: null }));
      dispatch(setUapiLoginResponse(null));
      dispatch(setEapiCredentials({ token: null, user: null }));
      const message =
        requestError.message ||
        "Unable to send OTP. Please check your mobile number and try again.";
      setFormMessages((current) => ({ ...current, [formId]: message }));
      notify?.("error", message);
    } finally {
      setLoadingForm("");
    }
  };

  useEffect(() => {
    const root = document.querySelector(".idt-landing");
    if (!root) return undefined;

    root.querySelectorAll('[data-store="play"]').forEach((link) => {
      link.href = GOOGLE_PLAY_URL;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    });
    root.querySelectorAll('[data-store="ios"]').forEach((link) => {
      link.href = APP_STORE_URL;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    });

    const screenImages = [...root.querySelectorAll("#screen img[data-k]")];
    root.querySelectorAll("img[data-from]").forEach((image) => {
      const matchingScreen = screenImages.find(
        (screen) => screen.dataset.k === image.dataset.from,
      );
      if (matchingScreen) image.src = matchingScreen.src;
    });

    const tabs = [...root.querySelectorAll("#tabs .tab")];
    let activeTab = 0;
    const showTab = (index) => {
      activeTab = index;
      screenImages.forEach((image, imageIndex) =>
        image.classList.toggle("on", imageIndex === index),
      );
      tabs.forEach((tab, tabIndex) =>
        tab.classList.toggle("on", tabIndex === index),
      );
    };
    const tabListeners = tabs.map((tab, index) => {
      const listener = () => showTab(index);
      tab.addEventListener("click", listener);
      return listener;
    });

    const onReveal = () => {
      root.querySelector("#demo")?.classList.add("revealed");
      const button = root.querySelector("#revealBtn");
      if (button) {
        button.disabled = true;
        button.textContent = "✓ Revealed";
      }
    };
    const revealButton = root.querySelector("#revealBtn");
    revealButton?.addEventListener("click", onReveal);

    const faqItems = [...root.querySelectorAll(".faq-section details")];
    const faqToggleListeners = faqItems.map((item) => {
      const summary = item.querySelector("summary");
      const listener = () => {
        if (item.open) return;
        faqItems.forEach((otherItem) => {
          if (otherItem !== item) otherItem.open = false;
        });
      };
      summary?.addEventListener("click", listener);
      return { summary, listener };
    });

    const motionReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const carouselTimer =
      !motionReduced && screenImages.length > 1
        ? window.setInterval(
            () => showTab((activeTab + 1) % screenImages.length),
            4200,
          )
        : null;

    return () => {
      tabs.forEach((tab, index) =>
        tab.removeEventListener("click", tabListeners[index]),
      );
      revealButton?.removeEventListener("click", onReveal);
      faqToggleListeners.forEach(({ summary, listener }) =>
        summary?.removeEventListener("click", listener),
      );
      if (carouselTimer) window.clearInterval(carouselTimer);
    };
  }, []);

  return (
    <div className="idt-landing min-vh-100">
      <main id={"top"}>
        <div className={"hero"}>
          <div className={"bg"} aria-hidden={"true"}>
            <div className={"orb a"}></div>
            <div className={"orb b"}></div>
          </div>

          <div className={"wrap grid"}>
            <div className="">
              <span className={"eyebrow mono small"}>
                <i></i>
                <small className="d-md-none d-block">
                  {"SEBI Registered Research Analyst · INH000029829"}
                </small>
                <span className="d-md-block d-none">
                  {"SEBI Registered Research Analyst · INH000029829"}
                </span>
              </span>
              <h1 className="fw-bold">
                {window.location.href.includes("idt-landing-page") ? (
                  <>
                    Get Your
                    <br />
                    <em>Free Trades.</em>
                  </>
                ) : (
                  <>
                    Don't Trade
                    <br />
                    <em>Blindly.</em>
                  </>
                )}
              </h1>

              <p>
                Receive Trading Recommendations From A SEBI-registered Research
                Analyst, including Entry , Targets, SL & Timely Follow-up
                Updates During Live Market Hours.
              </p>

              <div className={"install py-4 text-center"} id={"install"}>
                <div className={"getrow"}>
                  <div className={"link-panel mt-md-2 "}>
                    <div className={"mb-2 text-center fw-semibold"}>
                      {/* {"Enter Mobile No. "} */}
                      {"Get FREE Intraday Trades."}
                    </div>
                    <form
                      className={"sms d-flex gap-3"}
                      data-form={"hero"}
                      noValidate
                      onSubmit={(event) => handleMobileSubmit(event, "hero")}
                    >
                      <label className={"field"}>
                        <span className={"cc"}>{"+91"}</span>
                        <input
                          type={"tel"}
                          inputMode={"numeric"}
                          maxLength={"10"}
                          aria-label={"Mobile number"}
                          autoComplete={"tel-national"}
                          value={mobileNumbers.hero}
                          onChange={(event) => {
                            const value = event.target.value
                              .replace(/\D/g, "")
                              .slice(0, 10);
                            setMobileNumbers((current) => ({
                              ...current,
                              hero: value,
                            }));
                            setFormMessages((current) => ({
                              ...current,
                              hero: "",
                            }));
                          }}
                        />
                      </label>
                      <button
                        className={"btn pri"}
                        type={"submit"}
                        disabled={loadingForm === "hero"}
                      >
                        {loadingForm === "hero" ? "Sending OTP…" : "Continue"}
                      </button>
                    </form>
                    <div
                      className={`msg${formMessages.hero ? " err" : ""}`}
                      role={"status"}
                    >
                      {formMessages.hero}
                    </div>
                  </div>

                  <div className={"or hero-or"} aria-hidden={"true"}>
                    {"OR"}
                  </div>
                  <div className={" mb-3 mb-md-0 fw-semibold"}>
                    {"Download The App"}
                  </div>

                  <div className={"download-group "}>
                    <div className={"stores d-flex flex-wrap"}>
                      {/* <a className={"store store-badge"} id={"storePlay"} href={GOOGLE_PLAY_URL} target={"_blank"} rel={"noopener noreferrer"} data-store={"play"} data-ev={"store_play"} aria-label={"Get it on Google Play"}>
                      <img src={googlePlayHeroBadge} alt="Get it on Google Play" width={186} height={52} />
                    </a>
                    <a className={"store store-badge"} id={"storeIos"} href={APP_STORE_URL} target={"_blank"} rel={"noopener noreferrer"} data-store={"ios"} data-ev={"store_ios"} aria-label={"Download on the App Store"}>
                      <img src={appStoreHeroBadge} alt="Download on the App Store" width={186} height={51} />
                    </a> */}
                      <a
                        className={"store"}
                        data-store={"play"}
                        href={GOOGLE_PLAY_URL}
                        target={"_blank"}
                        rel={"noopener noreferrer"}
                        data-ev={"final_play"}
                      >
                        <svg viewBox={"0 0 24 24"}>
                          <path
                            d={
                              "M3.6 2.2c-.3.2-.5.6-.5 1.1v17.4c0 .5.2.9.5 1.1l9.7-9.8zM14.4 12.9l2.6 2.6-11.7 6.6zM17.8 8.4l3.1 1.8c.9.5.9 1.6 0 2.1l-3.1 1.8-2.9-2.9zM5.3 1.9l11.7 6.6-2.6 2.6z"
                            }
                          />
                        </svg>
                        <span>
                          <small>{"GET IT ON"}</small>
                          <b>{"Google Play"}</b>
                        </span>
                      </a>

                      <a
                        className={"store"}
                        data-store={"ios"}
                        href={APP_STORE_URL}
                        target={"_blank"}
                        rel={"noopener noreferrer"}
                        data-ev={"final_ios"}
                      >
                        <svg viewBox={"0 0 24 24"}>
                          <path
                            d={
                              "M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9s-1.8-.8-3-.8c-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.8 3-.8s1.8.8 3 .7c1.3 0 2.1-1.1 2.8-2.3.9-1.3 1.3-2.600 1.300-2.700 0 0-2.500-1-2.500-3.600zM14.200 5.800c.6-.8 1.100-1.800.9-2.900-.9 0-2 .6-2.700 1.400-.6.700-1.100 1.800-1 2.800 1 .1 2.100-.5 2.800-1.300z"
                            }
                          />
                        </svg>
                        <span>
                          <small>{"DOWNLOAD ON"}</small>
                          <b>{"App Store"}</b>
                        </span>
                      </a>
                    </div>

                    <div
                      className={"qrcard"}
                      aria-label={"Scan to install the IDT app"}
                    >
                      <div
                        className={"qrbox"}
                        data-qr={"hero"}
                        role={"img"}
                        aria-label={"QR code to install the IDT app"}
                      >
                        <img
                          src={appQrImage}
                          alt={"Scan to install the IDT app"}
                          width={480}
                          height={480}
                        />
                      </div>
                      <small>
                        {"Scan with your"}
                        <br />
                        {"phone camera"}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={"stage ms-md-5"}>
              <div className={"chip c1"}>
                <small>{"🔔 Target 2 Achieved"}</small>
                <b
                  className={"num fw-semibold"}
                  style={{ fontSize: "13px", lineHeight: 1.35 }}
                >
                  {"Ramcocem (T2 : 758.52,"}
                  <br />
                  {"CMP : 757.35)"}
                </b>
              </div>

              <div className={"chip c2"}>
                <small>{"FII · DII (13 OCT)"}</small>
                <b className={"num fw-semibold"}>
                  <span style={{ color: "var(--dn)" }}>{"−₹1,305"}</span>
                  {" · "}
                  <span style={{ color: "var(--up)" }}>{"+₹2,439"}</span>
                  {" Cr"}
                </b>
              </div>

              <div className={"chip c3"}>
                <small>{"NIFTY 50"}</small>
                <b className={"num fw-semibold"}>
                  {"22,363.35 "}
                  <span style={{ color: "var(--dn)", fontSize: "13px" }}>
                    {"−0.70%"}
                  </span>
                </b>
              </div>

              <div className={"phone"}>
                <div className={"screen"} id={"screen"}>
                  <img
                    className={"on"}
                    data-k={"app-home"}
                    src={heroDashboardImage}
                    alt={"IDT app dashboard"}
                    width={"495"}
                    height={"1007"}
                  />

                  <img
                    data-k={"app-calls"}
                    src={heroLiveCallsImage}
                    alt={"IDT live calls with trade updates"}
                    width={"495"}
                    height={"1007"}
                    loading={"lazy"}
                  />

                  <img
                    data-k={"app-signals"}
                    src={heroSignalsImage}
                    alt={"IDT trading signals for cash and futures"}
                    width={"495"}
                    height={"1007"}
                    loading={"lazy"}
                  />

                  <img
                    data-k={"app-pulse"}
                    src={heroMarketPulseImage}
                    alt={"IDT market pulse and institutional flows"}
                    width={"495"}
                    height={"1007"}
                    loading={"lazy"}
                  />

                  <img
                    data-k={"app-scans"}
                    src={heroScansImage}
                    alt={"IDT intraday scans"}
                    width={"495"}
                    height={"1007"}
                    loading={"lazy"}
                  />

                  <img
                    data-k={"app-plans"}
                    src={heroStockPriceImage}
                    alt={"IDT stock price analysis"}
                    width={"742"}
                    height={"1511"}
                    loading={"lazy"}
                  />
                </div>
              </div>

              <div className={"tabs"} id={"tabs"} role={"tablist"}>
                <button className={"tab on"} role={"tab"} data-i={"0"}>
                  {"Dashboard"}
                </button>
                <button className={"tab"} role={"tab"} data-i={"1"}>
                  {"Live calls"}
                </button>
                <button className={"tab"} role={"tab"} data-i={"2"}>
                  {"Signals"}
                </button>
                <button className={"tab"} role={"tab"} data-i={"3"}>
                  {"Market pulse"}
                </button>
                <button className={"tab"} role={"tab"} data-i={"4"}>
                  {"Scans"}
                </button>
                <button className={"tab"} role={"tab"} data-i={"5"}>
                  {"Stock Price"}
                </button>
              </div>
            </div>
          </div>
        </div>
        <section className={"inst py-5"}>
          <div className={"wrap grid"}>
            <div className={"inst-copy rv"}>
              <span className={"kick mono"}>{"WHERE THE BIG MONEY LOOKS"}</span>

              <h2 className="fs-1 fw-semibold">
                {"See The Market The Way Professional Traders Do"}
              </h2>

              <p>
                Understand where the market is heading before your next trade.
                IDT brings together institutional money flows, market sentiment,
                NIFTY trends, volatility, and advanced market intelligence to
                help you spot opportunities with greater clarity and confidence.
              </p>
            </div>
            <div className={"market-pulse-visual rv"}>
              <img
                className={"market-pulse-card"}
                src={marketPulseCardImage}
                alt={
                  "Market pulse dashboard showing market sentiment, FII and DII activity, India VIX, and market breadth"
                }
                width={"607"}
                height={"557"}
                loading={"lazy"}
              />
            </div>
            <div className={" mt-0"}>
              <button
                className={"btn pri big"}
                type="button"
                onClick={onLogin}
                data-ev={"edge_install"}
              >
                {"Get The Next Trade Now"}
              </button>
            </div>
          </div>
        </section>
        <section className="container py-5 px-3 asset-class-section">
          <div className="text-center mb-4">
            <h2 className="fs-1 fw-semibold mb-0">
              SEBI-Registered Research Analyst.
            </h2>
            <h2 className="fs-1 fw-semibold mb-0">Every Asset Class</h2>
          </div>

          <div className="row flex-nowrap flex-lg-wrap overflow-x-auto asset-class-row">
            {/* Index Options */}
            <div className="col-8 col-sm-6 col-lg-3">
              <div
                className="index-options-gradient rounded-4 text-white p-3 position-relative overflow-hidden h-100"
                style={{ minHeight: "200px" }}
              >
                <div className="position-relative w-75">
                  <h4 className="fw-bold mb-2">Index Options</h4>
                  <p className="small mb-0">
                    Index and stock options recommendations.
                  </p>
                </div>

                <img
                  src="/images/index-options-icon.svg"
                  alt="Index Options"
                  className="position-absolute bottom-0 end-0 object-fit-contain"
                  style={{ width: "200px", height: "170px" }}
                />
              </div>
            </div>

            {/* Stock Options */}
            <div className="col-8 col-sm-6 col-lg-3">
              <div
                className="stock-options-gradient rounded-4 text-white p-3 position-relative overflow-hidden h-100"
                style={{ minHeight: "200px" }}
              >
                <div className="position-relative w-75">
                  <h4 className="fw-bold mb-2">Stock Options</h4>
                  <p className="small mb-0">
                    Futures signals with defined risk levels.
                  </p>
                </div>

                <img
                  src="/images/stock-options-icon.svg"
                  alt="Stock Options"
                  className="position-absolute bottom-0 end-0 object-fit-contain"
                  style={{ width: "200px", height: "180px" }}
                />
              </div>
            </div>

            {/* Cash Intraday */}
            <div className="col-8 col-sm-6 col-lg-3">
              <div
                className="cash-intraday-gradient rounded-4 text-white p-3 position-relative overflow-hidden h-100"
                style={{ minHeight: "200px" }}
              >
                <div className="position-relative w-75">
                  <h4 className="fw-bold mb-2">Cash Intraday</h4>
                  <p className="small mb-0">
                    Buy and sell ideas with targets and stop-loss.
                  </p>
                </div>

                <img
                  src="/images/cash-intraday-icon.svg"
                  alt="Cash Intraday"
                  className="position-absolute bottom-0 end-0 object-fit-contain"
                  style={{ width: "200px", height: "180px" }}
                />
              </div>
            </div>

            {/* Stock Futures */}
            <div className="col-8 col-sm-6 col-lg-3">
              <div
                className="stock-futures-gradient rounded-4 text-white p-3 position-relative overflow-hidden h-100"
                style={{ minHeight: "200px" }}
              >
                <div className="position-relative w-75">
                  <h4 className="fw-bold mb-2">Stock Futures</h4>
                  <p className="small mb-0">
                    Futures signals with defined risk levels.
                  </p>
                </div>

                <img
                  src="/images/stock-futures-icon.svg"
                  alt="Stock Futures"
                  className="position-absolute bottom-0 end-0 object-fit-contain"
                  style={{ width: "200px", height: "180px" }}
                />
              </div>
            </div>
          </div>

          <div className={"cta-center"}>
            <button
              className={"btn pri"}
              type="button"
              onClick={onLogin}
              data-ev={"timeline_install"}
            >
              {"Get Started Now"}
            </button>
          </div>
        </section>

        <section className={"inst py-4 market-prediction-section"}>
          <div className={"wrap grid"}>
            <div className={""}>
              <h2 className="fs-1 fw-semibold">
                Today's Stock Market Prediction & Analysis
              </h2>
              <p>
                {
                  "Stay ahead of the stock market with EquityPandit's daily market predictions. Get expert analysis, NIFTY, SENSEX, BANKNIFTY and FINNIFTY trends, support and resistance levels, and expected market ranges to understand the market outlook and make informed trading decisions."
                }
              </p>
              <div className={"cta-row d-flex flex-wrap mt-5"}>
                <button
                  className={"btn pri big"}
                  type="button"
                  onClick={onLogin}
                  data-ev={"market_prediction_login"}
                >
                  {"View Market Prediction"}
                </button>
              </div>
            </div>
            <div className={" rv"}>
              <img
                className={"market-pulse-card"}
                src={"/images/market_prediction.svg"}
                alt={"Market prediction dashboard with daily trading levels"}
                width={"607"}
                height={"473"}
                loading={"lazy"}
              />
            </div>
          </div>
        </section>

        <section className={"idt-dayline py-5"} id={"dayline"}>
          <div className={"wrap"}>
            <div className={"text-center"}>
              <span className="fw-semibold fs-1 mb-md-3">
                {
                  "From morning market updates to evening insights and late-night financial developments, the IDT app keeps you informed 24/7."
                }
              </span>
            </div>
            <div className={"idt-dayline-track mt-5 dashboard-indices-scroll"}>
              <article>
                <b>{"Morning"}</b>
                <img src={timelineMorningIcon} alt={""} aria-hidden={true} />
                <strong>{"Morning Brief"}</strong>
                <small>{"Overnight news & market outlook"}</small>
              </article>
              <article>
                <b>{"Pre-Market"}</b>
                <img src={timelinePremarketIcon} alt={""} aria-hidden={true} />
                <strong>{"Predictions & Prep"}</strong>
                <small>{"Market predictions & pre-market trends"}</small>
              </article>
              <article>
                <b>{"Opening Bell"}</b>
                <img
                  src={timelineOpeningBellIcon}
                  alt={""}
                  aria-hidden={true}
                />
                <strong>{"Market Opens"}</strong>
                <small>{"Opening movements & live trade ideas"}</small>
              </article>
              <article>
                <b>{"Trading Hours"}</b>
                <img
                  src={timelineTradingHoursIcon}
                  alt={""}
                  aria-hidden={true}
                />
                <strong>{"Live Trade Updates"}</strong>
                <small>{"Real-time updates & opportunities"}</small>
              </article>
              <article>
                <b>{"Market Close"}</b>
                <img
                  src={timelineMarketCloseIcon}
                  alt={""}
                  aria-hidden={true}
                />
                <strong>{"Closing Summary"}</strong>
                <small>{"Next-session summary & sector highlights"}</small>
              </article>
              <article>
                <b>{"After Market"}</b>
                <img
                  src={timelineAfterMarketIcon}
                  alt={""}
                  aria-hidden={true}
                />
                <strong>{"Data Analysis"}</strong>
                <small>{"Prepare ideas for the next session"}</small>
              </article>
              <article>
                <b>{"Evening"}</b>
                <img src={timelineEveningIcon} alt={""} aria-hidden={true} />
                <strong>{"Financial Events"}</strong>
                <small>{"Economic releases & key events"}</small>
              </article>
              <article>
                <b>{"Night"}</b>
                <i className={"bi bi-moon-stars-fill"} aria-hidden={true}></i>
                <strong>{"Daily News & Updates"}</strong>
                <small>{"Important financial news of the day"}</small>
              </article>
            </div>
            <div className={"cta-center"}>
              <button
                className={"btn pri"}
                type="button"
                onClick={onLogin}
                data-ev={"timeline_install"}
              >
                {"Get Started Now"}
              </button>
            </div>
          </div>
        </section>

        <section className={"proofsec py-5"} id={"proof"}>
          <div className={"wrap"}>
            <div className={"sec-h rv mb-3"}>
              <span className={"kick mono"}>
                {"WHY TRADERS TRUST EQUITYPANDIT"}
              </span>
              <h2 className="fw-semibold">
                {"Experience You Can Lean On, Every Single Session."}
              </h2>
            </div>
            <p className="text-center mb-5">
              {
                "Two decades of market cycles, lakhs of traders, four segments and round-the-clock alerts—all in one app."
              }
            </p>

            <div className={"pgrid"}>
              <div className={"pc c1 pa rv"}>
                <span className={"lab mono"}>{"YEARS IN THE MARKET"}</span>

                <b className={"big num"} data-count={"21"} data-suf={"+"}>
                  {"21+"}
                </b>

                <h3>{"Years of research experience"}</h3>
                <p>
                  {
                    "We have watched markets through crashes, rallies and everything in between, and the same desk advises institutions, HNIs and UHNIs. That judgement now sits behind every trade."
                  }
                </p>

                <img
                  className={"proof-card-art years-art"}
                  src={yearsTimelineArtwork}
                  alt={
                    "Market timeline showing 21 years of experience from 2005 to today"
                  }
                  width={1931}
                  height={490}
                  loading={"lazy"}
                />
              </div>

              <div className={"pc c2 pb rv"}>
                <span className={"lab mono"}>{"TRADERS & INVESTORS"}</span>

                <b className={"big num"} data-count={"5"} data-suf={"L+"}>
                  {"5L+"}
                </b>

                <h3>{"Lakhs of traders and investors"}</h3>
                <p>
                  {"A community that follows EquityPandit research every day."}
                </p>

                <img
                  className={"proof-card-art traders-art"}
                  src={tradersArtwork}
                  alt={"Illustration representing the IDT trader community"}
                  width={455}
                  height={97}
                  loading={"lazy"}
                />
              </div>

              <div className={"pc c3 pcx rv"}>
                <span className={"lab mono"}>{"SEGMENTS COVERED"}</span>

                <b
                  className={"big"}
                  data-count={"4"}
                  style={{
                    color:
                      "linear-gradient(100deg, #FFD3EA 6.84%, #FF6FB5 71.58%)",
                  }}
                >
                  {"4"}
                </b>

                <h3>{"Four segments. One app."}</h3>
                <p>{"Buy and sell trades across every part of intraday."}</p>

                <div className={"segs"}>
                  <div className={"sg"}>
                    <i>{"✓"}</i>
                    <span>
                      {"Index options"}
                      <small>{"NIFTY, BANK NIFTY"}</small>
                    </span>
                  </div>
                  <div className={"sg"}>
                    <i>{"✓"}</i>
                    <span>
                      {"Stock options"}
                      <small>{"Buy and sell"}</small>
                    </span>
                  </div>
                  <div className={"sg"}>
                    <i>{"✓"}</i>
                    <span>
                      {"Stock futures"}
                      <small>{"Buy and sell"}</small>
                    </span>
                  </div>
                  <div className={"sg"}>
                    <i>{"✓"}</i>
                    <span>
                      {"Cash intraday"}
                      <small>{"Buy and sell"}</small>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="registration-badge bg-white shadow-sm border rounded-4 py-md-3 mt-5">
              <div className="registration-badge-content text-center fw-semibold">
                <span className="d-md-block d-none">
                  <i
                    className="fa-solid fa-circle-check text-success me-3"
                    aria-hidden="true"
                  />{" "}
                  EquityPandit · SEBI Registered Research Analyst · INH000029829
                </span>
                <span className="d-flex d-md-none registration-badge-mobile">
                  <i
                    className="fa-solid fa-circle-check text-success me-2"
                    aria-hidden="true"
                  />
                  <span>
                    EquityPandit · SEBI Registered Research Analyst ·
                    INH000029829
                  </span>
                </span>
              </div>
            </div>
            <div className="registration-cta-wrap d-md-none">
              <button
                className="btn pri"
                type="button"
                onClick={onLogin}
                data-ev={"registration_get_started"}
              >
                {"Get Started Now"}
              </button>
            </div>
          </div>
        </section>

        <section className={"faq-section py-5"} id={"faq"}>
          <div className={"wrap"}>
            <div className={"sec-h rv"}>
              <h2 className="fw-semibold">{"Frequently Asked Questions"}</h2>
              <p>{"Questions On Your Mind? Dont Worry We Have The Answers!"}</p>
            </div>

            <div className={"faq rv"}>
              <details>
                <summary>{"Who is behind IDT?"}</summary>
                <p>
                  {
                    "IDT is built by EquityPandit, a SEBI Registered Research Analyst (INH000029829) with 21+ years in the market. The same desk provides research and investment advisory to institutions, HNIs and UHNIs, and IDT brings that discipline to intraday traders."
                  }
                </p>
              </details>
              {"\n    \n    "}
              <details>
                <summary>{"What makes IDT different?"}</summary>
                <p>
                  {
                    "Most services send you a tip. IDT shows you the whole picture: where institutional money is moving, what the numbers say, and a trade built on it, with a plan for the exit. It all sits in one app, in plain language, from a desk that has watched markets for over 21 years."
                  }
                </p>
              </details>

              <details>
                <summary>{"What do I get for free?"}</summary>
                <p>
                  {
                    "Install the app free and see every trade's levels and profit. You also get one free trade of the day and one free name reveal each day. Subscribe to unlock every stock and contract name."
                  }
                </p>
              </details>

              <details>
                <summary>{"How much does it cost?"}</summary>
                <p>
                  {
                    "₹999 for 1 month, ₹2,697 for 3 months or ₹7,992 for 12 months. That works out to ₹33, ₹30 and ₹22 a day."
                  }
                </p>
              </details>

              <details>
                <summary>{"How do I receive the trades?"}</summary>
                <p>
                  {
                    "Inside the app, with instant notifications the moment a trade is published and live updates when a target or stop-loss is hit."
                  }
                </p>
              </details>
              {"\n    \n    \n  "}
            </div>
          </div>
        </section>

        <section
          className="diwali-feature rounded-4 py-2 d-none"
          aria-labelledby="diwali-feature-title"
        >
          <div className="container-fluid px-3 px-md-5">
            <div className="row align-items-center justify-content-between g-4 g-lg-5">
              <div className="col-12 col-lg-7 order-0 order-lg-0">
                <span className="diwali-feature-badge badge rounded-pill px-3 py-2 mb-3">
                  {"HAPPY DIWALI"}
                </span>
                <h2
                  className="diwali-feature-title fw-semibold mb-4"
                  id="diwali-feature-title"
                >
                  {"Free Muhurat Trades for"}
                  <br className="d-none d-xl-block" />
                  {" Options, Cash & Stock Futures!"}
                  <span className="d-block mt-3">
                    {"Only on IntradayTraders™ App"}
                  </span>
                </h2>
                <div className="diwali-feature-actions order-2 order-lg-1 d-flex flex-column flex-md-row align-items-md-center gap-3 mt-5">
                  <button
                    className="diwali-download-btn btn rounded-pill fw-semibold d-inline-flex align-items-center justify-content-center gap-2"
                    type="button"
                    onClick={onLogin}
                    data-ev="diwali_offer_download"
                  >
                    <img src={diyaImage} alt="" aria-hidden="true" />
                    {"Download Now"}
                  </button>
                  <span
                    className="diwali-countdown-divider d-none d-md-block"
                    aria-hidden="true"
                  />
                  <DiwaliOfferCountdown />
                </div>
              </div>
              <div className="col-12 col-lg-4">
                <img
                  className="diwali-feature-art img-fluid"
                  src="/images/offer_banner_1.svg"
                  alt="Diwali offer: free Muhurat trades across options, cash intraday and stock futures"
                  width={400}
                  height={400}
                />
              </div>
            </div>
          </div>
        </section>

        <section
          className="diwali-campaign-section d-none py-4 py-md-5"
          aria-labelledby="diwali-campaign-title"
        >
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-12">
                <h2 className="visually-hidden" id="diwali-campaign-title">
                  {"Happy Diwali: Free Muhurat trades"}
                </h2>
                <div className="diwali-campaign-frame position-relative mx-auto">
                  <picture className="diwali-campaign-picture d-block mx-auto">
                    <source
                      media="(max-width: 767px)"
                      srcSet="/images/diwali_section_mobile.png"
                    />
                    <img
                      src="/images/diwali_section_web.png"
                      alt="Happy Diwali. Free Muhurat trades for options, cash and stock futures, only on the IntradayTraders app."
                      className="diwali-campaign-image img-fluid"
                    />
                  </picture>
                  <div className="diwali-campaign-actions d-flex flex-column flex-md-row justify-content-center align-items-center gap-3">
                    <button
                      className="diwali-campaign-download btn rounded-pill d-inline-flex align-items-center justify-content-center gap-2"
                      type="button"
                      onClick={onLogin}
                      data-ev="diwali_campaign_download"
                    >
                      <img src={diyaImage} alt="" aria-hidden="true" />
                      {"Download Now"}
                    </button>
                    <span
                      className="diwali-campaign-divider d-none d-md-block"
                      aria-hidden="true"
                    />
                    <DiwaliOfferCountdown campaign />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className={"bg-white"}>
          <div className={"wrap p-md-5 p-3"}>
            <div className={"band p-md-5"}>
              <h2 className="fw-semibold">
                {"See The Next Trade Before It Moves."}
              </h2>

              <p>
                {
                  "Install IDT free. Your co-pilot for every session, from ₹22 a day."
                }
              </p>

              <div className={"qrcard bandqr"}>
                <div
                  className={"qrbox"}
                  data-qr={"final"}
                  role={"img"}
                  aria-label={"QR code to install the IDT app"}
                >
                  <img
                    src={appQrImage}
                    alt={"Scan to install the IDT app"}
                    width={480}
                    height={480}
                  />
                </div>
                <small>{"Scan with your phone camera to install"}</small>
              </div>

              <div className={"stores d-flex flex-wrap gap-2"}>
                <a
                  className={"store"}
                  data-store={"play"}
                  href={GOOGLE_PLAY_URL}
                  target={"_blank"}
                  rel={"noopener noreferrer"}
                  data-ev={"final_play"}
                >
                  <svg viewBox={"0 0 24 24"}>
                    <path
                      d={
                        "M3.6 2.2c-.3.2-.5.6-.5 1.1v17.4c0 .5.2.9.5 1.1l9.7-9.8zM14.4 12.9l2.6 2.6-11.7 6.6zM17.8 8.4l3.1 1.8c.9.5.9 1.6 0 2.1l-3.1 1.8-2.9-2.9zM5.3 1.9l11.7 6.6-2.6 2.6z"
                      }
                    />
                  </svg>
                  <span>
                    <small>{"GET IT ON"}</small>
                    <b>{"Google Play"}</b>
                  </span>
                </a>

                <a
                  className={"store"}
                  data-store={"ios"}
                  href={APP_STORE_URL}
                  target={"_blank"}
                  rel={"noopener noreferrer"}
                  data-ev={"final_ios"}
                >
                  <svg viewBox={"0 0 24 24"}>
                    <path
                      d={
                        "M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9s-1.8-.8-3-.8c-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.8 3-.8s1.8.8 3 .7c1.3 0 2.1-1.1 2.8-2.3.9-1.3 1.3-2.600 1.300-2.700 0 0-2.500-1-2.500-3.600zM14.200 5.800c.6-.8 1.100-1.800.9-2.900-.9 0-2 .6-2.700 1.400-.6.700-1.100 1.800-1 2.800 1 .1 2.100-.5 2.800-1.300z"
                      }
                    />
                  </svg>
                  <span>
                    <small>{"DOWNLOAD ON"}</small>
                    <b>{"App Store"}</b>
                  </span>
                </a>
              </div>

              <div className={"or"}>{"OR"}</div>

              <div className={"link-panel final-link-panel"}>
                {/* <div className={"link-label"}>{"Enter Mobile No."}</div> */}
                <div className={"link-label fw-semibold"}>
                  {"Get FREE Intraday Trades."}
                </div>
                <form
                  className={"sms d-flex gap-2"}
                  data-form={"final"}
                  noValidate
                  onSubmit={(event) => handleMobileSubmit(event, "final")}
                >
                  <label className={"field"}>
                    <span className={"cc"}>{"+91"}</span>
                    <input
                      type={"tel"}
                      inputMode={"numeric"}
                      maxLength={"10"}
                      aria-label={"Mobile number"}
                      value={mobileNumbers.final}
                      onChange={(event) => {
                        const value = event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10);
                        setMobileNumbers((current) => ({
                          ...current,
                          final: value,
                        }));
                        setFormMessages((current) => ({
                          ...current,
                          final: "",
                        }));
                      }}
                    />
                  </label>

                  <button
                    className={"btn pri"}
                    type={"submit"}
                    disabled={loadingForm === "final"}
                  >
                    {loadingForm === "final" ? "Sending OTP…" : "Continue"}
                  </button>
                </form>
                <div
                  className={`msg${formMessages.final ? " err" : ""}`}
                  role={"status"}
                >
                  {formMessages.final}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default IdtLandingPage;
