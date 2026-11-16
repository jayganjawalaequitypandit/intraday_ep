import { useEffect, useState } from "react";
import Offcanvas from "bootstrap/js/dist/offcanvas";
import api from "../services/api.js";
import DashboardBreadcrumb from "../components/DashboardBreadcrumb.jsx";
import IntradaySignalChart from "../components/IntradaySignalChart.jsx";

const PAGE_SIZES = [25, 50, 100];

function formatProfitLoss(value) {
  if (value === null || value === undefined || value === "") return "—";
  const amount = Number(value);
  return Number.isFinite(amount)
    ? new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount)
    : "—";
}

function getPageData(response) {
  const payload = response?.data ?? {};
  return {
    dataList: payload.dataList ?? [],
    meta: payload.meta ?? {},
    todaysBreakoutPL:
      payload.todaysBreakoutPL ?? payload.meta?.todaysBreakoutPL,
    todaysBreakdownPL:
      payload.todaysBreakdownPL ?? payload.meta?.todaysBreakdownPL,
    totalBreakout: payload.totalBreakout ?? payload.meta?.totalBreakout,
    totalBreakdown: payload.totalBreakdown ?? payload.meta?.totalBreakdown,
    executedTrades: payload.executedTrades ?? payload.meta?.executedTrades,
    targetAchieved: payload.targetAchieved ?? payload.meta?.targetAchieved,
    slTriggered: payload.slTriggered ?? payload.meta?.slTriggered,
  };
}

function achievedTarget(signal) {
  if (signal.t3TriggerAt) return 3;
  if (signal.t2TriggerAt) return 2;
  if (signal.t1TriggerAt) return 1;
  return 0;
}

function formatGeneratedAt(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const parts = new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).formatToParts(date);
  const part = (type) => parts.find((entry) => entry.type === type)?.value;
  return `${part("day")} ${part("month")}, ${part("year")} ${part("hour")}:${part("minute")} ${part("dayPeriod")?.toUpperCase()}`;
}

function getRationaleUrl(path) {
  if (!path) return "";
  const apiBase = new URL(import.meta.env.VITE_UAPI_PROCESS_URL);
  apiBase.pathname = apiBase.pathname.replace(/api\/v1\/?$/, "");
  return new URL(path.replace(/^\/+/, ""), apiBase).toString();
}

function SignalCard({ signal, selected, onSelect, isDesktop }) {
  const isBuy = signal.signalType === "bullish";
  const status = signal.signalStatus?.toLowerCase() ?? "";
  const stopLoss = signal.sl;
  const entry = isBuy ? signal.currentHigh : signal.currentLow;
  const targetHit = achievedTarget(signal);
  const hasAchievedTarget = targetHit > 0;
  const points = [stopLoss, entry, signal.t1, signal.t2, signal.t3];
  const labels = ["SL", isBuy ? "Buy" : "Sell", "T1", "T2", "T3"];
  const hasProfitValue =
    signal.pl !== null && signal.pl !== undefined && signal.pl !== "";
  const profitLoss = Number(signal.pl);
  const isLoss =
    (hasProfitValue && profitLoss < 0) ||
    Boolean(signal.slTriggerAt) ||
    /sl.?trigger|stop.?loss/.test(
      `${status} ${signal.statusMessage?.toLowerCase() ?? ""}`,
    );
  const plColor =
    profitLoss > 0
      ? "text-success bg-success"
      : profitLoss < 0
        ? "text-danger bg-danger"
        : "text-body-secondary bg-secondary";
  const title = isLoss
    ? "SL Triggered"
    : hasAchievedTarget
      ? `Target ${targetHit} Achieved`
      : status === "executed"
        ? "Executed"
        : status === "pending"
          ? "Pending"
          : signal.statusMessage || signal.signalStatus;

  return (
    <article
      className={`card shadow-sm mb-3 rounded-3 ${selected && isDesktop ? "bg-warning bg-opacity-10 border-0" : "border"}`}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
    >
      <div className="card-body p-0">
        <div className="row g-0 align-items-center">
          <div className="col order-1 p-2">
            <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
              <h2 className="fs-6 fw-bold text-body-emphasis text-uppercase mb-0">
                {signal.symbol ? signal.symbol : signal.coName}
              </h2>
              <span
                className={`badge fw-medium small text-wrap text-start ${isLoss ? "bg-danger bg-opacity-10 text-danger" : hasAchievedTarget || status === "executed" ? "bg-success bg-opacity-10 text-success" : status === "pending" ? "bg-warning bg-opacity-10 text-warning" : "bg-secondary bg-opacity-10 text-secondary"}`}
              >
                {title}
              </span>
            </div>
            {signal.coName && (
              <h3 className="small text-body-secondary lh-sm mb-0">
                {signal.coName}
              </h3>
            )}
          </div>
          {signal.rationale && (
            <div className="col-auto order-2 order-lg-2 p-2">
              <a
                className="btn btn-sm text-dark p-1"
                href={getRationaleUrl(signal.rationale)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event) => event.stopPropagation()}
                aria-label={`Open ${signal.symbol} rationale PDF`}
                title="View rationale PDF"
              >
                <i
                  className="bi bi-file-earmark-text fs-5"
                  aria-hidden="true"
                />
              </a>
            </div>
          )}
          {hasProfitValue && (
            <div className="col-12 col-lg-auto order-4 order-lg-3 p-0 p-lg-2">
              <div
                className={`position-relative d-flex flex-row flex-lg-column justify-content-center gap-1 rounded-2 py-1 p-lg-1 text-center text-lg-end bg-opacity-10 ${plColor}`}
              >
                <small className="lh-sm text-body-secondary">
                  P&amp;L<span className="d-lg-none">:</span>
                </small>
                <strong className="small text-nowrap lh-sm fw-medium">
                  {formatProfitLoss(signal.pl)}
                  <i
                    className="bi bi-chevron-right d-lg-none position-absolute top-50 end-0 translate-middle-y me-2"
                    aria-hidden="true"
                  />
                </strong>
              </div>
            </div>
          )}
          <div className="col-12 order-3 order-lg-4 p-2">
            <div className="position-relative mt-1 mt-lg-3">
              <div className="row g-0 align-items-center mb-3">
                {labels.map((label, index) => {
                  const complete =
                    !isLoss && index >= 2 && index - 1 <= targetHit;
                  const isEntry = index === 1;
                  const connectorClass = (achieved, lossSegment = false) =>
                    achieved
                      ? "border-success"
                      : isLoss && lossSegment
                        ? "border-danger"
                        : "border-secondary-subtle";
                  return (
                    <div
                      className={`col position-relative d-flex ${index === 0 ? "justify-content-start" : index === labels.length - 1 ? "justify-content-end" : "justify-content-center"}`}
                      key={label}
                    >
                      {index === 0 && (
                        <span
                          className={`position-absolute top-50 start-0 w-100 border-top border-3 translate-middle-y ${connectorClass(false, true)}`}
                          aria-hidden="true"
                        />
                      )}
                      {index === 1 && (
                        <span
                          className={`position-absolute top-50 start-0 w-50 border-top border-3 translate-middle-y ${connectorClass(false, true)}`}
                          aria-hidden="true"
                        />
                      )}
                      {index === 1 && (
                        <span
                          className={`position-absolute top-50 start-50 w-100 border-top border-3 translate-middle-y ${connectorClass(!isLoss && targetHit >= 1)}`}
                          aria-hidden="true"
                        />
                      )}
                      {index === 2 && (
                        <span
                          className={`position-absolute top-50 start-50 w-100 border-top border-3 translate-middle-y ${connectorClass(!isLoss && targetHit >= 2)}`}
                          aria-hidden="true"
                        />
                      )}
                      {index === 3 && (
                        <span
                          className={`position-absolute top-50 start-50 w-50 border-top border-3 translate-middle-y ${connectorClass(!isLoss && targetHit >= 3)}`}
                          aria-hidden="true"
                        />
                      )}
                      {index === 4 && (
                        <span
                          className={`position-absolute top-50 start-0 w-100 border-top border-3 translate-middle-y ${connectorClass(!isLoss && targetHit >= 3)}`}
                          aria-hidden="true"
                        />
                      )}
                      {isEntry ? (
                        <span
                          className={`position-relative z-1 border-start border-3 ${isLoss ? "border-danger" : "border-dark"} py-2`}
                          aria-hidden="true"
                        />
                      ) : (
                        <span
                          className={`position-relative z-1 d-flex justify-content-center align-items-center rounded-circle p-2 ${isLoss && index === 0 ? "bg-danger text-white" : complete ? "bg-success text-white" : "bg-secondary-subtle text-white"}`}
                        >
                          <span className="visually-hidden">
                            {complete ? "Achieved" : "Not achieved"}
                          </span>
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="row g-0">
                {labels.map((label, index) => (
                  <div
                    className={`col ${index === 0 ? "text-start" : index === labels.length - 1 ? "text-end" : "text-center"}`}
                    key={label}
                  >
                    <div className="text-body-secondary small mb-1 text-nowrap">
                      {label}
                    </div>
                    <div className="small fw-semibold text-body-emphasis text-nowrap">
                      {points[index] ?? ""}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function StockFutureIntradaySignals() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [signalType, setSignalType] = useState("bullish");
  const [perPage, setPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [dataList, setDataList] = useState([]);
  const [meta, setMeta] = useState({});
  const [todayPL, setTodayPL] = useState({ breakout: null, breakdown: null });
  const [signalCounts, setSignalCounts] = useState({});
  const [tradeSummary, setTradeSummary] = useState({});
  const [selectedCoCode, setSelectedCoCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 992px)");
    const updateDesktop = () => setIsDesktop(desktopQuery.matches);
    updateDesktop();
    desktopQuery.addEventListener("change", updateDesktop);
    return () => desktopQuery.removeEventListener("change", updateDesktop);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    api.uapi
      .getStockFutureIntradaySignals({
        perPage,
        currentPage,
        signalType,
        signal: controller.signal,
      })
      .then((response) => {
        const pageData = getPageData(response);
        setDataList(pageData.dataList);
        setSelectedCoCode("");
        setMeta(pageData.meta);
        setTodayPL({
          breakout: pageData.todaysBreakoutPL,
          breakdown: pageData.todaysBreakdownPL,
        });
        setSignalCounts({
          bullish: pageData.totalBreakout,
          bearish: pageData.totalBreakdown,
        });
        setTradeSummary({
          executedTrades: pageData.executedTrades ?? 0,
          targetAchieved: pageData.targetAchieved ?? 0,
          slTriggered: pageData.slTriggered ?? 0,
        });
      })
      .catch((requestError) => {
        if (controller.signal.aborted) return;
        setError(
          requestError.message || "Unable to load stock future intraday calls.",
        );
        setDataList([]);
        setMeta({});
        setTradeSummary({});
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [perPage, currentPage, signalType]);

  const totalRecords = Number(meta.totalRecords ?? 0);
  const totalPages = Number(meta.totalPages ?? 0);
  const canGoNext = currentPage < totalPages;
  const generatedDate = formatGeneratedAt(meta.lastUpdatedAt);
  const selectedPL =
    signalType === "bullish" ? todayPL.breakout : todayPL.breakdown;
  const numericSelectedPL =
    selectedPL === null || selectedPL === undefined || selectedPL === ""
      ? Number.NaN
      : Number(selectedPL);
  const selectedSignal =
    dataList.find((signal) => String(signal.coCode) === selectedCoCode) ??
    dataList[0] ??
    null;

  const changeSignalType = (nextType) => {
    if (signalType === nextType) return;
    setSignalType(nextType);
    setCurrentPage(1);
    setSelectedCoCode("");
  };

  const selectSignal = (signal) => {
    setSelectedCoCode(String(signal.coCode ?? ""));
    const offcanvasElement = document.getElementById(
      "stock-future-intraday-chart-offcanvas",
    );
    if (
      offcanvasElement &&
      window.getComputedStyle(offcanvasElement).position === "fixed"
    ) {
      Offcanvas.getOrCreateInstance(offcanvasElement, {
        backdrop: true,
        scroll: false,
      }).show();
    }
  };

  return (
    <main className="bg-light flex-grow-1">
      <div className="container-fluid py-3">
        <DashboardBreadcrumb currentPage="Stock Future Intraday" />
        <div className="row justify-content-start">
          <div className="col-12">
            <div className="row g-0 mb-3 rounded-3 border bg-white">
              <div className="col-12 col-lg-5 p-3">
                <div className="mb-3">
                  <h1 className="fs-2 fw-bold mb-1">
                    Stock Future Intraday Calls
                  </h1>
                  {generatedDate && (
                    <p className="small text-body-secondary mb-0">
                      Generated on {generatedDate}
                    </p>
                  )}
                </div>

                <div className="d-flex flex-nowrap align-items-center gap-2">
                  <div
                    className="d-inline-flex align-items-center overflow-hidden rounded-pill border bg-white shadow-sm flex-shrink-0"
                    role="tablist"
                    aria-label="Stock futures signal direction"
                  >
                    {[
                      ["bullish", "Buy trades"],
                      ["bearish", "Sell trades"],
                    ].map(([value, label]) => {
                      const active = signalType === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          role="tab"
                          aria-selected={active}
                          className={`btn btn-sm d-inline-flex align-items-center gap-2 border-0 rounded-0 px-3 ${active ? "bg-success bg-opacity-10 text-success" : "text-body-emphasis"}`}
                          onClick={() => changeSignalType(value)}
                        >
                          {label}
                          <span
                            className={`badge d-inline-flex align-items-center justify-content-center flex-shrink-0 rounded-circle p-1 small ${active ? "bg-white text-success" : "bg-dark text-white"}`}
                          >
                            {signalCounts[value]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="col-12 col-lg-7 overflow-hidden">
                <div className="row g-0 h-100 flex-nowrap flex-lg-wrap overflow-auto dashboard-indices-scroll">
                  <div className="col-8 col-lg-3 flex-shrink-0 position-relative d-flex flex-column justify-content-center p-3 my-lg-3">
                    <span
                      className="position-absolute top-0 bottom-0 start-0 border-start d-none d-lg-block"
                      aria-hidden="true"
                    />
                    <span className="text-body-secondary text-nowrap">
                      Executed Trades
                    </span>
                    <strong className="fs-4 lh-sm text-body-emphasis">
                      {tradeSummary.executedTrades ?? 0}
                    </strong>
                  </div>

                  <div className="col-8 col-lg-3 flex-shrink-0 d-flex flex-column justify-content-center border-start p-3 my-lg-3">
                    <span className="text-body-secondary text-nowrap">
                      Target Achieved
                    </span>
                    <strong className="fs-4 lh-sm text-body-emphasis">
                      {tradeSummary.targetAchieved ?? 0}
                    </strong>
                  </div>

                  <div className="col-8 col-lg-3 flex-shrink-0 d-flex flex-column justify-content-center border-start p-3 my-lg-3">
                    <span className="text-body-secondary text-nowrap">
                      SL Triggered
                    </span>
                    <strong className="fs-4 lh-sm text-body-emphasis">
                      {tradeSummary.slTriggered ?? 0}
                    </strong>
                  </div>

                  <div className="col-8 col-lg-3 flex-shrink-0 d-flex flex-column justify-content-center border-start p-3 my-lg-3">
                    <span className="text-body-secondary text-nowrap">
                      Day&apos;s P&amp;L
                    </span>
                    <strong
                      className={`fs-4 lh-sm ${
                        Number.isFinite(numericSelectedPL) &&
                        numericSelectedPL < 0
                          ? "text-danger"
                          : Number.isFinite(numericSelectedPL)
                            ? "text-success"
                            : "text-body-secondary"
                      }`}
                    >
                      ₹ {formatProfitLoss(selectedPL)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="row g-3 align-items-start">
              <div className="col-12 col-lg-6 order-1">
                {loading ? (
                  <div
                    className="rounded-3 border bg-body p-5 text-center text-body-secondary"
                    role="status"
                  >
                    <span
                      className="spinner-border spinner-border-sm text-warning me-2"
                      aria-hidden="true"
                    />
                    Loading {signalType === "bullish" ? "buy" : "sell"} calls…
                  </div>
                ) : error ? (
                  <div className="alert alert-warning rounded-3" role="alert">
                    {error}
                  </div>
                ) : dataList.length ? (
                  dataList.map((signal) => (
                    <SignalCard
                      key={signal.coCode}
                      signal={signal}
                      isDesktop={isDesktop}
                      selected={
                        String(signal.coCode) === String(selectedSignal?.coCode)
                      }
                      onSelect={() => selectSignal(signal)}
                    />
                  ))
                ) : (
                  <div className="rounded-3 border bg-body p-4 text-center text-body-secondary">
                    No calls found.
                  </div>
                )}

                <div className="d-flex flex-column flex-md-row align-items-stretch align-items-md-center gap-2 border-top pt-3 mt-3">
                  <small className="text-body-secondary text-nowrap flex-shrink-0">
                    {totalRecords
                      ? `Showing ${(currentPage - 1) * perPage + 1} to ${Math.min(currentPage * perPage, totalRecords)} of ${totalRecords}`
                      : `Page ${currentPage}${totalPages ? ` of ${totalPages}` : ""}`}
                  </small>
                  <div className="d-flex align-items-center justify-content-between justify-content-md-end gap-2 gap-sm-3 flex-grow-1 ms-md-auto">
                    <nav aria-label="Stock future intraday pages">
                      <ul className="pagination pagination-sm mb-0">
                        <li
                          className={`page-item ${currentPage <= 1 || loading ? "disabled" : ""}`}
                        >
                          <button
                            type="button"
                            className="page-link"
                            onClick={() =>
                              setCurrentPage((page) => Math.max(1, page - 1))
                            }
                            disabled={currentPage <= 1 || loading}
                            aria-label="Previous page"
                          >
                            <i
                              className="bi bi-chevron-left"
                              aria-hidden="true"
                            />
                          </button>
                        </li>
                        <li className="page-item active" aria-current="page">
                          <span className="page-link">{currentPage}</span>
                        </li>
                        <li className="page-item disabled">
                          <span className="page-link">
                            of {totalPages || 1}
                          </span>
                        </li>
                        <li
                          className={`page-item ${!canGoNext || loading ? "disabled" : ""}`}
                        >
                          <button
                            type="button"
                            className="page-link"
                            onClick={() => setCurrentPage((page) => page + 1)}
                            disabled={!canGoNext || loading}
                            aria-label="Next page"
                          >
                            <i
                              className="bi bi-chevron-right"
                              aria-hidden="true"
                            />
                          </button>
                        </li>
                      </ul>
                    </nav>
                    <label className="d-flex align-items-center gap-2 small text-body-secondary text-nowrap">
                      Per page
                      <select
                        className="form-select form-select-sm w-auto"
                        value={perPage}
                        onChange={(event) => {
                          setPerPage(Number(event.target.value));
                          setCurrentPage(1);
                        }}
                        aria-label="Rows per page"
                      >
                        {PAGE_SIZES.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              </div>
              <div
                className="col-12 col-lg-6 order-2 sticky-lg-top align-self-start"
                style={{ zIndex: isDesktop ? 1 : "auto" }}
              >
                <div
                  className="offcanvas-lg offcanvas-bottom h-auto overflow-y-auto w-100"
                  tabIndex="-1"
                  id="stock-future-intraday-chart-offcanvas"
                  data-bs-backdrop="true"
                  data-bs-scroll="false"
                  aria-labelledby="stock-future-intraday-chart-offcanvas-title"
                >
                  <div className="offcanvas-header d-lg-none">
                    <h2
                      className="offcanvas-title fs-6 fw-bold"
                      id="stock-future-intraday-chart-offcanvas-title"
                    >
                      Stock Future Intraday Chart
                    </h2>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => {
                        const offcanvasElement = document.getElementById(
                          "stock-future-intraday-chart-offcanvas",
                        );
                        if (offcanvasElement) {
                          Offcanvas.getOrCreateInstance(
                            offcanvasElement,
                          ).hide();
                        }
                      }}
                      aria-label="Close chart"
                    />
                  </div>
                  <div className="offcanvas-body p-0">
                    <IntradaySignalChart signal={selectedSignal} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
