import { useEffect, useState } from "react";
import diya from "../assets/Diya.gif";
import fireworks from "../assets/fataka2.gif";
import "./DiwaliBanner.css";

const MUHURAT_END = new Date("2026-11-08T15:30:00+05:30").getTime();
const NEW_YEAR_START = new Date("2026-11-10T00:00:00+05:30").getTime();
const FESTIVALS = {
  muhurat: {
    name: "Diwali",
    greeting: "Muhurat Trading",
    taglines: [
      "Get special trades for muhurat trading",
      "On Sunday 2:20 - 3:30 PM in IDT PRO",
    ],
    nextChangeAt: MUHURAT_END,
  },
  diwali: {
    name: "Diwali",
    greeting: "Happy Diwali",
    taglines: [
      "Wishing you a joyful Diwali",
      "May prosperity light your path",
    ],
    nextChangeAt: NEW_YEAR_START,
  },
  newYear: {
    name: "New Year",
    greeting: "Happy New Year",
    taglines: [
      "Wishing you success and joy",
      "Cheers to new beginnings",
    ],
  },
};

function getCurrentFestival(now = Date.now()) {
  if (now < MUHURAT_END) return FESTIVALS.muhurat;
  if (now < NEW_YEAR_START) return FESTIVALS.diwali;
  return FESTIVALS.newYear;
}

function FestivalTagline({ messages }) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [visibleCharacters, setVisibleCharacters] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const message = messages[messageIndex];

  useEffect(() => {
    const timer = window.setTimeout(
      () => {
        if (isDeleting) {
          if (visibleCharacters === 0) {
            setIsDeleting(false);
            setMessageIndex((index) => (index + 1) % messages.length);
          } else {
            setVisibleCharacters((count) => count - 1);
          }
        } else if (visibleCharacters < message.length) {
          setVisibleCharacters((count) => count + 1);
        } else {
          setIsDeleting(true);
        }
      },
      isDeleting
        ? 35
        : visibleCharacters >= message.length
          ? 1600
          : 70,
    );
    return () => window.clearTimeout(timer);
  }, [isDeleting, message.length, messages.length, visibleCharacters]);

  return (
    <div>
    <small
      className="diwali-banner-tagline-text d-md-block d-none"
      aria-label={messages.join(". ")}
      aria-live="off"
    >
      {message.slice(0, visibleCharacters)}
    </small>
    <span
      className="diwali-banner-tagline-text d-md-none d-block"
      aria-label={messages.join(". ")}
      aria-live="off"
    >
      {message.slice(0, visibleCharacters)}
    </span>
    </div>
  );
}

export default function DiwaliBanner({
  onOpenAccount,
  inline = false,
  disabled = false,
}) {
  const [visible, setVisible] = useState(true);
  const [festival, setFestival] = useState(getCurrentFestival);

  useEffect(() => {
    const updateFestival = () => setFestival(getCurrentFestival());
    const timeout = festival.nextChangeAt
      ? window.setTimeout(
          updateFestival,
          Math.max(0, festival.nextChangeAt - Date.now()),
        )
      : undefined;
    document.addEventListener("visibilitychange", updateFestival);
    return () => {
      if (timeout !== undefined) window.clearTimeout(timeout);
      document.removeEventListener("visibilitychange", updateFestival);
    };
  }, [festival]);

  return (
    <aside
      className={`${!visible ? "d-none " : ""}diwali-banner${inline ? " diwali-banner--inline" : ""} diwali-banner--${festival.name
        .toLowerCase()
        .replace(" ", "-")}`}
      aria-label={festival.greeting}
    >
      <div className={`diwali-banner-content d-flex align-items-center gap-2 gap-sm-3 px-2 px-sm-4 py-2${inline ? " diwali-banner-content--inline" : ""}`}>
        <img className={`diwali-banner-diya${inline ? " diwali-banner-diya--inline" : ""}`} src={diya} alt="" />
        <strong className={`diwali-banner-title${inline ? " diwali-banner-title--inline" : " text-nowrap"}`}>{festival.greeting}</strong>
        <span className={`diwali-banner-divider${inline ? " diwali-banner-divider--inline" : ""}`} aria-hidden="true" />
        <span className={`diwali-banner-tagline${inline ? " diwali-banner-tagline--inline" : ""}`}>
          <FestivalTagline key={festival.greeting} messages={festival.taglines} />
        </span>
        <img className={`diwali-banner-fireworks${inline ? " diwali-banner-fireworks--inline" : ""}`} src={fireworks} alt="" />
        <button
          className={`diwali-banner-cta btn btn-sm fw-bold text-nowrap ms-auto rounded-3${inline ? " diwali-banner-cta--inline" : ""}`}
          type="button"
          onClick={onOpenAccount}
          disabled={disabled}
          data-ev="diwali_open_account"
        >
          <span className="diwali-banner-cta-full">Get Started</span>
          <span className="diwali-banner-cta-compact">Get Started</span>
        </button>
        <button
          className={`diwali-banner-close btn btn-sm rounded-circle${inline ? " diwali-banner-close--inline" : ""}`}
          type="button"
          aria-label="Close Diwali promotion"
          onClick={() => setVisible(false)}
        >
          {"×"}
        </button>
      </div>
    </aside>
  );
}
