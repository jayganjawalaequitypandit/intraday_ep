import {
  HeroSection,
  KnowTradeSection,
  ClosingSection,
} from "../components/HomeSections.jsx";
import phonePreview from '../assets/intraday-pro-phone-orange.png'


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
    <main className="flex-grow-1 bg-white text-dark d-none" id="main-content">
      <HeroSection onGetStarted={onGetStarted} showFeatures={showFeatures} />
      <section className="bg-white py-5" id="what-you-get">
        <div className="container py-lg-4">
          <div className="col-lg-8 col-xl-7 mx-auto text-center mb-5">
            <h2 className="display-6 fw-semibold">
              Real-time market intelligence. Actionable trade ideas.
            </h2>
            <p className="fs-6 text-secondary mt-3">
              The market moves fast — your decisions should be backed by timely
              information. IntradayTraders™ brings together live market
              analysis, actionable trade setups and daily trading signals to
              help you make more informed trading decisions.
            </p>
          </div>
          <div className="row g-3">
            {features.map(([i, c, t, d]) => (
              <div className="col-md-6 col-xl-3" key={t}>
                <article className="card h-100 border-light-subtle rounded-3">
                  <div className="card-body p-4">
                    <span className={`d-inline-flex text-${c}`}>
                      <i className={`bi ${i} fs-4`} aria-hidden="true" />
                    </span>
                    <h3 className="h5 fw-bold mt-3">{t}</h3>
                    <p className="small text-secondary mb-0">{d}</p>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>
      <KnowTradeSection />
      <section className="bg-white py-5">
        <div className="container">
          <div className="col-lg-8 col-xl-7 mx-auto text-center mb-5">
            <h2 className="display-6 fw-semibold">
              Built for traders who want clarity
            </h2>
            <p className="fs-6 text-secondary mt-3">
              Whether you're tracking Nifty, Bank Nifty, stocks, options or
              futures, IntradayTraders™ helps you cut through the noise and
              focus on what matters.
            </p>
          </div>
          <div className="row g-4">
            {steps.map(([n, t, d]) => (
              <div className="col-md-6 col-lg-3" key={n}>
                <span className="text-warning-emphasis small fw-semibold">
                  {n}
                </span>
                <h3 className="h5 fw-bold mt-2">{t}</h3>
                <p className="small text-secondary mb-0">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-body-tertiary py-5">
        <div className="container py-lg-4">
          <div className="row g-5">
            <div className="col-lg-5">
              <h2 className="display-6 fw-semibold">
                One platform.
                <br />
                Multiple trading opportunities.
              </h2>
              <p className="text-secondary mt-3 mb-4">
                Explore researched trade ideas across indices, stocks and
                futures — with clear entry levels, targets and risk insights,
                all in one place.
              </p>
              <button
                className="btn btn-warning fw-semibold px-4 py-3"
                onClick={onGetStarted}
              >
                Get started{" "}
                <i
                  className="fa-solid fa-arrow-right ms-2"
                  aria-hidden="true"
                />
              </button>
            </div>
            <div className="col-lg-7">
              {offerings.map(([i, c, t, d]) => (
                <div className="d-flex gap-3 border-bottom py-3" key={t}>
                  <i
                    className={`bi ${i} fs-4 text-${c} flex-shrink-0`}
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="h5 fw-bold">{t}</h3>
                    <p className="small text-secondary mb-0">{d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="bg-white py-5" aria-labelledby="why-intraday-title">
        <div className="container py-lg-4">
          <h2
            className="display-6 fw-semibold text-center mb-5"
            id="why-intraday-title"
          >
            Why IntradayTraders™?
          </h2>
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-2">
            {reasons.map(([icon, color, title, description]) => (
              <div className="col" key={title}>
                <article className="card h-100 border-light-subtle rounded-3">
                  <div className="card-body d-flex align-items-start gap-3 p-4">
                    <span
                      className={`d-inline-flex align-items-center justify-content-center flex-shrink-0 pt-1 text-${color}`}
                    >
                      <i className={`bi ${icon} fs-4`} aria-hidden="true" />
                    </span>
                    <div className="pt-1">
                      <h3 className="fs-6 fw-semibold mb-2">{title}</h3>
                      <p className="small text-secondary lh-lg mb-0">
                        {description}
                      </p>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>
      <ClosingSection onGetStarted={onGetStarted} />
      <section className="bg-light border-top py-4">
        <div className="container">
          <p className="small text-secondary">
            <strong>Important disclaimer —</strong> IntradayTraders™ provides
            research and market-related recommendations for informational
            purposes. Recommendations are not a guarantee of returns or profits.
            Securities market investments are subject to market risks. Investors
            should independently evaluate the risks and suitability of any
            recommendation and make decisions based on their own objectives and
            risk appetite.
          </p>
          <p className="small small text-secondary mb-0">
            SEBI Registered Research Analyst: INH000029829
          </p>
        </div>
      </section>
    </main>
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
                Live market recommendations
              </p>
              <h1 className="display-5 fw-bold text-dark mb-3">
                Trade smarter.
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
                  Stay ahead of every move.
                </span>
              </h1>
              <p className="fs-6 text-muted mb-3">
                Live Options Recommendations from Experienced Analysts &amp;
                Trade Signals for <br className="d-none d-xl-inline-flex" />
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
                      Index &amp; Stock Options with entry, target &amp;
                      stop-loss.
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
                      Key market setups sent through the trading day.
                    </span>
                  </span>
                </li>
              </ul>

              <div className="row mt-4">
                <div className="col-12 col-sm-auto">
                  <button
                    className="btn px-4 py-3 w-100 text-white fw-semibold border-0"
                    type="button"
                    style={{
                      background:
                        "linear-gradient(180deg, #FE7902 0%, #F6530B 100%)",
                    }}
                  >
                    Get started for &#8377;999
                    <i
                      aria-hidden="true"
                      className="fa-solid fa-arrow-right ms-3"
                    />
                  </button>
                </div>
              </div>

              <p className="text-body-emphasis text-xl-start text-center mb-0 mt-3">
                <small>SEBI Registered Research Analyst: INH000029829</small>
              </p>
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
