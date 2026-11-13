import { useEffect, useRef, useState } from "react";
import {
  Chart,
  ArcElement,
  CategoryScale,
  DoughnutController,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { useSelector } from "react-redux";
import api from "../services/api.js";
import { selectEapiAuth } from "../store/eapiAuthSlice.js";
import { selectUapiAuth } from "../store/uapiAuthSlice.js";
import { getUserName } from "../utils/authResponse.js";
import NotificationSettingsModal from "../components/NotificationSettingsModal.jsx";
import DiwaliBanner from "../components/DiwaliBanner.jsx";
import idtWhiteLogo from "../assets/idt-logo-white.svg";
import idtBlackLogo from "../assets/idt-logo-black.svg";
import suggestFeatureImage from "../assets/suggest_feature.svg";
import {
  getNotificationFcmToken,
  registerNotificationToken,
} from "../notificationService.js";

const MARKET_PULSE_COLORS = [
  "#f43f5e",
  "#ff8748",
  "#f6c544",
  "#8bcf65",
  "#19b57a",
];

Chart.register(
  ArcElement,
  CategoryScale,
  DoughnutController,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
);

const INDEX_CARDS = [
  { label: "Nifty 50", aliases: ["NIFTY 50"] },
  { label: "Sensex", aliases: ["SENSEX"] },
  { label: "Bank Nifty", aliases: ["NIFTY BANK", "BANK NIFTY"] },
  {
    label: "Finnifty",
    aliases: ["FINNIFTY", "NIFTY FINANCIAL SERVICES", "NIFTY FIN SERVICE"],
  },
  // {
  //   label: "Midcap Nifty",
  //   aliases: ["NIFTY MIDCAP SELECT", "MIDCAP NIFTY", "NIFTY MIDCAP 50"],
  // },
];

const INTRADAY_TRADES = [
  {
    title: "Live Options Trades",
    description: "Get Nifty, Banknifty,  Sensex & Stock Options Trades.",
    href: "/live-calls-list",
    icon: "bi-lightning-charge",
    tone: "warning",
  },
  {
    title: "Cash Intraday Trades",
    description: "Buy & sell trades with entry, targets and stop loss.",
    href: "/cash-intraday-list",
    icon: "bi-currency-rupee",
    tone: "primary",
  },
  {
    title: "Stock Futures Trades",
    description: "Stock futures with entry, targets and stop loss.",
    href: "/stock-future-intraday-list",
    icon: "bi-graph-up-arrow",
    tone: "success",
  },
];

const numberFormat = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const roundedNumberFormat = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

const INTRADAY_PERFORMANCE_METRICS = [
  ["Executed Calls", ["executedCalls", "executedCall"]],
  ["Target 1 Achieved", ["target1AchievedCalls", "target1Achieved", "target1"]],
  ["Target 2 Achieved", ["target2AchievedCalls", "target2Achieved", "target2"]],
  ["Target 3 Achieved", ["target3AchievedCalls", "target3Achieved", "target3"]],
  [
    "SL Triggered",
    ["stopLossAchievedCalls", "slTriggered", "stopLossTriggered", "stopLoss"],
  ],
];

const POSITION_VOTE_OPTIONS = [
  {
    value: "bullish",
    label: "Bullish",
    icon: "bi-graph-up-arrow",
    color: "success",
  },
  {
    value: "neutral",
    label: "Neutral",
    icon: "bi-arrow-right",
    color: "warning",
  },
  {
    value: "bearish",
    label: "Bearish",
    icon: "bi-graph-down-arrow",
    color: "danger",
  },
];

function getIndiaDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function getPositionVoteCounts(response) {
  const payload = response?.data ?? response;
  const data = payload?.data ?? payload;
  if (
    !data ||
    typeof data !== "object" ||
    !["bullishVote", "neutralVote", "bearishVote"].some((key) => key in data)
  )
    return null;

  return Object.fromEntries(
    POSITION_VOTE_OPTIONS.map(({ value }) => [
      value,
      {
        count: Number(data[`${value}Vote`]) || 0,
        percentage: Number(data[`${value}VotePer`]) || 0,
      },
    ]),
  );
}

function PositionVotePanel() {
  const eapiAuth = useSelector(selectEapiAuth);
  const uapiAuth = useSelector(selectUapiAuth);
  const userIdentity =
    eapiAuth?.user?.id ??
    eapiAuth?.user?._id ??
    eapiAuth?.user?.userId ??
    uapiAuth?.user?.id ??
    uapiAuth?.user?._id ??
    uapiAuth?.user?.userId ??
    eapiAuth?.mobileNumber ??
    uapiAuth?.mobileNumber ??
    eapiAuth?.user?.email ??
    uapiAuth?.user?.email;
  const storageKey = userIdentity
    ? `position-vote:${userIdentity}:${getIndiaDate()}`
    : null;
  const [poll, setPoll] = useState(() => {
    let savedVote = "";
    if (storageKey && typeof window !== "undefined") {
      try {
        savedVote = window.localStorage.getItem(storageKey) || "";
      } catch {
        // Keep the poll available if browser storage is disabled.
      }
    }
    return {
      storageKey,
      selectedVote: savedVote,
      voteCounts: null,
      submitting: false,
      hasVoted: Boolean(savedVote),
    };
  });

  // A changed account or date key starts a fresh poll state.
  const hasVoted =
    storageKey && poll.hasVoted && poll.storageKey === storageKey;
  const selectedVote = hasVoted ? poll.selectedVote : "";
  const voteCounts = hasVoted ? poll.voteCounts : null;
  const submitting = poll.submitting;

  useEffect(() => {
    let active = true;

    const loadExistingVote = async () => {
      let savedVote = "";
      if (storageKey && typeof window !== "undefined") {
        try {
          savedVote = window.localStorage.getItem(storageKey) || "";
        } catch {
          // Storage is optional.
        }
      }

      if (savedVote) {
        setPoll((state) => ({
          ...state,
          storageKey,
          selectedVote: savedVote,
          hasVoted: true,
        }));
        try {
          const response = await api.uapi.getPositionVotes(getIndiaDate());
          if (active)
            setPoll((state) => ({
              ...state,
              voteCounts: getPositionVoteCounts(response),
            }));
        } catch {
          // Results remain hidden if today's totals cannot load.
        }
      } else if (active) {
        setPoll((state) => ({
          ...state,
          storageKey,
          selectedVote: "",
          hasVoted: false,
          voteCounts: null,
        }));
      }
    };

    loadExistingVote();
    return () => {
      active = false;
    };
  }, [storageKey]);

  const submitVote = async (vote) => {
    if (submitting || hasVoted) return;
    setPoll((state) => ({ ...state, submitting: true }));

    try {
      await api.uapi.submitPositionVote(vote);
      setPoll((state) => ({
        ...state,
        storageKey,
        selectedVote: vote,
        hasVoted: true,
      }));
      if (storageKey && typeof window !== "undefined") {
        try {
          window.localStorage.setItem(storageKey, vote);
        } catch {
          // The successful vote remains locked for this page session.
        }
      }
    } catch (error) {
      setPoll((state) => ({ ...state, submitting: false }));
      return;
    }

    try {
      const response = await api.uapi.getPositionVotes(getIndiaDate());
      setPoll((state) => ({
        ...state,
        voteCounts: getPositionVoteCounts(response),
      }));
    } catch {
    } finally {
      setPoll((state) => ({ ...state, submitting: false }));
    }
  };

  return (
    <section aria-labelledby="position-vote-title">
      <div className="col-12 col-lg-12">
        <div className="card border rounded-4">
          <div className="card-body p-3">
            <div className="d-flex flex-wrap align-items-start justify-content-between gap-1 mb-1">
              <div>
                <h2
                  className="fs-6 fw-bold text-body-emphasis mb-2"
                  id="position-vote-title"
                >
                  How are you positioned today?
                </h2>
                <p className="small text-body-secondary mb-0">
                  One tap. See what other traders think
                </p>
              </div>
              <small className="text-body-secondary">
                {hasVoted && voteCounts
                  ? "Market mood"
                  : "Vote to see the market mood"}
              </small>
            </div>
            <div className="row g-2">
              {POSITION_VOTE_OPTIONS.map((option) => {
                const count = voteCounts?.[option.value]?.count ?? 0;
                const percentage = voteCounts?.[option.value]?.percentage ?? 0;
                return (
                  <div className="col-4" key={option.value}>
                    <button
                      type="button"
                      className={`btn w-100 h-100 border-0 bg-${option.color} bg-opacity-25 text-${option.color} d-flex flex-column align-items-center justify-content-center py-1`}
                      disabled={submitting || hasVoted}
                      aria-pressed={selectedVote === option.value}
                      onClick={() => submitVote(option.value)}
                    >
                      <i
                        className={`bi ${option.icon} mb-0`}
                        aria-hidden="true"
                      />
                      <span className="small">{option.label}</span>
                      {hasVoted && voteCounts && (
                        <small className="small">
                          {count} vote{count === 1 ? "" : "s"} ({percentage}%)
                        </small>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function getMarketPulsePayload(response) {
  const payload = response?.data ?? response;
  if (payload?.status === false || payload?.success === false) {
    throw new Error(payload.message || "Unable to load market pulse.");
  }
  return payload?.data ?? payload;
}

function MarketPulseGauge({ trend }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return undefined;
    let needleAnimationFrame = null;
    const needleAnimationStartTime = performance.now();
    const needle = {
      id: "marketPulseNeedle",
      afterDraw(chart) {
        const arc = chart.getDatasetMeta(0).data[Number(trend?.level) - 1];
        if (!arc) return;
        const firstArc = chart.getDatasetMeta(0).data[0];
        if (!firstArc) return;
        const { x: cx, y: cy, outerRadius: radius } = arc;
        const startAngle = firstArc.startAngle;
        const targetAngle = (arc.startAngle + arc.endAngle) / 2;
        const progress = Math.min(
          (performance.now() - needleAnimationStartTime) / 900,
          1,
        );
        const easedProgress = 1 - (1 - progress) ** 2;
        const angle = startAngle + (targetAngle - startAngle) * easedProgress;
        const length = radius * 0.68;
        const ctx = chart.ctx;
        const tipX = cx + Math.cos(angle) * length;
        const tipY = cy + Math.sin(angle) * length;
        const perpX = -Math.sin(angle) * 3;
        const perpY = Math.cos(angle) * 3;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx + perpX, cy + perpY);
        ctx.lineTo(tipX, tipY);
        ctx.lineTo(cx - perpX, cy - perpY);
        ctx.closePath();
        ctx.fillStyle = "#172033";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#172033";
        ctx.beginPath();
        ctx.arc(cx, cy, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (progress < 1 && needleAnimationFrame === null) {
          needleAnimationFrame = requestAnimationFrame(() => {
            needleAnimationFrame = null;
            chart.draw();
          });
        }
      },
    };
    const chart = new Chart(canvasRef.current, {
      type: "doughnut",
      data: {
        datasets: [
          {
            data: MARKET_PULSE_COLORS.map(() => 1),
            backgroundColor: MARKET_PULSE_COLORS,
            borderWidth: 0,
            borderRadius: 10,
            spacing: -12,
            hoverOffset: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        rotation: 270,
        circumference: 180,
        cutout: "88%",
        layout: { padding: { top: 6, right: 2, bottom: 22, left: 2 } },
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
      },
      plugins: [needle],
    });
    return () => {
      if (needleAnimationFrame !== null) {
        cancelAnimationFrame(needleAnimationFrame);
      }
      chart.destroy();
    };
  }, [trend?.level]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={`Market sentiment: ${trend?.label || "Unavailable"}`}
    />
  );
}

function copyComputedStyles(source, target) {
  const computed = window.getComputedStyle(source);
  for (const property of computed) {
    target.style.setProperty(property, computed.getPropertyValue(property));
  }
}

function cloneForImage(source) {
  if (!(source instanceof Element)) return source.cloneNode(true);
  if (source instanceof HTMLCanvasElement) {
    const image = new Image();
    image.src = source.toDataURL("image/png");
    copyComputedStyles(source, image);
    image.width = source.width;
    image.height = source.height;
    return image;
  }

  const clone = source.cloneNode(false);
  copyComputedStyles(source, clone);
  source.childNodes.forEach((child) => {
    const childClone = cloneForImage(child);
    if (child instanceof HTMLCanvasElement) {
      childClone.style.width = `${child.getBoundingClientRect().width}px`;
      childClone.style.height = `${child.getBoundingClientRect().height}px`;
      childClone.style.display = "block";
    }
    clone.append(childClone);
  });
  return clone;
}

async function shareElementAsPng(element, filename) {
  const width = element.offsetWidth;
  const height = element.offsetHeight;
  const scale = window.devicePixelRatio || 1;
  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Unable to create image canvas.");
  context.scale(scale, scale);

  const clone = cloneForImage(element);
  clone.style.setProperty("opacity", "1", "important");
  clone.style.setProperty("visibility", "visible", "important");
  const wrapper = document.createElement("div");
  wrapper.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
  wrapper.style.width = `${width}px`;
  wrapper.style.height = `${height}px`;
  wrapper.append(clone);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><foreignObject width="100%" height="100%">${new XMLSerializer().serializeToString(wrapper)}</foreignObject></svg>`;
  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });
  context.drawImage(image, 0, 0, width, height);

  const sourceRect = element.getBoundingClientRect();
  const chartCanvas = element.querySelector("canvas");
  if (chartCanvas?.width && chartCanvas?.height) {
    const chartRect = chartCanvas.getBoundingClientRect();
    context.drawImage(
      chartCanvas,
      chartRect.left - sourceRect.left,
      chartRect.top - sourceRect.top,
      chartRect.width,
      chartRect.height,
    );
  }

  const blob = await new Promise((resolve, reject) =>
    canvas.toBlob((result) =>
      result ? resolve(result) : reject(new Error("Unable to create image.")),
    ),
  );

  const file = new File([blob], filename, { type: "image/png" });
  if (!navigator.share || !navigator.canShare?.({ files: [file] })) {
    throw new Error("Image sharing is not supported on this browser.");
  }
  await navigator.share({
    files: [file],
    title: "Market Pulse",
    text: [
      "Get market insights, live trade calls and stock analysis in one app.",
      "",
      "Download on Google Play:",
      "https://play.google.com/store/apps/details?id=com.intraday.traders",
      "",
      "Download on App Store:",
      "https://apps.apple.com/in/app/intraday-traders/id6810132854",
    ].join("\n"),
  });
}

function MarketPulseShareCard({ data, rows, sentimentLabel, sentimentColor }) {
  const trend = data?.trend ?? {};
  const sentimentDate =
    formatActivityDate(data?.date) || formatActivityDate(new Date());
  return (
    <div
      className="card border rounded-4 overflow-hidden bg-white text-dark"
      style={{
        width: 360,
        background:
          "linear-gradient(180deg, #fff6ef 0px, #fffaf6 170px, #ffffff 225px)",
      }}
    >
      <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center px-4 py-3">
        <img src={idtBlackLogo} alt="IDT" width="42" height="32" />
        <div className="text-center">
          <div className="fw-bold small">Market Pulse By</div>
          <div className="small text-body-emphasis">
            <small>Intraday Traders</small>
          </div>
        </div>
      </div>
      <div className="card-body px-4 pt-3 pb-2">
        <div className="ratio mx-auto" style={{ "--bs-aspect-ratio": "55%" }}>
          <MarketPulseGauge trend={trend} />
        </div>
        <div className="d-flex justify-content-between text-secondary small text-nowrap">
          <span className="flex-shrink-0">BEARISH</span>
          <span className="flex-shrink-0">BULLISH</span>
        </div>
        <h2
          className={`h4 text-${sentimentColor}  text-center fw-bold mt-3 mb-0`}
        >
          {sentimentLabel}
        </h2>
        <p className="text-secondary small text-center mb-3">
          Overall market sentiment as on {sentimentDate}
        </p>
        <div className="border-top">
          {rows
            .filter((row) => row.value)
            .map((row) => (
              <div
                className="d-flex justify-content-between align-items-center gap-2 py-2 border-bottom"
                key={row.label}
              >
                <div className="min-w-0">
                  <div className="small fw-semibold">
                    {row.shareLabel ?? row.label}
                  </div>
                  <div className="small text-secondary">
                    {row.shareDetail ?? row.detail ?? ""}
                  </div>
                </div>
                {row.badge && (
                  <span
                    className={`badge rounded-pill bg-${row.badge.color} bg-opacity-10 ${row.badge.color === "warning" ? "text-warning-emphasis" : `text-${row.badge.color}`} flex-shrink-0`}
                  >
                    {row.badge.label}
                  </span>
                )}
              </div>
            ))}
        </div>
      </div>
      <div className="card-footer bg-dark text-white text-center small py-2">
        Daily briefs, live calls &amp; tools on the IDT app
      </div>
    </div>
  );
}

function MarketPulseCard({ data, error }) {
  const cardRef = useRef(null);
  const shareCardRef = useRef(null);
  const trend = data?.trend ?? {};
  const getLabelBadge = (label) => {
    if (!label) return null;
    const text = String(label);
    const color =
      /bearish|selling|negative|high volatility|high declines|declining/i.test(
        text,
      )
        ? "danger"
        : /bullish|buying|low volatility|high|high advances/i.test(text)
          ? "success"
          : /neutral|moderate volatility/i.test(text)
            ? "warning"
            : "body-secondary";
    return { label: text, color };
  };
  const sentimentLabel = trend.label ?? "—";
  const sentimentColor = getLabelBadge(trend.label)?.color ?? "body-emphasis";
  const scoreLabel = trend.score != null ? `${trend.score} score` : "";
  const breadth = data?.marketBreadth;
  const fiiDii = data?.cashFiiDii;
  const marketRows = [
    {
      label: "Nifty Trend",
      shareLabel: "Nifty",
      value: data?.nifty50,
      badge: getLabelBadge(data?.nifty50?.label),
      detail: data?.nifty50 && `${data.nifty50.ltp} · ${data.nifty50.change}%`,
      shareDetail:
        data?.nifty50 &&
        `${data.nifty50.change > 0 ? "+" : ""}${data.nifty50.change}%`,
    },
    {
      label: "Bank Nifty Trend",
      shareLabel: "Bank Nifty",
      value: data?.niftyBank,
      badge: getLabelBadge(data?.niftyBank?.label),
      detail:
        data?.niftyBank && `${data.niftyBank.ltp} · ${data.niftyBank.change}%`,
      shareDetail:
        data?.niftyBank &&
        `${data.niftyBank.change > 0 ? "+" : ""}${data.niftyBank.change}%`,
    },
    {
      label: "Market Breadth",
      value: breadth,
      badge: getLabelBadge(breadth?.label),
      shareDetail:
        breadth &&
        `${breadth.advancing} advancers vs ${breadth.declining} decliners`,
      detail:
        breadth &&
        `${breadth.advancing} advancers · ${breadth.declining} decliners · ${breadth.flat} flat`,
    },
    {
      label: "India VIX",
      value: data?.indiaVIX,
      badge: getLabelBadge(data?.indiaVIX?.label),
      detail:
        data?.indiaVIX && `${data.indiaVIX.ltp} · ${data.indiaVIX.change}%`,
      shareDetail:
        data?.indiaVIX &&
        `${data.indiaVIX.ltp} · ${data.indiaVIX.change > 0 ? "+" : ""}${data.indiaVIX.change}% today`,
    },
    {
      label: "FII Activity",
      value: fiiDii,
      badge: getLabelBadge(fiiDii?.cashFiiNetLabel),
      detail: fiiDii?.cashFiiNet != null && `${fiiDii.cashFiiNet} Cr`,
      shareDetail:
        fiiDii?.cashFiiNet != null &&
        `${fiiDii.cashFiiNet > 0 ? "+" : ""}${fiiDii.cashFiiNet} Cr`,
    },
    {
      label: "DII Activity",
      value: fiiDii,
      badge: getLabelBadge(fiiDii?.cashDiiNetLabel),
      detail: fiiDii?.cashDiiNet != null && `${fiiDii.cashDiiNet} Cr`,
      shareDetail:
        fiiDii?.cashDiiNet != null &&
        `${fiiDii.cashDiiNet > 0 ? "+" : ""}${fiiDii.cashDiiNet} Cr`,
    },
  ];

  return (
    <article ref={cardRef} className="card border rounded-4">
      <div className="card-body p-3">
        <div className="d-flex align-items-center gap-2">
          <h2 className="fs-6 fw-bold text-body-emphasis mb-1">
            Market Pulse{" "}
          </h2>
          <span className="badge bg-warning bg-opacity-25 text-warning-emphasis ms-1">
            NEW
          </span>
          <button
            type="button"
            className="btn btn-link text-body-secondary p-0 ms-auto"
            aria-label="Share Market Pulse image"
            title="Share as image"
            onClick={() => {
              if (!shareCardRef.current) return;
              shareElementAsPng(shareCardRef.current, "market-puls.png").catch(
                (error) => {
                  if (error?.name !== "AbortError") {
                    window.alert(
                      error?.message || "Unable to share Market Pulse image.",
                    );
                  }
                },
              );
            }}
          >
            <i className="bi bi-upload" aria-hidden="true" />
          </button>
        </div>
        <small className="text-body-secondary mb-0">
          Everything you need before you take a trade
        </small>
        {error ? (
          <p className="small text-danger mt-2 mb-0" role="alert">
            {error}
          </p>
        ) : data ? (
          <>
            <div
              className="position-fixed top-0 start-0 pe-none"
              style={{
                width: 360,
                opacity: 0,
                zIndex: -1,
                pointerEvents: "none",
              }}
              aria-hidden="true"
              ref={shareCardRef}
            >
              <MarketPulseShareCard
                data={data}
                rows={marketRows}
                sentimentLabel={sentimentLabel}
                sentimentColor={sentimentColor}
              />
            </div>
            <div
              className="ratio mx-auto mt-1"
              style={{ "--bs-aspect-ratio": "55%" }}
            >
              <MarketPulseGauge trend={trend} />
            </div>
            <div className="d-flex justify-content-between small fw-semibold text-body-secondary">
              <span className="small">BEARISH</span>
              <span className="small">BULLISH</span>
            </div>
            <div className={`text-center fw-bold fs-6 text-${sentimentColor}`}>
              {sentimentLabel}
            </div>
            <div className="text-center text-body-secondary mb-1 small">
              <small>
                Overall market sentiment
                {data?.date && ` · ${formatActivityDate(data.date)}`}
                {!data?.date && scoreLabel && ` · ${scoreLabel}`}
              </small>
            </div>
            <div className="border-top">
              {marketRows
                .filter((row) => row.value)
                .map((row, index, rows) => (
                  <div
                    className={`d-flex justify-content-between align-items-center gap-2 py-2 ${index < rows.length - 1 ? "border-bottom" : "pb-0"}`}
                    key={row.label}
                  >
                    <div className="min-w-0">
                      <div className="small fw-semibold">{row.label}</div>
                      {row.detail && (
                        <div className="text-body-secondary small">
                          <small>{row.detail}</small>
                        </div>
                      )}
                    </div>
                    {row.badge && (
                      <span
                        className={`badge rounded-pill bg-${row.badge.color} bg-opacity-10 ${row.badge.color === "warning" ? "text-warning-emphasis" : `text-${row.badge.color}`} flex-shrink-0`}
                      >
                        {row.badge.label}
                      </span>
                    )}
                  </div>
                ))}
            </div>
          </>
        ) : (
          <p className="small text-body-secondary mt-2 mb-0">
            Loading market pulse…
          </p>
        )}
      </div>
    </article>
  );
}

function unwrapData(response) {
  return response?.data ?? response;
}

function getIndexRecords(response) {
  const payload = unwrapData(response);
  if (payload?.success === false) {
    throw new Error(payload.message || "Unable to load market indices.");
  }
  return Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : [];
}

function getGiftNiftyRecord(response) {
  const payload = unwrapData(response);
  if (payload?.success === false) {
    throw new Error(payload.message || "Unable to load GIFT Nifty.");
  }
  const records = Array.isArray(payload) ? payload : payload?.data;
  return Array.isArray(records) ? (records[0] ?? null) : (records ?? null);
}

function getUapiData(response, fallbackMessage) {
  const payload = response?.data ?? response;
  if (payload?.status === false) {
    throw new Error(payload.message || fallbackMessage);
  }
  return payload?.data ?? payload;
}

function normalizeName(value) {
  return String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");
}

function findIndexRecord(records, aliases) {
  const names = aliases.map(normalizeName);
  const recordNames = (record) =>
    [record.aliasname, record.lname].map(normalizeName);
  const exactMatch = records.find((record) =>
    recordNames(record).some((recordName) => names.includes(recordName)),
  );
  if (exactMatch) return exactMatch;

  return records.find((record) => {
    return recordNames(record).some((recordName) =>
      names.some((name) => recordName === name || recordName.includes(name)),
    );
  });
}

function getIndexCode(record) {
  if (!record) return "";
  const codeKey = Object.keys(record).find((key) =>
    ["cocode", "cocd", "companycode", "co_code"].includes(
      key.toLowerCase().replace(/[^a-z0-9]/g, ""),
    ),
  );
  return codeKey ? String(record[codeKey] ?? "").trim() : "";
}

function getMarketPredictionLevels(response) {
  const payload = unwrapData(response);
  if (payload?.status === false || payload?.success === false) {
    throw new Error(
      payload.message || "Unable to load support and resistance levels.",
    );
  }
  const levels = { analysis: "", resistance: [], support: [] };
  const visit = (value) => {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    for (const [key, level] of Object.entries(value)) {
      const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (
        normalized === "analysis" &&
        ["string", "number"].includes(typeof level)
      ) {
        levels.analysis = String(level).trim();
      } else if (
        ["support", "resistance"].includes(normalized) &&
        Array.isArray(level)
      ) {
        levels[normalized] = level
          .filter(
            (item) =>
              item !== null && item !== "" && Number.isFinite(Number(item)),
          )
          .map(Number);
      } else if (
        ["support", "resistance"].includes(normalized) &&
        level !== null &&
        level !== "" &&
        Number.isFinite(Number(level)) &&
        levels[normalized].length === 0
      ) {
        levels[normalized] = [Number(level)];
      } else if (level && typeof level === "object") {
        visit(level);
      }
    }
  };
  visit(payload);
  return levels;
}

function getMarketLevelEntries(levels) {
  const resistance = (levels?.resistance ?? [])
    .filter(Number.isFinite)
    .sort((left, right) => left - right)
    .slice(0, 2)
    .reverse();
  const support = (levels?.support ?? [])
    .filter(Number.isFinite)
    .slice(0, 2)
    .sort((left, right) => right - left);

  return [
    ...resistance.map((value, index) => ({
      label: `Ceiling ${resistance.length - index}`,
      value,
      type: "resistance",
    })),
    ...support.map((value, index) => ({
      label: `Floor ${index + 1}`,
      value,
      type: "support",
    })),
  ];
}

function getChartDataPoints(response) {
  const payload = unwrapData(response);
  if (payload?.status === false || payload?.success === false) {
    throw new Error(payload.message || "Unable to load index chart.");
  }
  const findRows = (value) => {
    if (!value || typeof value !== "object") return null;
    if (Array.isArray(value)) {
      if (
        value.length &&
        value.some(
          (row) => row && typeof row === "object" && !Array.isArray(row),
        )
      ) {
        return value;
      }
      return null;
    }
    for (const nested of Object.values(value)) {
      const rows = findRows(nested);
      if (rows) return rows;
    }
    return null;
  };
  const rows = findRows(payload);
  if (!rows) return [];

  const getField = (row, aliases) => {
    const key = Object.keys(row).find((name) =>
      aliases.includes(name.toLowerCase().replace(/[^a-z0-9]/g, "")),
    );
    return key ? row[key] : undefined;
  };
  return rows
    .map((row) => {
      const rawValue = getField(row, [
        "close",
        "closingprice",
        "closeprice",
        "ltp",
        "price",
        "last",
        "value",
        "indexvalue",
      ]);
      const value =
        rawValue === null || rawValue === "" ? Number.NaN : Number(rawValue);
      const label =
        getField(row, [
          "upddate",
          "datetime",
          "date",
          "timestamp",
          "tradedate",
          "time",
        ]) ?? "";
      return Number.isFinite(value)
        ? { label: formatChartTime(label), date: formatChartDate(label), value }
        : null;
    })
    .filter(Boolean);
}

function formatChartDate(value) {
  const label = String(value ?? "").trim();
  const dateMatch = label.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const date = dateMatch
    ? new Date(
        Date.UTC(
          Number(dateMatch[1]),
          Number(dateMatch[2]) - 1,
          Number(dateMatch[3]),
        ),
      )
    : /^\d{10}(?:\d{3})?$/.test(label)
      ? new Date(Number(label) * (label.length === 10 ? 1000 : 1))
      : new Date(label);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).formatToParts(date);
  const part = (type) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("day")} ${part("month")} ${part("year")}`;
}

function formatChartTime(value) {
  if (value === null || value === undefined || value === "") return "";
  const label = String(value).trim();
  const time = label.match(/(?:^|T|\s)(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (time) {
    let minutes = Number(time[1]) * 60 + Number(time[2]);
    if (Number(time[3] || 0) >= 30) minutes += 1;
    return `${String(Math.floor(minutes / 60) % 24).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
  }
  if (/^\d{10}(?:\d{3})?$/.test(label)) {
    const timestamp = Number(label);
    const date = new Date(label.length === 10 ? timestamp * 1000 : timestamp);
    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Kolkata",
      }).format(date);
    }
  }
  return label;
}

function formatMarketSessionTick(label) {
  const [hour, minute] = label.split(":").map(Number);
  const displayHour = hour > 12 ? hour - 12 : hour;
  return `${hour < 10 ? "0" : ""}${displayHour}:${String(minute).padStart(2, "0")}`;
}

function formatMarketMinute(minutes) {
  const label = `${String(Math.floor(minutes / 60) % 24).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
  return formatMarketSessionTick(label);
}

function formatMarketTooltipTime(minutes) {
  const hour = Math.floor(minutes / 60) % 24;
  const minute = minutes % 60;
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour < 12 ? "AM" : "PM"}`;
}

function getMarketSessionMinutes(label) {
  const match = label.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

const MARKET_CHART_SESSION = {
  end: "15:30",
};

const MARKET_CHART_COLORS = {
  price: "#ff8a2b",
  priceFill: "rgba(255, 138, 43, 0.12)",
  ceiling: "#dc3545",
  ceilingFill: "rgba(220, 53, 69, 0.35)",
  floor: "#079b78",
  floorFill: "rgba(12, 185, 143, 0.55)",
};
const MARKET_CHART_Y_PADDING_RATIO = 0.0005;

function formatNumber(value) {
  if (value === null || value === undefined || value === "") return "—";
  const number = Number(value);
  return Number.isFinite(number) ? numberFormat.format(number) : String(value);
}

function formatChange(value) {
  if (value === null || value === undefined || value === "") return "—";
  const number = Number(value);
  if (!Number.isFinite(number)) return String(value);
  return `${number > 0 ? "+" : ""}${numberFormat.format(number)}`;
}

function changeColor(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number === 0) return "text-body-secondary";
  return number > 0 ? "text-success" : "text-danger";
}

function formatUpdatedAt(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).formatToParts(date);
  const part = (type) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("day")} ${part("month")}, ${part("hour")}:${part("minute")} ${part("dayPeriod").toUpperCase()}`;
}

function formatActivityDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).formatToParts(date);
  const part = (type) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("day")} ${part("month")}, ${part("year")}`;
}

function MarketLiveSection({ data, error }) {
  const marketOpen = data?.isMarketOpen === true;
  return (
    <section aria-labelledby="market-live-title">
      <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
        <h2
          className="fs-6 fw-bold text-body-emphasis mb-0 d-flex align-items-center gap-2"
          id="market-live-title"
        >
          Market Live
          <small>
            <i
              className={`bi bi-circle-fill small ${marketOpen ? "text-success" : "text-danger"}`}
              aria-label={marketOpen ? "Market open" : "Market closed"}
            />
          </small>
        </h2>
        {data?.lastUpdatedAt && (
          <span className="small text-body-secondary text-nowrap">
            <small>Updated on {formatUpdatedAt(data.lastUpdatedAt)}</small>
          </span>
        )}
      </div>
      {error ? (
        <p className="small text-danger mb-0" role="alert">
          {error}
        </p>
      ) : data ? (
        <div>
          {data.title && (
            <h3 className="fs-6 fw-semibold mb-3">{data.title}</h3>
          )}
          {Array.isArray(data.details) && data.details.length > 0 && (
            <ul className="list-unstyled small mb-0">
              {data.details.map((detail, index) => (
                <li
                  className={`text-body-secondary ${index === data.details.length - 1 ? "mb-0" : "mb-1"} d-flex align-items-start`}
                  key={`${detail}-${index}`}
                >
                  <i
                    className="bi bi-dot me-1 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </section>
  );
}

function FiiDiiActivitySection({ data, error }) {
  const cash = data?.cash;
  const derivatives = data?.fAndO;
  const sumValues = (...items) => {
    const values = items
      .filter((item) => item !== null && item !== undefined && item !== "")
      .map(Number)
      .filter(Number.isFinite);
    return values.length
      ? values.reduce((total, value) => total + value, 0)
      : null;
  };
  const formatActivityValue = (value) => {
    if (value === null || value === undefined || value === "") return "—";
    const number = Number(value);
    return Number.isFinite(number)
      ? numberFormat.format(number)
      : String(value);
  };
  const cashNet = sumValues(cash?.fiiNet, cash?.diiNet);
  const derivativeItems = [
    ["FII Idx Fut", derivatives?.fiiIndexFutNet],
    ["FII Idx Opt", derivatives?.fiiIndexOptNet],
    ["FII Stk Fut", derivatives?.fiiStockFutNet],
    ["FII Stk Opt", derivatives?.fiiStockOptNet],
  ];
  const derivativesNet = sumValues(
    derivatives?.fiiIndexFutNet,
    derivatives?.fiiIndexOptNet,
    derivatives?.fiiStockFutNet,
    derivatives?.fiiStockOptNet,
  );
  const hasActivity = cashNet !== null || derivativesNet !== null;
  const activityDate = cash?.date || derivatives?.date || data?.fiiSebi?.date;

  return (
    <section aria-labelledby="fii-dii-title">
      <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
        <h2 className="fs-6 fw-bold text-body-emphasis mb-0" id="fii-dii-title">
          FII &amp; DII Activity
        </h2>
        {activityDate && (
          <span className="small text-body-secondary text-nowrap">
            <small>{formatActivityDate(activityDate)}</small>
          </span>
        )}
      </div>
      {error ? (
        <p className="small text-danger mb-0" role="alert">
          {error}
        </p>
      ) : hasActivity ? (
        <div>
          <div className="row g-0">
            <div className="col-4 pe-2">
              <div className="d-flex flex-column py-1 small">
                <span className="text-body-secondary">Net</span>
                <span className={`fw-semibold ${changeColor(cashNet)}`}>
                  {formatActivityValue(cashNet)}
                </span>
              </div>
            </div>
            <div className="col-8 ps-3 border-start">
              <div className="d-flex flex-column gap-2 py-1 small">
                {[
                  ["FII Cash", cash?.fiiNet],
                  ["DII Cash", cash?.diiNet],
                ].map(([label, value]) => (
                  <div
                    className="d-flex justify-content-between gap-2"
                    key={label}
                  >
                    <span className="text-body-secondary">{label}</span>
                    <span className={`fw-semibold ${changeColor(value)}`}>
                      {formatActivityValue(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="row g-0 border-top mt-2 pt-2">
            <div className="col-4 pe-2">
              <div className="d-flex flex-column py-1 small">
                <span className="text-body-secondary">Net Derivatives</span>
                <span className={`fw-semibold ${changeColor(derivativesNet)}`}>
                  {formatActivityValue(derivativesNet)}
                </span>
              </div>
            </div>
            <div className="col-8 ps-3 border-start">
              <div className="d-flex flex-column gap-2 py-1 small">
                {derivativeItems.map(([label, value]) => (
                  <div
                    className="d-flex justify-content-between gap-2"
                    key={label}
                  >
                    <span className="text-body-secondary">{label}</span>
                    <span className={`fw-semibold ${changeColor(value)}`}>
                      {formatActivityValue(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

const MARKET_CHART_INDICES = [
  { label: "Nifty 50", aliases: ["NIFTY 50"], exchange: "nse" },
  {
    label: "Bank nifty",
    aliases: ["NIFTY BANK", "BANK NIFTY"],
    exchange: "nse",
  },
  { label: "Sensex", aliases: ["SENSEX"], exchange: "bse" },
];

function IndexLevelsSection({ indices, isMarketLive }) {
  const [selectedIndex, setSelectedIndex] = useState(MARKET_CHART_INDICES[0]);
  const [chartPoints, setChartPoints] = useState([]);
  const [levels, setLevels] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [chartError, setChartError] = useState("");
  const [levelsError, setLevelsError] = useState("");
  const chartCanvasRef = useRef(null);
  const indexRecord = findIndexRecord(indices, selectedIndex.aliases);
  const coCode = getIndexCode(indexRecord);
  const currentValue = indexRecord?.Last;
  const percentChange = indexRecord?.Change;

  useEffect(() => {
    if (!coCode) {
      setChartPoints([]);
      setLevels(null);
      setChartError("Index data is not available.");
      setLevelsError("Index data is not available.");
      return undefined;
    }

    const controller = new AbortController();
    let active = true;
    setChartPoints([]);
    setLevels(null);
    setChartError("");
    setLevelsError("");

    api.cmots
      .getPriceChartData(coCode, selectedIndex.exchange, {
        signal: controller.signal,
      })
      .then((response) => {
        if (active) {
          setChartPoints(getChartDataPoints(response));
          setChartError("");
        }
      })
      .catch((error) => {
        if (active && error.name !== "CanceledError") {
          setChartError(error.message || "Unable to load index chart.");
        }
      });

    api.uapiServe
      .getMarketPredictions(coCode, { signal: controller.signal })
      .then((response) => {
        if (active) {
          setLevels(getMarketPredictionLevels(response));
          setLevelsError("");
        }
      })
      .catch((error) => {
        if (active && error.name !== "CanceledError") {
          setLevelsError(
            error.message || "Unable to load support and resistance levels.",
          );
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [coCode, selectedIndex]);

  useEffect(() => {
    const canvas = chartCanvasRef.current;
    if (!canvas || !chartPoints.length) return undefined;
    const chartDataPoints = chartPoints
      .map(({ label, value, date }) => ({
        time: getMarketSessionMinutes(label),
        value,
        date,
      }))
      .filter(({ time, value }) => time !== null && Number.isFinite(value))
      .sort((left, right) => left.time - right.time);
    const sessionPrices = chartDataPoints.map(({ value }) => value);
    if (!sessionPrices.length) return undefined;
    const chartStartMinutes = chartDataPoints[0].time;
    const latestDataTime = chartDataPoints.at(-1).time;
    const chartDate = chartDataPoints.at(-1).date;
    const chartSessionEndMinutes = getMarketSessionMinutes(
      MARKET_CHART_SESSION.end,
    );
    const chartEndMinutes = Math.max(latestDataTime, chartSessionEndMinutes);
    const chartEndLabel =
      latestDataTime > chartSessionEndMinutes
        ? formatMarketMinute(latestDataTime)
        : MARKET_CHART_SESSION.end;
    const chartTimes = [
      ...new Set([
        chartStartMinutes,
        ...chartDataPoints.map(({ time }) => time),
        chartEndMinutes,
      ]),
    ].sort((left, right) => left - right);
    const pricesByTime = new Map(
      chartDataPoints.map(({ time, value }) => [time, value]),
    );
    const levelValues = getMarketLevelEntries(levels).map((level) => ({
      ...level,
      color:
        MARKET_CHART_COLORS[level.type === "resistance" ? "ceiling" : "floor"],
      fill: MARKET_CHART_COLORS[
        level.type === "resistance" ? "ceilingFill" : "floorFill"
      ],
    }));
    const chartValues = [
      ...sessionPrices,
      ...levelValues.map(({ value }) => value),
    ];
    const chartMinValue = Math.min(...chartValues);
    const chartMaxValue = Math.max(...chartValues);
    const chartPadding =
      Math.max(Math.abs(chartMinValue), Math.abs(chartMaxValue)) *
      MARKET_CHART_Y_PADDING_RATIO;
    const chart = new Chart(canvas, {
      type: "line",
      data: {
        datasets: [
          {
            label: selectedIndex.label,
            data: chartTimes.map((time) => ({
              x: time,
              y: pricesByTime.get(time) ?? null,
            })),
            clip: false,
            borderColor: MARKET_CHART_COLORS.price,
            backgroundColor: MARKET_CHART_COLORS.priceFill,
            borderWidth: 2,
            pointRadius: chartTimes.map((time) =>
              time === latestDataTime ? 5 : 0,
            ),
            pointHoverRadius: 5,
            pointBackgroundColor: "#fff",
            pointBorderColor: MARKET_CHART_COLORS.price,
            pointBorderWidth: 1.5,
            fill: false,
            tension: 0.25,
          },
          ...levelValues.map(({ label, value, color }) => ({
            label,
            data: chartTimes.map((time) => ({ x: time, y: value })),
            borderColor: color,
            borderDash: [4, 4],
            borderWidth: 1,
            pointRadius: 0,
            pointHoverRadius: 0,
            pointHitRadius: 0,
            fill: false,
          })),
        ],
      },
      plugins: [
        {
          id: "indexLevelBands",
          beforeDatasetsDraw(chartInstance) {
            if (!levelValues.length) return;
            const { ctx, chartArea, scales } = chartInstance;
            if (!chartArea) return;
            const y = scales.y;
            const levelsOnChart = levelValues
              .map(({ label, value, color, fill }) => ({
                label,
                color,
                fill,
                pixel: y.getPixelForValue(value),
              }))
              .filter(({ pixel }) => Number.isFinite(pixel))
              .sort((left, right) => left.pixel - right.pixel);

            ctx.save();
            ctx.globalAlpha = 1;
            ctx.filter = "none";
            ctx.shadowBlur = 0;
            const highestCeiling = levelsOnChart.find(({ label }) =>
              label.startsWith("Ceiling"),
            );
            if (highestCeiling && highestCeiling.pixel > chartArea.top) {
              ctx.fillStyle = MARKET_CHART_COLORS.ceilingFill;
              ctx.globalAlpha = 0.12;
              ctx.fillRect(
                chartArea.left,
                chartArea.top,
                chartArea.right - chartArea.left,
                highestCeiling.pixel - chartArea.top,
              );
            }
            const lowestFloor = levelsOnChart.findLast(({ label }) =>
              label.startsWith("Floor"),
            );
            if (lowestFloor && lowestFloor.pixel < chartArea.bottom) {
              ctx.fillStyle = MARKET_CHART_COLORS.floorFill;
              ctx.globalAlpha = 0.12;
              ctx.fillRect(
                chartArea.left,
                lowestFloor.pixel,
                chartArea.right - chartArea.left,
                chartArea.bottom - lowestFloor.pixel,
              );
            }
            levelsOnChart.forEach((level, index) => {
              const next = levelsOnChart[index + 1];
              if (!next) return;
              ctx.fillStyle = level.fill;
              ctx.globalAlpha = 0.12;
              ctx.fillRect(
                chartArea.left,
                level.pixel,
                chartArea.right - chartArea.left,
                next.pixel - level.pixel,
              );
            });
            ctx.restore();
          },
          afterDraw(chartInstance) {
            const { ctx, chartArea, scales } = chartInstance;
            if (!chartArea) return;
            ctx.save();
            ctx.font = window.matchMedia("(max-width: 575.98px)").matches
              ? "700 9px Arial, sans-serif"
              : "700 11px Arial, sans-serif";
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            levelValues.forEach(({ label, value, type }) => {
              const y = scales.y.getPixelForValue(value);
              if (y < chartArea.top || y > chartArea.bottom) return;
              ctx.fillStyle = type === "resistance" ? "#b02a37" : "#146c43";
              ctx.fillText(label, chartArea.right + 2, y);
            });

            const active = chartInstance
              .getActiveElements()
              .find(({ datasetIndex }) => datasetIndex === 0);
            const point =
              active && chartInstance.data.datasets[0].data[active.index];
            if (Number.isFinite(point?.y)) {
              const { x } = active.element.getCenterPoint();
              ctx.beginPath();
              ctx.setLineDash([3, 3]);
              ctx.lineWidth = 1;
              ctx.strokeStyle = "rgba(108, 117, 125, 0.65)";
              ctx.moveTo(x, chartArea.top);
              ctx.lineTo(x, chartArea.bottom);
              ctx.stroke();
              ctx.setLineDash([]);
            }
            ctx.restore();
          },
        },
      ],
      options: {
        responsive: true,
        animation: false,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false, axis: "x" },
        devicePixelRatio: Math.max(window.devicePixelRatio || 1, 2),
        layout: {
          padding: {
            right: window.matchMedia("(max-width: 575.98px)").matches ? 42 : 49,
            top: 4,
            bottom: 0,
            left: 0,
          },
        },
        onResize(chartInstance, size) {
          chartInstance.options.layout.padding.right = window.matchMedia(
            "(max-width: 575.98px)",
          ).matches
            ? 42
            : 49;
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            intersect: false,
            mode: "index",
            axis: "x",
            filter(context) {
              return context.datasetIndex === 0;
            },
            callbacks: {
              title(items) {
                const time = items[0]?.parsed.x;
                if (!Number.isFinite(time)) return "";
                const formattedTime = formatMarketTooltipTime(time);
                return chartDate
                  ? `${chartDate} • ${formattedTime}`
                  : formattedTime;
              },
              label(context) {
                return `${context.dataset.label}: ${formatNumber(context.parsed.y)}`;
              },
            },
          },
        },
        scales: {
          x: {
            type: "linear",
            min: chartStartMinutes,
            max: chartEndMinutes,
            grid: { display: false },
            border: { display: false },
            ticks: {
              maxRotation: 0,
              autoSkip: false,
              stepSize: chartEndMinutes - chartStartMinutes,
              callback(value) {
                if (Number(value) === chartStartMinutes) {
                  return formatMarketMinute(chartStartMinutes);
                }
                if (Number(value) === chartEndMinutes) {
                  return formatMarketSessionTick(chartEndLabel);
                }
                return "";
              },
              font: { size: 10 },
              color: "#717782",
            },
          },
          y: {
            display: false,
            min: chartMinValue - chartPadding,
            max: chartMaxValue + chartPadding,
          },
        },
      },
    });
    return () => chart.destroy();
  }, [chartPoints, levels, selectedIndex]);

  const resistanceLevels = (levels?.resistance ?? [])
    .filter(Number.isFinite)
    .sort((left, right) => left - right);
  const supportLevels = (levels?.support ?? [])
    .filter(Number.isFinite)
    .sort((left, right) => right - left);
  const levelSlots = [
    { label: "Ceiling 2", type: "resistance", value: resistanceLevels[1] },
    { label: "Ceiling 1", type: "resistance", value: resistanceLevels[0] },
    { label: "Floor 1", type: "support", value: supportLevels[0] },
    { label: "Floor 2", type: "support", value: supportLevels[1] },
  ];

  return (
    <section
      className="card border rounded-4"
      aria-labelledby="index-levels-title"
    >
      <div className="card-body p-3">
        <div className="d-flex flex-column flex-lg-row justify-content-lg-between mb-3 mb-lg-2">
          <h2
            className="fs-6 fw-bold text-body-emphasis mb-lg-0 mb-3"
            id="index-levels-title"
          >
            Market Prediction
          </h2>
          <div className="d-flex gap-2" role="group" aria-label="Select index">
            {MARKET_CHART_INDICES.map((index) => (
              <button
                key={index.label}
                type="button"
                className={`btn btn-sm rounded-3 ${selectedIndex.label === index.label ? "bg-black text-white" : "btn-white border"}`}
                aria-pressed={selectedIndex.label === index.label}
                onClick={() => {
                  setSelectedIndex(index);
                  setDetailsOpen(false);
                }}
              >
                <small>{index.label.toUpperCase()}</small>
              </button>
            ))}
          </div>
        </div>
        <div className="d-flex align-items-baseline gap-2 mb-2">
          <strong className="fs-6 text-body-emphasis">
            {formatNumber(currentValue)}
          </strong>
          <span className={`small fw-semibold ${changeColor(percentChange)}`}>
            {/* {formatChange(indexRecord?.PriceDiff)} (
            {formatChange(percentChange)}%){" "} */}
            {formatChange(percentChange)}% (
            {formatChange(indexRecord?.PriceDiff)} pts){" "}
            <i
              className={`bi ${Number(percentChange) >= 0 ? "bi-arrow-up-right" : "bi-arrow-down-right"}`}
              aria-hidden="true"
            />
          </span>
        </div>
        {isMarketLive && (
          <div className="ratio ratio-16x9">
            {chartError ? (
              <div
                className="small text-danger d-flex align-items-center justify-content-center"
                role="alert"
              >
                {chartError}
              </div>
            ) : chartPoints.length ? (
              <canvas
                ref={chartCanvasRef}
                aria-label={`${selectedIndex.label} intraday price chart`}
                role="img"
              />
            ) : null}
          </div>
        )}
        <div className="small fw-semibold my-2">Important Levels</div>
        {levelsError && (
          <p className="small text-danger mb-2" role="alert">
            {levelsError}
          </p>
        )}
        <div className="row g-1 g-lg-2">
          {levelSlots.map((level) => (
            <div className="col-3 col-lg-3" key={level.label}>
              <div className="bg-light rounded-3 p-2 small">
                <div className="text-body-secondary">{level.label}</div>
                <span
                  className={`fw-semibold ${level.type === "resistance" ? "text-danger" : "text-success"}`}
                >
                  {Number.isFinite(level.value)
                    ? roundedNumberFormat.format(Math.round(level.value))
                    : "—"}
                </span>
              </div>
            </div>
          ))}
        </div>
        {isMarketLive && (
          <div className="text-center mt-2">
            <button
              type="button"
              className="btn btn-link btn-sm text-decoration-none p-0"
              style={{ color: "#ff7900" }}
              aria-expanded={detailsOpen}
              aria-controls="market-prediction-details"
              onClick={() => setDetailsOpen((open) => !open)}
            >
              {detailsOpen ? "Hide full details" : "View full details"}
              <i
                className={`bi ${detailsOpen ? "bi-chevron-up" : "bi-chevron-down"} ms-1`}
                aria-hidden="true"
              />
            </button>
          </div>
        )}
        <div
          id="market-prediction-details"
          className={`collapse ${!isMarketLive || detailsOpen ? "show" : ""}`}
        >
          <div className="border-top mt-2 pt-3">
            <h3 className="small fw-bold">{selectedIndex.label} analysis</h3>
            <p className="small text-body-secondary">
              {levels?.analysis || "Analysis is not available."}
            </p>
            <div className="d-flex flex-column gap-2">
              {["support", "resistance"].map((type) => (
                <div
                  className="d-flex align-items-baseline gap-2 text-nowrap"
                  key={type}
                >
                  <h4 className="small fw-bold text-capitalize mb-0">{type}</h4>
                  <p className="small mb-0 text-nowrap">
                    {levels?.[type]?.length
                      ? levels[type].map(formatNumber).join(" - ")
                      : "Not available"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MarketActivityCards({
  marketData,
  marketError,
  activityData,
  activityError,
  indices,
}) {
  return (
    <section className="row g-3" aria-label="Market live updates">
      <div className="col-12 col-lg-6 d-flex flex-column gap-3">
        <article className="card border rounded-4">
          <div className="card-body p-3">
            <MarketLiveSection data={marketData} error={marketError} />
          </div>
        </article>
        <article className="card border rounded-4">
          <div className="card-body p-3">
            <FiiDiiActivitySection data={activityData} error={activityError} />
          </div>
        </article>
      </div>
      <div className="col-12 col-lg-6">
        <IndexLevelsSection
          indices={indices}
          isMarketLive={marketData?.isMarketOpen === true}
        />
      </div>
    </section>
  );
}

function getPerformanceSessions(response) {
  const payload = response?.data ?? response;
  if (payload?.status === false || payload?.success === false) {
    throw new Error(payload.message || "Unable to load performance.");
  }
  const data = payload?.data ?? payload;
  if (Array.isArray(data)) return data;
  const sessions =
    data?.sessions ??
    data?.tradingSessions ??
    data?.performanceHistory ??
    (Array.isArray(data?.performance) ? data.performance : null);
  return Array.isArray(sessions) ? sessions : data ? [data] : [];
}

function findPerformanceValue(record, keys) {
  if (!record || typeof record !== "object") return null;
  const normalizedKeys = keys.map((key) => key.toLowerCase());
  const entry = Object.entries(record).find(([key]) =>
    normalizedKeys.includes(key.toLowerCase().replace(/[^a-z0-9]/g, "")),
  );
  return entry?.[1] ?? null;
}

function getFirstPerformanceTotalPnl(response) {
  const payload = response?.data?.data ?? response?.data ?? response;
  if (payload?.status === false || payload?.success === false) {
    throw new Error(payload.message || "Unable to load performance.");
  }
  const data = payload?.data ?? payload;
  const firstIndex = Array.isArray(data)
    ? data[0]
    : Array.isArray(data?.performance)
      ? data.performance[0]
      : Array.isArray(data?.indices)
        ? data.indices[0]
        : Array.isArray(data?.index)
          ? data.index[0]
          : null;
  return findPerformanceValue(firstIndex, ["totalPnl"]);
}

function formatProfitAmount(amount) {
  const numericAmount = Number(amount);
  return Number.isFinite(numericAmount)
    ? new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(
        numericAmount,
      )
    : String(amount);
}

function LastSessionProfitText({ show, totalPnl, className = "" }) {
  if (!show || totalPnl == null || totalPnl === "") return null;
  return (
    <p className={`w-100 text-success text-center small my-2 ${className}`}>
      <small>
        Last trading session members booked ₹{formatProfitAmount(totalPnl)}{" "}
        Profit
      </small>
    </p>
  );
}

function findPerformanceGroup(session, keys) {
  const normalizedKeys = keys.map((key) => key.toLowerCase());
  const entry = Object.entries(session ?? {}).find(([key, value]) => {
    const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, "");
    return (
      value &&
      typeof value === "object" &&
      normalizedKeys.some(
        (candidate) =>
          normalized === candidate ||
          (candidate.length > 5 && normalized.includes(candidate)),
      )
    );
  });
  return entry?.[1] ?? null;
}

function PerformanceModal({
  sessions,
  index,
  onChange,
  onClose,
  onSubscribe,
  loading,
  error,
  showLastSessionProfit,
  lastSessionTotalPnl,
}) {
  const session = sessions[index];
  const groups = [
    {
      title: "Live Options Trades",
      aliases: [
        "livecalls",
        "liveoptions",
        "liveoption",
        "optionrecommendations",
        "options",
      ],
      tone: "warning",
      metrics: [],
    },
    {
      title: "Cash Intraday Trades",
      aliases: ["cashintraday", "cashtrades", "cash"],
      tone: "primary",
      metrics: INTRADAY_PERFORMANCE_METRICS,
    },
    {
      title: "Stock Futures Intraday Trades",
      aliases: [
        "futureintraday",
        "stockfutures",
        "stockfuture",
        "stockfutureintraday",
        "futures",
      ],
      tone: "success",
      metrics: INTRADAY_PERFORMANCE_METRICS,
    },
  ];
  const cards = groups.flatMap((group) => {
    const values = findPerformanceGroup(session, group.aliases);
    if (!values) return [];
    const profit =
      typeof values === "number" || typeof values === "string"
        ? values
        : findPerformanceValue(values, [
            "totalProfit",
            "profit",
            "totalPnl",
            "pnl",
          ]);
    return [
      {
        ...group,
        profit,
        stats: group.metrics
          .map(([label, keys]) => [label, findPerformanceValue(values, keys)])
          .filter(([, value]) => value != null),
      },
    ];
  });
  const date = session?.date ?? session?.sessionDate ?? session?.tradingDate;

  return (
    <>
      <div
        className="modal-backdrop show"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        className="modal show d-block"
        role="dialog"
        aria-modal="true"
        aria-labelledby="performance-title"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4 border-0 p-3">
            <div className="modal-header d-block p-0 pb-3 border-0">
              <div className="d-flex align-items-center justify-content-center position-relative">
                <h2
                  className="fs-6 fw-bold mb-1 text-center"
                  id="performance-title"
                >
                  Recent Trading Session Performance
                </h2>
                <button
                  type="button"
                  className="btn-close position-absolute end-0"
                  aria-label="Close performance"
                  onClick={onClose}
                />
              </div>
              <div className="d-flex align-items-center justify-content-between mt-2">
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none"
                  style={{ color: "#7040E8" }}
                  aria-label="Previous trading session"
                  disabled={index >= sessions.length - 1}
                  onClick={() => onChange(index + 1)}
                >
                  <i className="bi bi-chevron-left fs-5" />
                </button>
                {date && (
                  <small className="text-secondary">
                    {formatActivityDate(date)}
                  </small>
                )}
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none text-secondary"
                  aria-label="Next trading session"
                  disabled={index <= 0}
                  onClick={() => onChange(index - 1)}
                >
                  <i className="bi bi-chevron-right fs-5" />
                </button>
              </div>
            </div>
            <div className="modal-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <span className="spinner-border text-primary" role="status" />
                </div>
              ) : error ? (
                <p className="text-danger mb-0" role="alert">
                  {error}
                </p>
              ) : cards.length ? (
                <div className="d-flex flex-column gap-2">
                  {cards.map((card) => (
                    <section
                      className={`rounded-4 p-2 bg-${card.tone} bg-opacity-10`}
                      key={card.title}
                    >
                      <div className="d-flex justify-content-between align-items-center gap-2">
                        <div>
                          <h3 className="small fw-bold mb-0">{card.title}</h3>
                          <small className="text-secondary">Total Profit</small>
                        </div>
                        {card.profit != null && (
                          <strong className="fs-5 text-success text-nowrap">
                            ₹ {card.profit}
                          </strong>
                        )}
                      </div>
                      {card.stats.length > 0 && (
                        <div className="row row-cols-5 text-center border-top mt-2 pt-2 g-1">
                          {card.stats.map(([label, value]) => (
                            <div className="col" key={label}>
                              <div className="small fw-semibold">{value}</div>
                              <small className="text-secondary lh-sm">
                                {label}
                              </small>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                  ))}
                </div>
              ) : (
                <p className="text-secondary mb-0">
                  No performance data available.
                </p>
              )}
            </div>
            <div className="modal-footer p-0 pt-3">
              <LastSessionProfitText
                show={showLastSessionProfit}
                totalPnl={lastSessionTotalPnl}
              />
              <button
                type="button"
                className="btn fw-semibold text-white w-100"
                style={{ backgroundColor: "#964BFF" }}
                onClick={onSubscribe}
              >
                Subscribe Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function TradingDeskPanel({
  isSubscribed,
  onSubscribe,
  onNotificationSettingsChange,
  onTradeSelect,
  showLastSessionProfit,
  lastSessionTotalPnl,
}) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [performanceOpen, setPerformanceOpen] = useState(false);
  const [performanceSessions, setPerformanceSessions] = useState([]);
  const [performanceIndex, setPerformanceIndex] = useState(0);
  const [performanceLoading, setPerformanceLoading] = useState(false);
  const [performanceError, setPerformanceError] = useState("");

  const openPerformance = async () => {
    setPerformanceOpen(true);
    setPerformanceLoading(true);
    setPerformanceError("");
    try {
      const getSessionDate = (session) =>
        session?.date ?? session?.sessionDate ?? session?.tradingDate ?? "";
      const sessions = getPerformanceSessions(
        await api.uapi.getUserDashboard(),
      ).sort(
        (a, b) => new Date(getSessionDate(b)) - new Date(getSessionDate(a)),
      );
      setPerformanceSessions(sessions);
      setPerformanceIndex(0);
    } catch (error) {
      setPerformanceError(error.message || "Unable to load performance.");
    } finally {
      setPerformanceLoading(false);
    }
  };

  return (
    <>
      <section
        className="card border border-light border-opacity-10 rounded-4 text-light overflow-hidden"
        style={{
          background:
            "linear-gradient(90deg, #44224F 0%, #1E1627 55%, #15101C 100%)",
        }}
        aria-labelledby="trading-desk-title"
      >
        <div className="card-body p-3">
          <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
            <div className="d-flex align-items-center gap-2">
              <span
                className="d-inline-flex align-items-center justify-content-center flex-shrink-0 rounded-circle"
                style={{
                  width: "30px",
                  height: "30px",
                  backgroundColor: "#964BFF",
                }}
              >
                <i className="bi bi-award" aria-hidden="true" />
              </span>
              <h2 className="fs-5 fw-semibold mb-0" id="trading-desk-title">
                Intraday Trades
              </h2>
            </div>
            {isSubscribed ? (
              <button
                type="button"
                className="btn btn-sm text-light border-0 text-nowrap rounded-2"
                style={{ backgroundColor: "#D48A001A" }}
                onClick={() => setNotificationsOpen(true)}
              >
                <i className="bi bi-bell me-2" aria-hidden="true" />
                Notifications
              </button>
            ) : (
              <small>
                <button
                  type="button"
                  className="btn btn-sm btn-link text-light text-decoration-none fw-semibold text-nowrap p-0"
                  onClick={openPerformance}
                >
                  <i className="bi bi-graph-up-arrow me-2" aria-hidden="true" />
                  Performance
                </button>
              </small>
            )}
          </div>
          <div className="row g-lg-3 g-0">
            <div className="col-12 col-md-12 col-lg-5 d-flex flex-column justify-content-center order-2 order-lg-1">
              <p className="small text-white-50 mb-2 d-none d-lg-block">
                Actionable Intraday Recommendations for Options, Cash &amp;
                Stock Futures
              </p>
              <ul className="list-unstyled small text-white-50 mb-2 d-none d-lg-block">
                <li className="small mb-2">
                  <i className="bi bi-check-lg me-2" aria-hidden="true" />
                  Entry, Stop Loss &amp; targets with levels
                </li>
                <li className="small mb-2">
                  <i className="bi bi-check-lg me-2" aria-hidden="true" />
                  Real time alerts &amp; updates
                </li>
                <li className="small">
                  <i className="bi bi-check-lg me-2" aria-hidden="true" />
                  Recommendation by SEBI Registered Research Analyst
                </li>
              </ul>
              {!isSubscribed && (
                <>
                  <LastSessionProfitText
                    show={showLastSessionProfit}
                    totalPnl={lastSessionTotalPnl}
                  />
                  <button
                    type="button"
                    className={`btn w-100 d-inline-flex align-items-center justify-content-center text-nowrap fw-semibold text-white px-3 ${showLastSessionProfit && lastSessionTotalPnl != null ? "mt-0" : "mt-3"}`}
                    style={{ backgroundColor: "#964BFF" }}
                    onClick={onSubscribe}
                  >
                    Subscribe Now
                  </button>
                </>
              )}
            </div>
            <div className="col-12 col-md-12 col-lg-7 position-relative order-1 order-lg-2">
              <div
                className="position-absolute top-0 bottom-0 start-0 d-none d-lg-block border-start border-light border-opacity-10"
                aria-hidden="true"
              />
              {INTRADAY_TRADES.map((trade, index) => (
                <a
                  className={`d-flex flex-nowrap align-items-center gap-2 p-2 rounded-3 border border-light border-opacity-10 text-light text-decoration-none ${index === INTRADAY_TRADES.length - 1 ? "mb-0" : "mb-2"}`}
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.06)" }}
                  href={trade.href}
                  key={trade.href}
                  onClick={(event) => {
                    event.preventDefault();
                    onTradeSelect(trade.href.slice(1));
                  }}
                >
                  <span
                    className={`d-inline-flex align-items-center justify-content-center flex-shrink-0 rounded-3 p-2 bg-${trade.tone} bg-opacity-10 text-${trade.tone}`}
                    aria-hidden="true"
                  >
                    <i className={`bi ${trade.icon}`} />
                  </span>
                  <span className="d-flex flex-column flex-grow-1">
                    <span className="d-flex align-items-center justify-content-between gap-2 fw-semibold">
                      {trade.title}
                    </span>
                    <span className="small text-white-50">
                      <small>{trade.description}</small>
                    </span>
                  </span>
                  <span
                    className="d-inline-flex align-items-center flex-shrink-0 small text-nowrap ms-auto"
                    style={{ color: "#F6A044" }}
                  >
                    <i className="bi bi-chevron-right" aria-hidden="true" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
      {performanceOpen && (
        <PerformanceModal
          sessions={performanceSessions}
          index={performanceIndex}
          onChange={setPerformanceIndex}
          onClose={() => setPerformanceOpen(false)}
          onSubscribe={onSubscribe}
          loading={performanceLoading}
          error={performanceError}
          showLastSessionProfit={showLastSessionProfit}
          lastSessionTotalPnl={lastSessionTotalPnl}
        />
      )}
      {notificationsOpen && isSubscribed && (
        <NotificationSettingsModal
          onClose={() => setNotificationsOpen(false)}
          onSettingsChange={onNotificationSettingsChange}
        />
      )}
    </>
  );
}

function MarketIndexCard({ label, record, error, giftNifty = false }) {
  const price = giftNifty ? record?.Price : record?.Last;
  const priceDiff = record?.PriceDiff;
  const percentChange = giftNifty ? record?.PerChange : record?.Change;
  const amountLabel = formatChange(priceDiff);
  const percentLabel = `${formatChange(percentChange)}%`;
  const changeWidth = Math.max(amountLabel.length, percentLabel.length) + 1;
  return (
    <article
      className={`flex-fill px-2 py-1 rounded-3 ${Number(priceDiff) > 0 ? "dashboard-index-card-positive" : Number(priceDiff) < 0 ? "dashboard-index-card-negative" : "dashboard-index-card-neutral"}`}
    >
      <h2 className="small fw-semibold text-body-secondary text-uppercase mb-2">
        <small>{label}</small>
      </h2>
      {error ? (
        <div className="small text-danger" role="status">
          Unavailable
        </div>
      ) : record ? (
        <div className="d-flex align-items-baseline justify-content-between gap-1">
          <span className="small fw-semibold text-body-emphasis text-nowrap">
            {formatNumber(price)}
          </span>
          <div
            className="dashboard-index-change position-relative text-end overflow-hidden flex-shrink-0 small"
            style={{ minWidth: `${changeWidth}ch` }}
            aria-label={`${formatChange(priceDiff)} points, ${formatChange(percentChange)} percent`}
          >
            <span className="invisible d-block">{amountLabel}</span>
            <div className="dashboard-index-change-rotator position-absolute top-0 start-0 w-100 d-flex flex-column">
              <small
                className={`text-nowrap ${Number(priceDiff) >= 0 ? "text-success" : "text-danger"}`}
              >
                {amountLabel}
              </small>
              <small
                className={`text-nowrap ${Number(percentChange) >= 0 ? "text-success" : "text-danger"}`}
              >
                {percentLabel}
              </small>
              <small
                className={`text-nowrap ${Number(priceDiff) >= 0 ? "text-success" : "text-danger"}`}
              >
                {amountLabel}
              </small>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function SuggestFeatureModal({ onClose, notify }) {
  const [featureDescription, setFeatureDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    const description = featureDescription.trim();
    if (!description || submitting) return;
    setSubmitting(true);
    try {
      const response = await api.uapi.createSupportRequest({
        type: "suggest_feature",
        title: "Suggest Feature",
        description,
      });
      if (response?.status === false || response?.success === false) {
        throw new Error(response.message || "Unable to submit your request.");
      }
      onClose();
      notify("success", "Your feature request has been submitted.");
    } catch (requestError) {
      notify("error", requestError.message || "Unable to submit your request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div
        className="modal-backdrop show"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        className="modal show d-block"
        role="dialog"
        aria-modal="true"
        aria-labelledby="suggest-feature-title"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget && !submitting) onClose();
        }}
      >
        <div className="modal-dialog modal-dialog-centered modal-md mx-3 mx-sm-auto">
          <div className="modal-content rounded-4 border-0 p-3">
            <form onSubmit={submit}>
              <div className="d-flex align-items-center gap-3 mb-3">
                <span
                  className="d-inline-flex align-items-center justify-content-center rounded-4 p-3 fs-4"
                  style={{ background: "#fff0e4", color: "#ff7900" }}
                  aria-hidden="true"
                >
                  <i className="bi bi-lightbulb" />
                </span>
                <div className="flex-grow-1">
                  <h2 className="fs-5 fw-bold mb-1" id="suggest-feature-title">
                    We Will Make it for you!
                  </h2>
                  <p className="text-secondary mb-0">
                    Share the feature you would like to see next.
                  </p>
                </div>
                <button
                  className="btn btn-link text-secondary fs-3 p-0"
                  type="button"
                  aria-label="Close feature request"
                  onClick={onClose}
                  disabled={submitting}
                >
                  <i className="bi bi-x-lg" aria-hidden="true" />
                </button>
              </div>
              <fieldset className="border border-2 rounded-4 px-3 pb-2">
                <legend className="float-none w-auto px-2 mb-0 small text-secondary">
                  Feature Description
                </legend>
                <textarea
                  className="form-control border-0 shadow-none p-1"
                  id="feature-description"
                  rows="5"
                  maxLength={1000}
                  placeholder="Describe how this feature should work"
                  value={featureDescription}
                  onChange={(event) =>
                    setFeatureDescription(event.target.value)
                  }
                  disabled={submitting}
                  required
                />
              </fieldset>
              <div className="text-end text-secondary small mt-1 mb-3">
                {featureDescription.length}/1000
              </div>
              <div className="row g-2">
                <div className="col-6">
                  <button
                    className="btn btn-outline-secondary rounded-3 w-100 py-2"
                    type="button"
                    onClick={onClose}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                </div>
                <div className="col-6">
                  <button
                    className="btn btn-warning rounded-3 w-100 py-2 fw-semibold"
                    type="submit"
                    disabled={!featureDescription.trim() || submitting}
                  >
                    {submitting ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Dashboard({
  isSubscribed,
  onSubscribe,
  onTradeSelect,
  subscriptionStatus,
  onboardingStatuses = {},
  onKyc,
  onAgreement,
  notify,
}) {
  const eapiAuth = useSelector(selectEapiAuth);
  const uapiAuth = useSelector(selectUapiAuth);
  const name = getUserName(eapiAuth?.user) || getUserName(uapiAuth?.user);
  const normalizedSubscriptionStatus = String(subscriptionStatus ?? "")
    .trim()
    .toLowerCase();
  const isSubscriptionExpired = normalizedSubscriptionStatus === "expired";
  const isSubscriptionExpiringSoon =
    normalizedSubscriptionStatus === "expiring_soon";
  const isEligibleForLastSessionProfit =
    normalizedSubscriptionStatus === "registered";
  const [notificationSettingsOpen, setNotificationSettingsOpen] =
    useState(false);
  const [suggestFeatureOpen, setSuggestFeatureOpen] = useState(false);
  const [notificationReminder, setNotificationReminder] = useState(false);
  const [showPositionVote, setShowPositionVote] = useState(false);
  const [showProfitView, setShowProfitView] = useState(false);
  const handleNotificationSettingsChange = (settings) => {
    const allEnabled = [
      "liveCallEnabled",
      "intradaySignalEnabled",
      "futureSignalEnabled",
    ].every((key) => settings?.[key] === true);
    setNotificationReminder(!allEnabled);
  };
  useEffect(() => {
    let active = true;
    if (!isSubscribed) {
      setNotificationReminder(false);
      return () => {
        active = false;
      };
    }
    const checkNotificationSettings = async (registerToken = false) => {
      try {
        const fcmToken = registerToken
          ? await registerNotificationToken()
          : await getNotificationFcmToken();
        if (!fcmToken) {
          if (active) setNotificationReminder(true);
          return;
        }
        const response = await api.uapi.getNotificationSettings(fcmToken);
        const data = response?.data?.data ?? response?.data ?? response;
        if (data?.status === false || data?.success === false) {
          throw new Error(
            data.message || "Unable to check notification settings",
          );
        }
        const settings = data?.settings ?? data;
        const allEnabled = [
          "liveCallEnabled",
          "intradaySignalEnabled",
          "futureSignalEnabled",
        ].every((key) => settings?.[key] === true);
        if (active) setNotificationReminder(!allEnabled);
      } catch {
        if (active) setNotificationReminder(false);
      }
    };
    checkNotificationSettings();
    let permissionGranted = window.Notification?.permission === "granted";
    const checkPermissionAndRefresh = () => {
      const granted = window.Notification?.permission === "granted";
      if (granted && !permissionGranted) {
        setNotificationReminder(false);
        checkNotificationSettings(true);
      }
      permissionGranted = granted;
    };
    window.addEventListener("focus", checkPermissionAndRefresh);
    return () => {
      active = false;
      window.removeEventListener("focus", checkPermissionAndRefresh);
    };
  }, [isSubscribed]);

  const alerts = [];
  const isExpired = isSubscriptionExpired;
  if (isSubscriptionExpired || isSubscriptionExpiringSoon) {
    alerts.push({
      id: "expiry",
      title: isExpired ? "Expired" : "Expiring Soon",
      text: isExpired
        ? "Your service has expired."
        : "Your service is expiring soon within 10 days!",
      icon: isExpired ? "bi-exclamation-circle" : "bi-clock-history",
      tone: isExpired ? "danger" : "warning",
      onClick: onSubscribe,
    });
  }
  if (isSubscribed && notificationReminder) {
    alerts.push({
      id: "notifications",
      title: "Enable Notifications",
      text: "Enable notifications to receive trade call alerts.",
      icon: "bi-bell",
      tone: "success",
      onClick: () => setNotificationSettingsOpen(true),
    });
  }
  if (
    isSubscribed &&
    onboardingStatuses.paymentComplete &&
    !onboardingStatuses.kycComplete
  ) {
    alerts.push({
      id: "kyc",
      title: "KYC Pending",
      text: "Complete your KYC verification.",
      icon: "bi-shield",
      tone: "warning",
      onClick: onKyc,
    });
  }
  if (
    isSubscribed &&
    onboardingStatuses.paymentComplete &&
    onboardingStatuses.kycComplete &&
    !onboardingStatuses.agreementComplete
  ) {
    alerts.push({
      id: "agreement",
      title: "Agreement Pending",
      text: "Your agreement requires your attention.",
      icon: "bi-file-earmark-text",
      tone: "info",
      onClick: onAgreement,
    });
  }
  const [indices, setIndices] = useState([]);
  const [giftNifty, setGiftNifty] = useState(null);
  const [marketLive, setMarketLive] = useState(null);
  const [fiiDiiActivity, setFiiDiiActivity] = useState(null);
  const [marketPulse, setMarketPulse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [indicesError, setIndicesError] = useState("");
  const [giftError, setGiftError] = useState("");
  const [marketLiveError, setMarketLiveError] = useState("");
  const [fiiDiiError, setFiiDiiError] = useState("");
  const [marketPulseError, setMarketPulseError] = useState("");
  const [lastSessionTotalPnl, setLastSessionTotalPnl] = useState(null);

  useEffect(() => {
    let active = true;
    const finishLoading = () => {
      if (active) setLoading(false);
    };

    const requests = [
      api.uapi
        .getConfig()
        .then((response) => {
          if (!active) return;
          const config = response?.data?.data ?? response?.data ?? response;
          setShowPositionVote(config?.voting_view_show_flag === true);
          setShowProfitView(config?.profit_view_show_flag === true);
        })
        .catch((error) => {
          if (active) console.error("Unable to load dashboard config.", error);
        }),
      api.cmots
        .getIndices()
        .then((response) => {
          if (active) setIndices(getIndexRecords(response));
        })
        .catch((error) => {
          if (active)
            setIndicesError(error.message || "Unable to load market indices.");
        }),

      api.cmots
        .getGiftNifty()
        .then((response) => {
          if (active) setGiftNifty(getGiftNiftyRecord(response));
        })
        .catch((error) => {
          if (active)
            setGiftError(error.message || "Unable to load GIFT Nifty.");
        }),

      api.uapiServe
        .getMarketLive()
        .then((response) => {
          if (active)
            setMarketLive(
              getUapiData(response, "Unable to load market update."),
            );
        })
        .catch((error) => {
          if (active)
            setMarketLiveError(
              error.message || "Unable to load market update.",
            );
        }),

      api.uapiServe
        .getFiiDiiActivity()
        .then((response) => {
          if (active)
            setFiiDiiActivity(
              getUapiData(response, "Unable to load FII/DII activity."),
            );
        })
        .catch((error) => {
          if (active)
            setFiiDiiError(error.message || "Unable to load FII/DII activity.");
        }),

      api.uapi
        .getMarketPulse()
        .then((response) => {
          if (active) setMarketPulse(getMarketPulsePayload(response));
        })
        .catch((error) => {
          if (active)
            setMarketPulseError(
              error.message || "Unable to load market pulse.",
            );
        }),

      api.uapi
        .getUserDashboard()
        .then((response) => {
          if (active) {
            setLastSessionTotalPnl(getFirstPerformanceTotalPnl(response));
          }
        })
        .catch(() => {
          if (active) setLastSessionTotalPnl(null);
        }),
    ];

    Promise.all(requests).finally(finishLoading);

    return () => {
      active = false;
    };
  }, []);

  const showLastSessionProfit =
    showProfitView && isEligibleForLastSessionProfit;

  if (loading) {
    return (
      <main
        className="container flex-grow-1 d-flex align-items-center justify-content-center py-5"
        id="main-content"
      >
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading dashboard</span>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-light flex-grow-1" id="main-content">
      {/* {normalizedSubscriptionStatus === "registered" && (
        <DiwaliBanner
          inline
          onOpenAccount={onSubscribe}
        />
      )} */}
      <div className="container-fluid py-3">
        <header className="mb-3 row g-3 align-items-center">
          <div className="col-12 col-lg-6">
            <h1 className="fs-3 fw-bold mb-1 text-body-emphasis">
              <span className="dashboard-greeting">Welcome</span>
              {name ? `, ${name.charAt(0).toUpperCase()}${name.slice(1)}` : ""}
            </h1>
            <p className="small text-body-secondary mb-0">
              Here's your intraday market briefing and today's trading activity.
            </p>
          </div>
          {alerts.length > 0 && (
            <div
              className="col-12 col-lg-6 d-flex flex-column gap-2"
              aria-label="Account alerts"
            >
              {alerts.map((alert) => {
                const tones = {
                  warning: {
                    background: "#fff8ed",
                    border: "#ffd7a8",
                    color: "#a83e13",
                    iconBackground: "#fff0df",
                    iconColor: "#ff6b00",
                  },
                  danger: {
                    background: "#fff1f1",
                    border: "#ffcaca",
                    color: "#a81f24",
                    iconBackground: "#ffe8e8",
                    iconColor: "#f04444",
                  },
                  success: {
                    background: "#eafbf4",
                    border: "#a7efcf",
                    color: "#006b50",
                    iconBackground: "#d2f8e8",
                    iconColor: "#008568",
                  },
                  info: {
                    background: "#eef5ff",
                    border: "#b7d2ff",
                    color: "#214695",
                    iconBackground: "#dceaff",
                    iconColor: "#2864e8",
                  },
                };
                const style = tones[alert.tone];
                return (
                  <button
                    key={alert.id}
                    type="button"
                    onClick={alert.onClick}
                    className="d-flex align-items-center gap-2 text-start rounded-3 px-2 py-1"
                    style={{
                      minHeight: 32,
                      background: style.background,
                      border: `1px solid ${style.border}`,
                      color: style.color,
                    }}
                  >
                    <span
                      className="d-flex align-items-center justify-content-center rounded-2 flex-shrink-0"
                      style={{
                        width: 24,
                        height: 24,
                        background: style.iconBackground,
                        color: style.iconColor,
                      }}
                    >
                      <i
                        className={`bi ${alert.icon} small`}
                        aria-hidden="true"
                      />
                    </span>
                    <span className="flex-grow-1 small text-truncate">
                      <strong>{alert.title}</strong> - {alert.text}
                    </span>
                    <i
                      className="bi bi-chevron-right small flex-shrink-0"
                      style={{ color: style.iconColor }}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </header>
        <section
          className="row g-3 align-items-start"
          aria-label="Dashboard overview"
        >
          <div className="col-12 col-lg-9 d-flex flex-column gap-3">
            <section aria-label="Market indices">
              <div className="dashboard-indices-scroll d-flex flex-nowrap overflow-x-auto gap-2">
                <MarketIndexCard
                  label="Gift Nifty"
                  record={giftNifty}
                  error={giftError}
                  giftNifty
                />
                {INDEX_CARDS.map(({ label, aliases }) => (
                  <MarketIndexCard
                    label={label}
                    record={findIndexRecord(indices, aliases)}
                    error={indicesError}
                    key={label}
                  />
                ))}
              </div>
            </section>
            <TradingDeskPanel
              isSubscribed={isSubscribed}
              onSubscribe={onSubscribe}
              onNotificationSettingsChange={handleNotificationSettingsChange}
              onTradeSelect={onTradeSelect}
              showLastSessionProfit={showLastSessionProfit}
              lastSessionTotalPnl={lastSessionTotalPnl}
            />
            <MarketActivityCards
              marketData={marketLive}
              marketError={marketLiveError}
              activityData={fiiDiiActivity}
              activityError={fiiDiiError}
              indices={indices}
            />
            {showPositionVote && <PositionVotePanel />}
          </div>
          <div className="col-12 col-lg-3 d-flex flex-column gap-3">
            <MarketPulseCard data={marketPulse} error={marketPulseError} />
            <article className="rounded-4 overflow-hidden">
              <div className="position-relative rounded-3 overflow-hidden p-3">
                <img
                  src={suggestFeatureImage}
                  alt=""
                  aria-hidden="true"
                  className="position-absolute top-0 start-0"
                  style={{
                    objectFit: "fill",
                    zIndex: 0,
                    minWidth: "100%",
                    minHeight: "100%",
                  }}
                />
                <div
                  className="position-relative row g-0 align-items-center"
                  style={{ zIndex: 1 }}
                >
                  <div className="col-12">
                    <h2 className="small fw-bold mb-2 text-body-emphasis">
                      Suggest A Feature
                    </h2>
                    <p className="small text-body-secondary mb-2">
                      <small>
                        We're constantly looking for ways to improve. Your
                        suggestion matters to us.
                      </small>
                    </p>
                    <button
                      className="btn btn-sm text-white fw-semibold rounded-3 px-3 py-1"
                      style={{ backgroundColor: "#EE8139" }}
                      type="button"
                      onClick={() => setSuggestFeatureOpen(true)}
                    >
                      Request a Feature{" "}
                      <i
                        className="bi bi-chevron-right ms-1"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>
        {notificationSettingsOpen && (
          <NotificationSettingsModal
            onClose={() => setNotificationSettingsOpen(false)}
            onSettingsChange={handleNotificationSettingsChange}
          />
        )}
        {suggestFeatureOpen && (
          <SuggestFeatureModal
            onClose={() => setSuggestFeatureOpen(false)}
            notify={notify}
          />
        )}
      </div>
    </main>
  );
}
