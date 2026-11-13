import TradingServicesCarousel from "./TradingServicesCarousel.jsx";

const TRUST_ITEMS = [
  // {
  //   icon: "bi-shield-check",
  //   color: "text-warning",
  //   lineOne: "SEBI Registered",
  //   lineTwo: "Research Analyst INH000029829",
  // },
  // { icon: 'bi-bar-chart-line', color: 'text-success', lineOne: 'Trusted by', lineTwo: '5 Lakh+ Traders' },
   {
    icon: "bi-shield-check",
    color: "text-warning",
    lineOne: "SEBI Registered",
    lineTwo: "Research Analyst",
    lineThree: "INH000029829",
  },
  {
    icon: "bi-people",
    color: "text-primary",
    lineOne: "21 Years of",
    lineTwo: "Research",
    lineThree: "Excellence",
  }
];

export function AuthTrustBar() {
  return (
    <aside
      className="card border rounded-4 bg-white shadow-sm mt-4"
      aria-label="Why choose us"
    >
      <div className="card-body p-1">
        <div className="row row-cols-12 ">
          {TRUST_ITEMS.map((item, index) => (
            <div className="col position-relative" key={item.lineOne}>
              <div className="d-flex flex-column align-items-center justify-content-between gap-1 h-100 py-2 text-center">
                <i
                  className={`bi ${item.icon} ${item.color} fs-3`}
                  aria-hidden="true"
                />

                <div className="small">
                  <span className="d-block small fw-semibold text-body">
                    {item.lineOne}
                  </span>

                  <span className="d-block small text-secondary">{item.lineTwo}</span>

                  {item.lineThree && (
                    <span className="d-block small text-secondary">
                      {item.lineThree}
                    </span>
                  )}
                </div>
              </div>
              {index < TRUST_ITEMS.length - 1 && (
                <span
                  className="d-block position-absolute end-0 top-50 translate-middle-y border-end h-50"
                  aria-hidden="true"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function AuthPageLayout({
  children,
  labelledBy,
  promotionalHeader = false,
  showAdvisorLogo = false,
}) {
  return (
    <main
      className="container flex-grow-1 py-4 py-md-5 bg-body-tertiary"
      id="main-content"
    >
      <div className="row justify-content-center w-100 mx-0">
        <div className="col-12 col-lg-5 p-0">
          {showAdvisorLogo && (
            <div className="text-center ">
              <img
                className="img-fluid"
                src="/ep-analyst-logo.svg"
                alt="Intraday Traders"
                style={{ width: "200px", maxWidth: "65%" }}
              />
            </div>
          )}
          <div className="text-center mb-3">
            <small>
              <small>SEBI Registration Number : INH000029829</small>
            </small>
          </div>
          <section
            className="card border rounded-4 shadow-sm overflow-hidden"
            aria-labelledby={labelledBy}
          >
            {promotionalHeader ? (
              <>
                <TradingServicesCarousel promotional />
                <div className="card-body p-4">{children}</div>
              </>
            ) : (
              <div className="card-body p-4">
                <TradingServicesCarousel />
                {children}
              </div>
            )}
          </section>

          <AuthTrustBar />
        </div>
      </div>
    </main>
  );
}

export default AuthPageLayout;
