import DashboardBreadcrumb from "../components/DashboardBreadcrumb.jsx";

const callPages = {
  "live-calls": { title: "Live Calls", icon: "bi-lightning-charge-fill" },
  "live-calls-list": { title: "Live Calls", icon: "bi-lightning-charge-fill" },
  "cash-intraday": {
    title: "Cash Intraday Calls",
    icon: "bi-currency-rupee",
  },
  "cash-intraday-list": {
    title: "Cash Intraday Calls",
    icon: "bi-currency-rupee",
  },
  "stock-future-intraday": {
    title: "Stock Future Intraday Calls",
    icon: "bi-graph-up-arrow",
  },
  "stock-future-intraday-list": {
    title: "Stock Future Intraday Calls",
    icon: "bi-graph-up-arrow",
  },
};

const unlockProSubtitle =
  "Get Index Options, Stock Options, Stock Futures, and Cash Intraday Trades - all in one place.";
const pendingKycMessage =
  "As per SEBI regulations, Complete KYC and document signing to view recommendations.";
const pendingDigioMessage =
  "As per SEBI regulations, please sign the MITC (Most Important Terms & Conditions) document.";

export default function SubscribeCallsOverlay({
  page,
  onSubscribe,
  complianceStatuses,
  onKyc,
  onAgreement,
}) {
  const current = callPages[page] || callPages["live-calls"];
  const accessTitle =
    (page === "live-calls" && page === "live-calls-list") ? "Get access to live calls" : `Get access to ${current.title}`;
  const pendingCompliance = !complianceStatuses
    ? []
    : !complianceStatuses.paymentComplete
      ? []
      : !complianceStatuses.kycComplete
        ? [{ label: "KYC", actionLabel: "Complete KYC", onClick: onKyc }]
        : !complianceStatuses.agreementComplete
          ? [{ label: "Agreement", actionLabel: "Sign MITC", onClick: onAgreement }]
          : [];
  const isComplianceGate = pendingCompliance.length > 0;

  return (
    <main className="position-relative overflow-hidden bg-light d-flex flex-column flex-grow-1 subscribe-calls-page">
      <div className="container-fluid py-3 d-flex flex-column flex-grow-1 h-100">
        {window.location.pathname !== "/services" &&
          window.location.pathname !== "/live-calls" &&
          window.location.pathname !== "/cash-intraday" &&
          window.location.pathname !== "/stock-future-intraday" && (
            <DashboardBreadcrumb currentPage={current.title} />
          )}
        {/* <DashboardBreadcrumb currentPage={current.title} /> */}
        <div className="position-relative rounded-3 overflow-hidden border bg-body flex-grow-1">
          <div
            className="position-absolute top-0 start-0 w-100 h-100 overflow-hidden p-4 p-md-5 subscribe-calls-backdrop"
            aria-hidden="true"
          >
            {page === "live-calls" || page === "live-calls-list" ? (
              <>
                <h1 className="fs-2 fw-bold mb-1">Live Calls</h1>
                <p className="small text-body-secondary mb-3">
                  Generated on{" "}
                  {new Intl.DateTimeFormat("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }).format(new Date())}
                </p>
                <div className="row g-3">
                  <div className="col-md-8">
                    {[
                      "Follow Up",
                      "New Call",
                      "Follow Up",
                      "New Call",
                      "Follow Up",
                      "New Call",
                    ].map((label, index) => (
                      <article
                        className="bg-body d-flex border rounded-3 mb-3"
                        key={`${label}-${index}`}
                      >
                        <div className="d-flex flex-column py-3 px-2 w-100">
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <span
                              className={`badge mb-0 ${label === "Follow Up" ? "bg-warning bg-opacity-50 text-warning-emphasis" : "bg-primary bg-opacity-50 text-primary-emphasis"}`}
                            >
                              {label}
                            </span>
                            <span className="small text-body-secondary ms-auto">
                              {index % 2 ? "10:42:03 AM" : "11:34:31 AM"}
                            </span>
                          </div>
                          <span className="placeholder-glow mb-2">
                            <span className="placeholder col-8" />
                          </span>
                          <div
                            className={
                              label === "Follow Up"
                                ? "small p-2 rounded-3 text-body-secondary bg-primary bg-opacity-10"
                                : "d-none"
                            }
                          >
                            <span className="placeholder-glow">
                              <span className="placeholder col-9" />
                            </span>
                            <br />
                            <span className="placeholder-glow">
                              <span className="placeholder col-5" />
                            </span>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="row justify-content-start">
                  <div className="col-md-8">
                    <div className="mb-3">
                      <h1 className="fs-2 fw-bold mb-1">{current.title}</h1>
                      <p className="small text-body-secondary mb-0">
                        Generated on{" "}
                        {new Intl.DateTimeFormat("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        }).format(new Date())}
                      </p>
                    </div>
                    <div
                      className="d-inline-flex align-items-center gap-1 rounded-pill border bg-white p-1 shadow-sm mb-3"
                      role="tablist"
                      aria-label={`${current.title} direction`}
                    >
                      <span className="btn btn-sm d-inline-flex align-items-center gap-2 rounded-pill bg-dark text-white px-3">
                        Buy trades{" "}
                        <span className="badge rounded-circle bg-white text-dark">
                          22
                        </span>
                      </span>
                      <span className="btn btn-sm d-inline-flex align-items-center gap-2 rounded-pill text-body-secondary px-3">
                        Sell trades{" "}
                        <span className="badge rounded-circle bg-secondary-subtle text-secondary">
                          1
                        </span>
                      </span>
                    </div>
                    {[1, 2, 3, 4].map((item) => (
                      <article
                        className="card border shadow-sm mb-3 rounded-3"
                        key={item}
                      >
                        <div className="card-body p-2">
                          <div className="row g-2 align-items-center">
                            <div className="col-10 col-lg-4">
                              <div className="d-flex flex-wrap align-items-center gap-2">
                                <i
                                  className={`bi ${current.icon} text-success`}
                                  aria-hidden="true"
                                />
                                <span className="placeholder-glow">
                                  <span className="placeholder col-6" />
                                </span>
                                <span className="badge bg-success bg-opacity-10 text-success">
                                  Target 1 Achieved
                                </span>
                              </div>
                              <span className="placeholder-glow small">
                                <span className="placeholder col-7" />
                              </span>
                            </div>
                            <div className="col-12 col-lg">
                              <div className="row g-0 align-items-center mb-2">
                                {[0, 1, 2, 3, 4].map((node) => (
                                  <div
                                    className="col d-flex align-items-center"
                                    key={node}
                                  >
                                    <span
                                      className={`border-top border-3 flex-grow-1 ${node < 2 ? "border-success" : "border-secondary-subtle"}`}
                                    />
                                    <span
                                      className={`rounded-circle p-2 ${node === 2 ? "bg-success" : "bg-secondary-subtle"}`}
                                    />
                                  </div>
                                ))}
                              </div>
                              <div className="row g-0 text-center">
                                {["SL", "Buy Above", "T1", "T2", "T3"].map(
                                  (label, node) => (
                                    <div
                                      className="col"
                                      key={`${label}-${node}`}
                                    >
                                      <small className="d-block text-body-secondary">
                                        {label}
                                      </small>
                                      <span className="placeholder-glow">
                                        <span className="placeholder col-8" />
                                      </span>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                            <div className="col-2 col-lg-1 text-end">
                              <i className="bi bi-filetype-pdf fs-5" />
                            </div>
                          </div>
                        </div>
                        <div className="small text-success bg-success bg-opacity-10 text-center py-1">
                          Profit: —
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3 subscribe-calls-scrim">
            <section
              className="card rounded-4 border-0 shadow-lg text-center"
              style={{ maxWidth: "440px" }}
              aria-labelledby="subscribe-calls-title"
            >
              <div className="card-body p-3">
                <span
                  className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                  style={{
                    width: "64px",
                    height: "64px",
                    backgroundColor: "#fff0e4",
                    color: "#ff7900",
                  }}
                  aria-hidden="true"
                >
                  <i
                    className={`bi ${isComplianceGate ? "bi-shield-exclamation" : current.icon} fs-3`}
                  />
                </span>
                <h2 className="fs-4 fw-bold" id="subscribe-calls-title">
                  {isComplianceGate
                    ? `${pendingCompliance[0].label} pending`
                    : accessTitle}
                </h2>
                <p className="text-body-secondary mb-4">
                  {isComplianceGate
                    ? pendingCompliance[0]?.label === "KYC"
                      ? pendingKycMessage
                      : pendingDigioMessage
                    : unlockProSubtitle}
                </p>
                {isComplianceGate ? (
                  <div className="d-flex flex-column gap-2">
                    {pendingCompliance.slice(0, 1).map(({ label, actionLabel, onClick }) => (
                      <button
                        type="button"
                        className="btn btn-warning fw-semibold px-4"
                        onClick={onClick}
                        key={label}
                      >
                        {actionLabel}{" "}
                        <i
                          className="bi bi-arrow-right ms-1"
                          aria-hidden="true"
                        />
                      </button>
                    ))}
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn btn-warning fw-semibold px-4"
                    onClick={onSubscribe}
                  >
                    Subscribe now
                  </button>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
      <style>{`
        .subscribe-calls-backdrop { filter: blur(5px); transform: scale(1.02); }
        .subscribe-calls-scrim { background: rgba(18, 20, 24, .28); backdrop-filter: ${isComplianceGate ? "blur(5px)" : "none"}; }
      `}</style>
    </main>
  );
}
