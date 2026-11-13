import {
  HeroSection,
  KnowTradeSection,
  ClosingSection,
} from "../components/HomeSections.jsx";
import phonePreview from "../assets/intraday-pro-phone-orange.png";

const features = [
  [
    "bi-lightning-charge",
    "warning",
    "Live options recommendations",
    "Track actionable Index & Stock Options trade ideas with entry, target and stop-loss levels.",
  ],
  [
    "bi-cash-coin",
    "primary",
    "Cash intraday trades",
    "Researched Buy & Sell opportunities across stocks, with clearly defined trade levels.",
  ],
  [
    "bi-graph-up-arrow",
    "success",
    "Stock futures trades",
    "Access Stock Futures trade ideas with entry, targets and stop-loss levels.",
  ],
  [
    "bi-clock-history",
    "info",
    "Daily trading signals",
    "Stay updated with market opportunities and important trading setups throughout the day.",
  ],
];
const steps = [
  ["01", "Live", "Get market opportunities as they develop."],
  ["02", "Analyze", "Understand the setup before taking a decision."],
  [
    "03",
    "Act",
    "Execute according to your own trading strategy and risk appetite.",
  ],
  ["04", "Review", "Learn from market movements and continuously improve."],
];
const offerings = [
  [
    "bi-graph-up",
    "warning-emphasis",
    "Index Options",
    "Live trade recommendations on Nifty & Bank Nifty options.",
  ],
  [
    "bi-activity",
    "primary",
    "Stock Options",
    "Selected stock option setups with defined risk.",
  ],
  [
    "bi-bar-chart",
    "success",
    "Cash Intraday",
    "Buy & Sell trade ideas across the cash market.",
  ],
  [
    "bi-list-ul",
    "info-emphasis",
    "Stock Futures",
    "Futures trading opportunities with entry and exit levels.",
  ],
  [
    "bi-clock",
    "danger",
    "Market Intelligence",
    "Important market updates and analysis, as it happens.",
  ],
];
const reasons = [
  [
    "bi-search",
    "success",
    "Research-driven",
    "Data backed by market research and technical analysis.",
  ],
  [
    "bi-bullseye",
    "primary",
    "Actionable",
    "Timely trade ideas and signals with clearly defined levels.",
  ],
  ["bi-clock", "warning", "Timely", "Get updates as the market moves."],
  [
    "bi-clipboard-check",
    "secondary",
    "Transparent",
    "Clear rationale behind every recommendation.",
  ],
  [
    "bi-patch-check",
    "primary",
    "SEBI Registered",
    "Research Analyst Registration No. INH000029829.",
  ],
  [
    "bi-person-check",
    "secondary",
    "Trusted",
    "Research and insights from experienced market analysts.",
  ],
];

function HomePage({ onGetStarted }) {
  const showFeatures = () =>
    document
      .getElementById("what-you-get")
      ?.scrollIntoView({ behavior: "smooth" });
  return (
    <>
      <main
        className="flex-grow-1 d-flex align-items-center py-5 overflow-hidden"
        style={{
          background: [
            "linear-gradient(135deg, transparent 0%, transparent 60%, rgba(254, 121, 2, 0.018) 60%, rgba(254, 121, 2, 0.018) 72%, rgba(246, 83, 11, 0.032) 72%, rgba(246, 83, 11, 0.032) 100%)",
            "radial-gradient(circle at 78% 28%, rgba(254, 121, 2, 0.045) 0%, rgba(254, 121, 2, 0.02) 34%, rgba(255, 255, 255, 0) 62%)",
            "linear-gradient(180deg, #FFFFFF 0%, #FFFCF8 100%)",
          ].join(", "),
        }}
      >
        <div className="container">
          <div className="row align-items-center">
            <div className="col-12 col-lg-8">
              <p
                className="d-inline-flex align-items-center fw-medium border rounded-pill px-3 py-1"
                style={{ color: "#E87500", "--bs-border-color": "#E5EAF0" }}
              >
                <i
                  aria-hidden="true"
                  className="fa-solid fa-circle fa-2xs flex-shrink-0 me-2"
                />
                {/* Live market recommendations */}
                SEBI Registered Research Analyst
              </p>
              <h1 className="display-5 fw-bold text-dark mb-3">
                Live Intraday Recommendations Daily.
                {/* <br />
                <span
                  style={{
                    background:
                      "linear-gradient(180deg, #FE7902 0%, #F6530B 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Live Intraday Recommendations Daily.
                </span> */}
              </h1>
              <p className="fs-6 text-muted mb-3">
                Options Recommendations from Experienced Research Analysts &amp; Trade
                Signals for <br className="d-none d-xl-inline-flex" />
                Cash &amp; Stock Futures Intraday
              </p>

              <ul className="list-unstyled d-grid gap-3 text-body mb-3">
                <li className="d-flex align-items-center gap-3">
                  <span
                    className="d-inline-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                    style={{
                      width: "40px",
                      height: "40px",
                      color: "#F6530B",
                      background: "#FFF1E5",
                    }}
                  >
                    <i
                      aria-hidden="true"
                      className="fa-solid fa-chart-column fs-4"
                    />
                  </span>
                  <span>
                    <span className="fw-semibold text-body-emphasis">
                      Live Options -{" "}
                    </span>
                    <span className="text-muted">
                      Index &amp; Stock Options with entry, targets &amp;
                      stop-loss follow ups.
                    </span>
                  </span>
                </li>
                <li className="d-flex align-items-center gap-3">
                  <span
                    className="d-inline-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                    style={{
                      width: "40px",
                      height: "40px",
                      color: "#F6530B",
                      background: "#FFF1E5",
                    }}
                  >
                    <i aria-hidden="true" className="fa-solid fa-chart-pie" />
                  </span>
                  <span>
                    <span className="fw-semibold text-body-emphasis">
                      Cash Intraday -{" "}
                    </span>
                    <span className="text-muted">
                      Researched Buy &amp; Sell stock trades with clear levels.
                    </span>
                  </span>
                </li>
                <li className="d-flex align-items-center gap-3">
                  <span
                    className="d-inline-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                    style={{
                      width: "40px",
                      height: "40px",
                      color: "#F6530B",
                      background: "#FFF1E5",
                    }}
                  >
                    <i
                      aria-hidden="true"
                      className="fa-solid fa-arrow-trend-up fs-4"
                    />
                  </span>
                  <span>
                    <span className="fw-semibold text-body-emphasis">
                      Stock Futures -{" "}
                    </span>
                    <span className="text-muted">
                      Futures trade ideas with entry, targets &amp; SL.
                    </span>
                  </span>
                </li>
                <li className="d-flex align-items-center gap-3">
                  <span
                    className="d-inline-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                    style={{
                      width: "40px",
                      height: "40px",
                      color: "#F6530B",
                      background: "#FFF1E5",
                    }}
                  >
                    <i aria-hidden="true" className="fa-regular fa-bell fs-4" />
                  </span>
                  <span>
                    <span className="fw-semibold text-body-emphasis">
                      Daily Signals -{" "}
                    </span>
                    <span className="text-muted">
                      Key market setups delivered throughout the trading day.
                    </span>
                  </span>
                </li>
              </ul>

              <div className="row mt-4 mb-3">
                <div className="col-12 col-sm-auto">
                  <button
                    className="btn px-4 py-3 w-100 text-white fw-semibold border-0"
                    type="button"
                    onClick={onGetStarted}
                    style={{
                      background:
                        "linear-gradient(180deg, #FE7902 0%, #F6530B 100%)",
                    }}
                  >
                    Get started for <span className="fs-5"> &#8377;999 </span><strike className="fw-normal"> &#8377;2999</strike>
                    <i
                      aria-hidden="true"
                      className="fa-solid fa-arrow-right ms-3"
                    />
                  </button>
                </div>
              </div>

              {/* <small className="">
                <small className="text-muted">
                  Recommendations are for informational purposes and not a
                  guarantee of returns. Securities market investments are
                  subject to market risks. Evaluate suitability based on your
                  own objectives & risk appetite.
                </small>
              </small> */}

              {/* <p className="text-body-emphasis fw-semibold text-xl-start text-center mb-0 mt-3">
                {/* <small> IntradayTraders™ by EquityPandit. SEBI RA: INH000029829</small> 
                <small> IntradayTraders™ by EquityPandit.</small>
              </p> */}
            </div>

            <div className="col-12 col-lg-4 mt-lg-0 mt-5">
              <div className="text-center">
                <img
                  className="img-fluid"
                  src={phonePreview}
                  alt="IDT trading dashboard on laptop and phone"
                  style={{ maxHeight: "560px", objectFit: "contain" }}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
export default HomePage;
