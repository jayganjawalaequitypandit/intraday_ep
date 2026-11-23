import { useEffect, useMemo, useRef, useState } from "react";
import {
  Chart,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import api from "../services/api.js";

Chart.register(LinearScale, LineController, LineElement, PointElement, Tooltip);

const MARKET_CHART_SESSION = {
  end: "15:30",
};

function unwrapData(response) {
  let payload = response?.data ?? response;
  while (payload?.data && !Array.isArray(payload.data)) payload = payload.data;
  return payload;
}

function getChartPoints(response) {
  const payload = unwrapData(response);
  if (payload?.status === false || payload?.success === false) {
    throw new Error(payload.message || "Unable to load stock price chart.");
  }

  const findRows = (value) => {
    if (!value || typeof value !== "object") return null;
    if (Array.isArray(value)) {
      return value.some((row) => row && typeof row === "object") ? value : null;
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

  return rows.flatMap((row) => {
    const rawValue = getField(row, [
      "close",
      "closingprice",
      "closeprice",
      "ltp",
      "price",
      "last",
      "value",
    ]);
    const value =
      rawValue === null || rawValue === "" ? Number.NaN : Number(rawValue);
    const rawTime = getField(row, [
      "upddate",
      "datetime",
      "date",
      "timestamp",
      "tradedate",
      "time",
    ]);
    if (!Number.isFinite(value)) return [];
    const label = formatChartTime(rawTime);
    const time = getSessionMinutes(label);
    return time === null
      ? []
      : [{ time, date: formatChartDate(rawTime), value }];
  });
}

function formatChartDate(value) {
  const label = String(value ?? "").trim();
  const dateMatch = label.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const timestamp = /^\d{10}(?:\d{3})?$/.test(label)
    ? Number(label) * (label.length === 10 ? 1000 : 1)
    : null;
  const date = dateMatch
    ? new Date(
        Date.UTC(
          Number(dateMatch[1]),
          Number(dateMatch[2]) - 1,
          Number(dateMatch[3]),
        ),
      )
    : new Date(timestamp ?? label);
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
    const date = new Date(Number(label) * (label.length === 10 ? 1000 : 1));
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

function getSessionMinutes(label) {
  const match = String(label ?? "").match(/^(\d{1,2}):(\d{2})$/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

function formatSessionTick(label) {
  const [hour, minute] = label.split(":").map(Number);
  const displayHour = hour > 12 ? hour - 12 : hour;
  return `${hour < 10 ? "0" : ""}${displayHour}:${String(minute).padStart(2, "0")}`;
}

function formatSessionMinute(minutes) {
  const label = `${String(Math.floor(minutes / 60) % 24).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
  return formatSessionTick(label);
}

function getSignalLevels(signal) {
  const isBuy = signal?.signalType === "bullish";
  const entry = isBuy ? signal?.currentHigh : signal?.currentLow;
  const entryLabel = isBuy ? "Buy" : "Sell";
  return [
    ["SL", signal?.sl],
    [entryLabel, entry],
    ["T1", signal?.t1],
    ["T2", signal?.t2],
    ["T3", signal?.t3],
  ].flatMap(([label, rawValue], index) => {
    const value = Number(rawValue);
    return rawValue !== null && rawValue !== "" && Number.isFinite(value)
      ? [
          {
            label,
            chartLabel:
              index === 1 ? (isBuy ? "Buy Above" : "Sell Below") : label,
            value,
            color: index === 0 ? "#dc3545" : "#079b78",
            textClass: index === 0 ? "text-danger" : "text-success",
          },
        ]
      : [];
  });
}

function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    value,
  );
}

function formatTriggerTime(value) {
  if (!value) return "Pending";
  const match = String(value).match(/T(\d{2}):(\d{2})/);
  if (!match) return "Achieved";
  const hour = Number(match[1]);
  return `${hour % 12 || 12}:${match[2]} ${hour < 12 ? "AM" : "PM"}`;
}

function formatSessionTime(minutes) {
  const hour = Math.floor(minutes / 60) % 24;
  const minute = minutes % 60;
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour < 12 ? "AM" : "PM"}`;
}

export default function IntradaySignalChart({ signal }) {
  const canvasRef = useRef(null);
  const [points, setPoints] = useState([]);
  const coCode = String(signal?.coCode ?? "").trim();
  const exchange = String(
    signal?.exchange ?? signal?.exch ?? "NSE",
  ).toLowerCase();
  const levels = useMemo(() => getSignalLevels(signal), [signal]);
  const isBuy = signal?.signalType === "bullish";
  const targetHit = signal?.t3TriggerAt
    ? 3
    : signal?.t2TriggerAt
      ? 2
      : signal?.t1TriggerAt
        ? 1
        : 0;
  const isLoss =
    Boolean(signal?.slTriggerAt) ||
    Number(signal?.pl) < 0 ||
    /sl.?trigger|stop.?loss/i.test(
      `${signal?.signalStatus ?? ""} ${signal?.statusMessage ?? ""}`,
    );
  const progressLabels = ["SL", isBuy ? "Buy" : "Sell", "T1", "T2", "T3"];
  const targetTimeline = [
    { label: "T1", value: signal?.t1, triggerAt: signal?.t1TriggerAt },
    { label: "T2", value: signal?.t2, triggerAt: signal?.t2TriggerAt },
    { label: "T3", value: signal?.t3, triggerAt: signal?.t3TriggerAt },
  ];
  const hitTimeline = [
    ...(signal?.executedAt
      ? [{ label: "Trade Executed", triggerAt: signal.executedAt }]
      : []),
    ...targetTimeline
      .filter(({ triggerAt }) => Boolean(triggerAt))
      .map(({ label, triggerAt }) => ({
        label: `Target ${label.slice(1)} archived`,
        triggerAt,
      })),
    ...(signal?.slTriggerAt
      ? [
          {
            label: "Stop-Loss Triggered",
            triggerAt: signal.slTriggerAt,
            isStopLoss: true,
          },
        ]
      : []),
  ].sort((left, right) => new Date(left.triggerAt) - new Date(right.triggerAt));

  useEffect(() => {
    if (!coCode) {
      setPoints([]);
      return undefined;
    }
    const controller = new AbortController();
    let active = true;
    setPoints([]);
    api.cmots
      .getPriceChartData(
        coCode,
        ["nse", "bse"].includes(exchange) ? exchange : "nse",
        { signal: controller.signal },
      )
      .then((response) => {
        if (active) setPoints(getChartPoints(response));
      })
      .catch(() => {});
    return () => {
      active = false;
      controller.abort();
    };
  }, [coCode, exchange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !points.length) return undefined;
    const chartPoints = points
      .filter(
        ({ time, value }) => Number.isFinite(time) && Number.isFinite(value),
      )
      .sort((left, right) => left.time - right.time);
    if (!chartPoints.length) return undefined;
    const latestTime = chartPoints.at(-1).time;
    const chartDate = chartPoints.at(-1).date;
    const chartStartMinutes = chartPoints[0].time;
    const chartSessionEndMinutes = getSessionMinutes(MARKET_CHART_SESSION.end);
    const endTime = Math.max(latestTime, chartSessionEndMinutes);
    const times = [
      ...new Set([
        chartStartMinutes,
        ...chartPoints.map(({ time }) => time),
        endTime,
      ]),
    ].sort((left, right) => left - right);
    const pricesByTime = new Map(
      chartPoints.map(({ time, value }) => [time, value]),
    );
    const values = [
      ...chartPoints.map(({ value }) => value),
      ...levels.map(({ value }) => value),
    ];
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const yPadding = Math.max(Math.abs(minValue), Math.abs(maxValue)) * 0.0005;
    const datasets = [
      {
        label: signal?.symbol || signal?.coName || "Price",
        data: times.map((time) => ({
          x: time,
          y: pricesByTime.get(time) ?? null,
        })),
        clip: false,
        // borderColor: "#ff8a2b",
        borderColor: "#000000",
        backgroundColor: "rgba(255, 138, 43, 0.12)",
        borderWidth: 2,
        pointRadius: times.map((time) => (time === latestTime ? 5 : 0)),
        pointHoverRadius: 5,
        pointBackgroundColor: "#fff",
        // pointBorderColor: "#ff8a2b",
        pointBorderColor: "#000000",
        pointBorderWidth: 1.5,
        tension: 0.25,
        fill: false,
      },
      ...levels.map(({ chartLabel, value, color }) => ({
        label: chartLabel,
        data: times.map((time) => ({ x: time, y: value })),
        clip: false,
        borderColor: color,
        borderDash: [4, 4],
        borderWidth: 1,
        pointRadius: 0,
        pointHoverRadius: 0,
        pointHitRadius: 0,
        fill: false,
      })),
    ];
    const chart = new Chart(canvas, {
      type: "line",
      data: { datasets },
      plugins: [
        {
          id: "cashSignalLevelLabels",
          beforeDatasetsDraw(chartInstance) {
            const { ctx, chartArea, scales } = chartInstance;
            if (!chartArea || !levels.length) return;
            const isBuy = signal?.signalType === "bullish";
            const entryLine = levels.find(
              ({ label }) => label === (isBuy ? "Buy" : "Sell"),
            );
            if (!entryLine) return;
            const entryY = Math.max(
              chartArea.top,
              Math.min(
                chartArea.bottom,
                scales.y.getPixelForValue(entryLine.value),
              ),
            );
            ctx.save();
            ctx.filter = "none";
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 0.12;
            ctx.fillStyle = "#079b78";
            ctx.fillRect(
              chartArea.left,
              isBuy ? chartArea.top : entryY,
              chartArea.right - chartArea.left,
              isBuy ? entryY - chartArea.top : chartArea.bottom - entryY,
            );
            ctx.fillStyle = "rgba(220, 53, 69, 0.35)";
            ctx.fillRect(
              chartArea.left,
              isBuy ? entryY : chartArea.top,
              chartArea.right - chartArea.left,
              isBuy ? chartArea.bottom - entryY : entryY - chartArea.top,
            );
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
            levels.forEach(({ chartLabel, value, color }) => {
              const y = scales.y.getPixelForValue(value);
              if (y >= chartArea.top && y <= chartArea.bottom) {
                ctx.fillStyle = color;
                ctx.fillText(chartLabel, chartArea.right + 2, y);
              }
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
        maintainAspectRatio: false,
        animation: false,
        interaction: { mode: "index", intersect: false, axis: "x" },
        devicePixelRatio: Math.max(window.devicePixelRatio || 1, 2),
        onResize(chartInstance) {
          chartInstance.options.layout.padding.right = window.matchMedia(
            "(max-width: 575.98px)",
          ).matches
            ? 60
            : 70;
        },
        layout: {
          padding: {
            right: window.matchMedia("(max-width: 575.98px)").matches ? 60 : 70,
            top: 4,
            bottom: 0,
            left: 0,
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: "index",
            intersect: false,
            filter: (item) => item.datasetIndex === 0,
            callbacks: {
              title: (items) => {
                const time = items[0]?.parsed.x;
                if (!Number.isFinite(time)) return "";
                const formattedTime = formatSessionTime(time);
                return chartDate
                  ? `${chartDate} • ${formattedTime}`
                  : formattedTime;
              },
              label: (item) =>
                `${item.dataset.label}: ${formatPrice(item.parsed.y)}`,
            },
          },
        },
        scales: {
          x: {
            type: "linear",
            min: chartStartMinutes,
            max: endTime,
            grid: { display: false },
            border: { display: false },
            ticks: {
              maxRotation: 0,
              autoSkip: false,
              stepSize: endTime - chartStartMinutes,
              callback: (value) =>
                Number(value) === chartStartMinutes
                  ? formatSessionMinute(chartStartMinutes)
                  : Number(value) === endTime
                    ? formatSessionMinute(endTime)
                    : "",
              font: { size: 10 },
              color: "#717782",
            },
          },
          y: {
            display: false,
            min: minValue - yPadding,
            max: maxValue + yPadding,
          },
        },
      },
    });
    return () => chart.destroy();
  }, [points, levels, signal?.symbol, signal?.coName]);

  return (
    <section className="card border rounded-4 w-100">
      <div className="card-body p-3">
        <h2 className="fs-6 fw-bold text-body-emphasis mb-3">
          {signal?.symbol || signal?.coName || "Cash Intraday"}
        </h2>
        <div className="ratio ratio-16x9">
          {points.length ? (
            <canvas
              ref={canvasRef}
              aria-label={`${signal?.symbol || signal?.coName} price chart with trade levels`}
              role="img"
            />
          ) : null}
        </div>
        <div className="small fw-semibold my-2">Important Levels</div>
        <div
          className="position-relative mt-1 mb-2"
          aria-label="Trade level progress"
        >
          <div className="row g-0 align-items-center mb-2">
            {progressLabels.map((label, index) => {
              const complete = !isLoss && index >= 2 && index - 1 <= targetHit;
              const isEntry = index === 1;
              const connectorClass = (achieved, lossSegment = false) =>
                achieved
                  ? "border-success"
                  : isLoss && lossSegment
                    ? "border-danger"
                    : "border-secondary-subtle";
              return (
                <div
                  className={`col position-relative d-flex ${index === 0 ? "justify-content-start" : index === progressLabels.length - 1 ? "justify-content-end" : "justify-content-center"}`}
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
                      aria-label={`${label} ${complete ? "achieved" : "not achieved"}`}
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
        </div>
        <div className="row row-cols-5 g-1 g-lg-2">
          {levels.map(({ label, value, textClass }) => {
            return (
              <div className="col" key={label}>
                <div className="bg-light rounded-3 p-1 p-sm-2 small h-100">
                  <div className="text-body-secondary">{label}</div>
                  <span className={`fw-semibold text-nowrap ${textClass}`}>
                    {formatPrice(value)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        {signal?.signalStatus?.toLowerCase() !== "pending" &&
          hitTimeline.length > 0 && (
            <div className="mt-3" aria-label="Hit timeline">
              <div className="small fw-semibold mb-2">Hit timeline</div>
              <div className="position-relative d-flex flex-column gap-2">
                {hitTimeline.map(({ label, triggerAt, isStopLoss }) => (
                  <div
                    className="d-flex align-items-center gap-2"
                    key={`${label}-${triggerAt}`}
                  >
                    <i
                      className={`bi bi-check-circle-fill position-relative z-1 flex-shrink-0 fs-6 ${isStopLoss ? "text-danger" : "text-success"}`}
                      aria-hidden="true"
                    />
                    <div
                      className={`d-flex flex-grow-1 align-items-center justify-content-between rounded-3 px-2 py-2 small ${isStopLoss ? "bg-danger bg-opacity-10 text-danger" : "bg-success bg-opacity-10 text-success"}`}
                    >
                      <span className="fw-semibold">{label}</span>
                      <span className="fw-semibold text-body-emphasis">
                        {formatTriggerTime(triggerAt)}
                      </span>
                    </div>
                  </div>
                ))}
                {hitTimeline.length > 1 && (
                  <div
                    className="position-absolute border-start border-2 border-success border-opacity-50"
                    style={{
                      left: 7,
                      top: 25,
                      bottom: 25,
                      pointerEvents: "none",
                    }}
                    aria-hidden="true"
                  />
                )}
              </div>
            </div>
          )}
      </div>
    </section>
  );
}
