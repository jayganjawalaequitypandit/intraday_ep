import phonePreview from "../assets/intraday-pro-phone-orange.png";
import realtimeTradingAlerts from "../assets/realtime-trading-alerts.png";
import heroPhones from "../assets/intraday-traders-hero-phones.png";
import downloadAppPhones from "../assets/download-app-phones.png";
import { APP_STORE_URL, GOOGLE_PLAY_URL } from "../constants/appLinks.js";

const steps = [
  [
    "1",
    "bi-search",
    "We analyse the market",
    "Our research team reviews price action, technicals and market context to identify intraday opportunities.",
    { backgroundColor: "#FFF2E8", color: "#D85F00" },
  ],
  [
    "2",
    "bi-bullseye",
    "You get clear recommendations",
    "Receive calls with simple entry, target and stop-loss levels with the information required to act.",
    { backgroundColor: "#F1ECFF", color: "#7148D8" },
  ],
  [
    "3",
    "bi-graph-up-arrow",
    "Track, learn and improve",
    "Follow outcomes, review past calls and understand performance over time from one place.",
    { backgroundColor: "#FFF0DC", color: "#CF781A" },
  ],
];

const features = [
  [
    "bi-lightning-charge",
    "Intraday Calls",
    "Buy/Sell recommendations with clear levels.",
    { backgroundColor: "#ECF9EF", color: "#31A24C" },
  ],
  [
    "bi-crosshair",
    "Entry, Target & SL",
    "Defined levels for better decision making.",
    { backgroundColor: "#F0EBFF", color: "#7C4CE5" },
  ],
  [
    "bi-broadcast",
    "Live Updates",
    "Instant alerts for important changes.",
    { backgroundColor: "#FFF1DF", color: "#F28B22" },
  ],
  [
    "bi-bar-chart-line",
    "Market Insights",
    "Nifty, Bank Nifty and sector views.",
    { backgroundColor: "#EAF3FF", color: "#3679E8" },
  ],
  [
    "bi-bell",
    "App Notifications",
    "Never miss an important research call.",
    { backgroundColor: "#FFEAF2", color: "#D75386" },
  ],
  [
    "bi-clock-history",
    "Research History",
    "Review past calls and outcomes.",
    { backgroundColor: "#FFF7D9", color: "#B98700" },
  ],
];

const faqs = [
  [
    "What is Intraday Traders?",
    "Intraday Traders is a research service by EquityPandit that provides structured intraday recommendations, market insights and timely updates to help subscribers make informed trading decisions.",
  ],
  [
    "How do I receive the calls?",
    "Research calls and follow-up updates are available through the Intraday Traders app. Enable app notifications so you can receive alerts when a new recommendation or important update is published.",
  ],
  [
    "Is there a mobile app?",
    // "Yes. The Intraday Traders Android app is available on Google Play. Sign in with the same mobile number used for your subscription. The iOS download option will be enabled when the App Store version is available.",
    "Yes. The Intraday Traders Android app is available on Google Play. Sign in with the same mobile number used for your subscription.",
  ],
  [
    "Which segments do you cover?",
    "The service covers Nifty and Bank Nifty Index Options, selected Stock Options, Cash Intraday opportunities and Stock Futures. Available recommendations may vary according to market conditions.",
  ],
  [
    "How much does it cost?",
    "Current subscription plans and prices are displayed after you sign in. Select a plan to review its price, duration and renewal details before completing payment.",
  ],
  // [
  //   "Do you guarantee profits?",
  //   "No. Trading and investing in securities involve market risk, and no profit or return can be guaranteed. Review each recommendation carefully and make decisions according to your objectives, financial situation and risk tolerance.",
  // ],
];

function BootstrapHomePage({ onGetStarted }) {
  return (
    <main id="main-content" className="bg-white overflow-x-hidden">
      <section className="py-3 overflow-hidden">
        <div className="container">
          <div className="row align-items-center justify-content-center justify-content-md-between g-5">
            <div className="col-12 col-lg-7">
              <span className="badge rounded-pill bg-warning-subtle text-warning-emphasis px-3 py-2 mb-3">
                SEBI Registered Research Analyst · INH000029829
              </span>
              <h1 className="display-3 fw-bold lh-2 mb-4">
                {/* Intraday Research &amp; Market Alerts{" "} */}
                {/* Get Live Intraday Trades{" "} */}
                Know What to Trade. {" "}
                <span
                  style={{
                    background:
                      "linear-gradient(180deg, #FE7902 0%, #F6530B 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {/* In One App. */}
                  {/* Daily. */}
                  Before You Trade
                </span>{" "}
              </h1>
              <p className="lead text-secondary fs-4">
                {/* Options Recommendations from Experienced Research Analysts &amp;
                Trade Signals for Cash &amp; Stock Futures Intraday */}
                {/* Access analyst research, structured trade levels, timely app
                notifications and research history wherever you trade. */}
                Actionable Intraday Recommendations <br className="d-none d-md-block"/> for Options, Cash & Stock Futures
              </p>
              <p className="small text-secondary mb-4">
                <i className="fa-solid fa-circle-check text-success"></i>{" "}
                {/* Real-time calls &nbsp;{" "} */}
                Entry Price &nbsp;{" "}
                <i className="fa-solid fa-circle-check text-success"></i>{" "} 
                {/* Expert research &nbsp;{" "} */}
                Target &nbsp;{" "}
                <i className="fa-solid fa-circle-check text-success"></i> {" "}
                Stop Loss &nbsp;{" "}
                <br className="d-md-none d-block"/>
                <i className="fa-solid fa-circle-check text-success mt-2 mt-md-0"></i> {" "}
                {/* Clear trade levels */}
                Expert Analysis
              </p>
              <div className="d-grid d-sm-flex gap-3 mb-4">
                <button
                  className="btn btn-warning btn-lg px-4"
                  type="button"
                  onClick={onGetStarted}
                >
                  {/* Get started for <strike className="fs-6"> &#8377;2999</strike> <span className="fs-5 fw-bold"> &#8377;999 </span> */}
                  Get Started Now{" "}
                  <i
                    aria-hidden="true"
                    className="fa-solid fa-arrow-right ms-3"
                  />
                </button>
                <a
                  className="btn btn-outline-dark btn-lg px-4 d-none"
                  href={GOOGLE_PLAY_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  Explore the App
                </a>
              </div>
              {/* <p className="small text-secondary mb-0">
                <i className="fa-solid fa-circle-check text-success"></i>{" "}
                Real-time calls &nbsp;{" "}
                <i className="fa-solid fa-circle-check text-success"></i> Expert
                research &nbsp;{" "}
                <i className="fa-solid fa-circle-check text-success"></i> Clear
                trade levels
              </p> */}
            </div>
            <div className="col-9 col-lg-4">
              {/* Previous hero image retained for easy restoration. */}
              <img
                className="img-fluid"
                src={phonePreview}
                alt="Intraday Traders mobile app showing trading research"
                fetchPriority="high"
              />

              {/* <img
                className="img-fluid"
                src={heroPhones}
                alt="Intraday Traders mobile app shown on two phones"
                fetchPriority="high"
              /> */}
            </div>
          </div>
          {/* <div
            className="row g-0 mt-5 border border-warning rounded-4 shadow-sm overflow-hidden text-center text-white"
            style={{
              background: "linear-gradient(180deg, #FE7902 0%, #F6530B 100%)",
            }}
          >
            {[
              // ["72%", "Overall accuracy"],
              ["21+", "Years of Experience"],
              ["5L+", "Traders & Investors"],
              ["NSE", "Listed Stocks Covered"],
              ["24×7", "App Access"],
            ].map(([value, label], index) => (
              <div
                className={`col-6 col-md p-4 ${index < 4 ? "border-bottom border-md-end" : ""}`}
                key={value}
              >
                <strong className="fs-3 d-block">{value}</strong>
                <span className="small">{label}</span>
              </div>
            ))}
          </div> */}
          <div
            className="row g-0 mt-5 border border-warning rounded-4 shadow-sm overflow-hidden text-center text-white"
            style={{
              background: "linear-gradient(180deg, #FE7902 0%, #F6530B 100%)",
            }}
          >
            {[
              ["21+", "Years of Experience"],
              ["5L+", "Traders & Investors"],
              ["NSE", "Listed Stocks Covered"],
              ["24×7", "App Access"],
            ].map(([value, label], index) => (
              <div className="col-6 col-md-3 p-4" key={value}>
                <strong className="fs-3 d-block">{value}</strong>
                <span className="small">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5" id="bootstrap-how">
        <div className="container">
          <div className="text-lg-center mx-auto mb-4">
            <span className="badge rounded-pill bg-warning-subtle text-warning-emphasis px-3 py-2 mb-3">
              How it works
            </span>
            <h2 className="display-5 fw-bold">
              Clear Entry, Targets and Stop loss levels
            </h2>
            <p className="lead text-secondary">
              A focused three-step flow designed to keep the experience easy to
              understand and free from unnecessary noise.
            </p>
          </div>
          <div className="row g-4">
            {steps.map(([number, icon, title, copy, tone]) => (
              <div className="col-12 col-md-4" key={number}>
                <article className="card h-100 border-light-subtle rounded-4 shadow-sm">
                  <div className="card-body p-3">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <span
                        className="badge rounded-circle fs-5 p-3"
                        style={tone}
                      >
                        {number}
                      </span>
                      <span
                        className="d-inline-flex align-items-center justify-content-center rounded-3 p-3"
                        style={tone}
                      >
                        <i className={`bi ${icon} fs-4`} aria-hidden="true" />
                      </span>
                    </div>
                    <h3 className="h4 fw-bold">{title}</h3>
                    <p className="text-secondary lh-lg mb-0">{copy}</p>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5 ">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-12 col-lg-6 text-center order-lg-1 order-2">
              <img
                className="img-fluid"
                src={realtimeTradingAlerts}
                alt="Live ICICI Bank trading alert showing entry, targets and stop-loss"
                loading="lazy"
              />
            </div>
            <div className="col-12 col-lg-6 order-lg-2 order-1">
              {/* <p className="small text-uppercase text-warning-emphasis fw-bold mb-2">
                Realtime Trading
              </p> */}
              <h2 className="display-5 fw-bold mb-3">
                Research Updates,
                <br />
                <span
                  style={{
                    background:
                      "linear-gradient(180deg, #FE7902 0%, #F6530B 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Delivered in Real Time
                </span>
              </h2>
              <p className="lead text-secondary mb-0">
                Get instant notifications for intraday trade ideas, entry
                levels, targets, stop-loss updates and key market movements.
              </p>
              <div className="row g-3 my-4">
                {[
                  ["bi-bell", "Live Trade Alerts"],
                  ["bi-graph-up-arrow", "Market Moving Updates"],
                  ["bi-bar-chart", "Entry, Target & Stop-loss"],
                  ["bi-file-earmark-text", "Research Backed Insights"],
                ].map(([icon, label]) => (
                  <div className="col-12 col-sm-6" key={label}>
                    <div className="d-flex align-items-center gap-3">
                      <span className="d-inline-flex align-items-center justify-content-center rounded-circle bg-warning-subtle text-warning-emphasis p-3 flex-shrink-0">
                        <i className={`bi ${icon}`} aria-hidden="true" />
                      </span>
                      <strong>{label}</strong>
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="btn btn-warning px-4 py-3"
                type="button"
                onClick={onGetStarted}
              >
                Get Live Alerts Now{" "}
                <i className="bi bi-arrow-right ms-3" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 bg-body-tertiary d-none">
        <div className="container ">
          <div className="row align-items-center g-5">
            <div className="col-12 col-lg-7">
              <h2 className="display-4 fw-bold lh-sm mb-5">
                Trading Made Easy
                <br />
                with <span className="text-warning-emphasis">IDT</span>
              </h2>

              <div
                className="d-flex flex-wrap gap-3 mb-5"
                aria-label="Intraday Traders services"
              >
                {[
                  ["IDT App", true],
                  ["Live Options", false],
                  ["Cash Intraday", false],
                  ["Stock Futures", false],
                  ["Daily Signals", false],
                  ["IDT Web", false],
                ].map(([label, active]) => (
                  <span
                    className={`rounded-pill border px-4 py-2 fw-medium ${active ? "bg-warning-subtle border-warning text-warning-emphasis" : "bg-white text-secondary"}`}
                    key={label}
                  >
                    {label}
                  </span>
                ))}
              </div>

              <p className="lead text-secondary lh-lg mb-5">
                Get equity, index / stock options, stock futures with full
                rationale, live alerts &amp; risk control—all on the IDT App.
              </p>

              <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-3 gap-sm-4 text-primary fw-semibold">
                <span>
                  <i
                    className="bi bi-shield-check text-success fs-4 me-2"
                    aria-hidden="true"
                  />
                  SEBI Registered
                </span>
                <span className="d-none d-sm-inline text-secondary">|</span>
                <span>
                  <i className="bi bi-people fs-4 me-2" aria-hidden="true" />
                  5.5 Lakh+ Investors
                </span>
              </div>
            </div>

            <div
              className="col-12 col-lg-5 d-none d-lg-block"
              style={{ minHeight: "440px" }}
              aria-hidden="true"
            >
              {/* Reserved for the Investing Made Easy image. */}
            </div>
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="row g-3 mb-4">
            <div className="col-12 col-lg-12">
              <span
                className="badge rounded-pill px-3 py-2 mb-3"
                style={{ backgroundColor: "#F1ECFF", color: "#7148D8" }}
              >
                What you get
              </span>
              <div className="d-lg-flex justify-content-center">
                <h2 className="display-5 fw-bold mb-3 mb-lg-0">
                  Built around the way active traders work.
                </h2>
                <p className="lead text-secondary mb-0">
                  Useful features, clear information and a calmer visual
                  hierarchy — designed around real trader workflows.
                </p>
              </div>
            </div>
            <div className="col-12 col-lg-5 d-none">
              <p className="lead text-secondary mb-0">
                Useful features, clear information and a calmer visual hierarchy
                — designed around real trader workflows.
              </p>
            </div>
          </div>
          <div className="row g-4 row-cols-2 row-cols-md-3 row-cols-lg-6">
            {features.map(([icon, title, copy, tone]) => (
              <div className="col" key={title}>
                <article className="h-100 py-2">
                  <span
                    className="d-inline-flex align-items-center justify-content-center rounded-4 mb-4"
                    style={{ ...tone, width: "64px", height: "64px" }}
                  >
                    <i className={`bi ${icon} fs-3`} aria-hidden="true" />
                  </span>
                  <h3 className="h6 fw-bold">{title}</h3>
                  <p className="small text-secondary lh-base mb-0">{copy}</p>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5" id="download-app">
        <div className="container">
          <div
            className="row align-items-center rounded-4 overflow-hidden p-4 "
            style={{
              background:
                "linear-gradient(110deg, #F1F8FF 0%, #F4EFFF 50%, #FFF7E6 100%)",
            }}
          >
            <div className="col-12 col-lg-6">
              <span className="badge rounded-pill bg-primary-subtle text-primary-emphasis px-3 py-2 mb-3">
                Trade on the go
              </span>
              <h2 className="display-6 fw-bold">The Intraday Traders App</h2>
              <p className="lead text-secondary">
                Research calls, market insights and notifications — available
                wherever you trade.
              </p>
              <div className="d-flex flex-wrap gap-3 mt-4">
                <a
                  className="btn btn-dark d-flex align-items-center gap-3 px-3 py-2 text-start"
                  href="https://play.google.com/store/apps/details?id=com.intraday.traders&pli=1"
                  target="_blank"
                  rel="noreferrer"
                >
                  <i className="bi bi-google-play fs-3" aria-hidden="true" />
                  <span>
                    <small className="d-block lh-1">GET IT ON</small>
                    <strong>Google Play</strong>
                  </span>
                </a>
                <a
                  className="btn btn-dark d-flex align-items-center gap-3 px-3 py-2 text-start"
                  href={APP_STORE_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  <i className="bi bi-apple fs-3" aria-hidden="true" />
                  <span>
                    <small className="d-block lh-1">Download on the</small>
                    <strong>App Store</strong>
                  </span>
                </a>
              </div>
            </div>
            <div className="col-12 col-lg-6 text-center">
              {/* Previous download-section image retained for easy restoration.
              <img
                className="img-fluid"
                src={phonePreview}
                alt="Intraday Traders app preview"
                loading="lazy"
                style={{ maxHeight: "440px" }}
              />
              */}
              <img
                className="img-fluid"
                src={downloadAppPhones}
                alt="Intraday Traders mobile app home and market screens"
                loading="lazy"
                style={{ maxHeight: "500px" }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 d-none">
        <div className="container ">
          <div className="text-center">
            <span className="badge rounded-pill bg-primary-subtle text-primary-emphasis px-3 py-2 mb-3">
              Trusted by traders
            </span>
            <h2 className="display-5 fw-bold">
              Simple metrics. Clearer context.
            </h2>
          </div>
          <div className="row g-4 text-center">
            {[
              ["72%", "Average accuracy shown in performance view"],
              ["1.8×", "Average return multiple example metric"],
              ["5L+", "Trader & investor reach"],
            ].map(([value, label]) => (
              <div className="col-12 col-md-4" key={value}>
                <div className="border rounded-4 p-4 h-100 bg-body-tertiary">
                  <strong className="display-5 d-block">{value}</strong>
                  <span className="text-secondary">{label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5 bg-body-tertiary">
        <div className="container py-lg-5">
          <div className="row g-5">
            <div className="col-12 col-lg-4">
              <span className="badge rounded-pill bg-warning-subtle text-warning-emphasis px-3 py-2 mb-3">
                Frequently asked questions
              </span>
              <h2 className="display-5 fw-bold">
                Quick answers to common questions.
              </h2>
              <a
                className="link-dark fw-bold"
                href="mailto:support@equitypandit.com"
              >
                Contact our team <i className="bi bi-arrow-right" />
              </a>
            </div>
            <div className="col-12 col-lg-8">
              <div className="d-grid gap-3">
                {faqs.map(([question, answer]) => (
                  <details
                    className="card border-0 rounded-3 shadow-sm"
                    key={question}
                  >
                    <summary className="card-header bg-white border-0 p-4 fw-bold">
                      {question}
                    </summary>
                    <div className="card-body pt-0 px-4 pb-4 text-secondary">
                      {answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="row align-items-center g-4 rounded-4 bg-warning-subtle border border-warning-subtle p-4">
            <div className="col-12 col-lg-8">
              <span className="badge rounded-pill text-bg-warning mb-3">
                Ready to trade smarter?
              </span>
              <h2 className="display-6 fw-bold">Start With Intraday Traders</h2>
              <p className="lead text-secondary mb-lg-0">
                Get actionable research, real-time alerts and market insights in
                one place.
              </p>
            </div>
            <div className="col-12 col-lg-4 text-lg-end">
              <button
                className="btn btn-warning btn-lg px-4"
                type="button"
                onClick={onGetStarted}
              >
                Get Started Now <i className="bi bi-arrow-right ms-2" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default BootstrapHomePage;
