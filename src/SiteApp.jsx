import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import SiteFooter from "./components/SiteFooter.jsx";
import Copyright from "./components/Copyright.jsx";
import SiteHeader from "./components/SiteHeader.jsx";
import DiwaliBanner from "./components/DiwaliBanner.jsx";
import HomePage from "./pages/BootstrapHomePage.jsx";
import HomePage1 from "./pages/HomePage_1.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import OtpVerificationPage from "./pages/OtpVerificationPage.jsx";
import AppToast from "./components/AppToast.jsx";
import ProfileDetailsPage from "./pages/ProfileDetailsPage.jsx";
import ServiceListPage from "./pages/ServiceListPage.jsx";
import PricingPage from "./pages/PricingPage.jsx";
import KycPage from "./pages/KycPage.jsx";
import AgreementPage from "./pages/AgreementPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import DownloadPage from "./pages/DownloadPage.jsx";
import RecurringReturnPage from "./pages/RecurringReturnPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import api from "./services/api.js";
import store from "./store/index.js";
import { selectEapiAuth } from "./store/eapiAuthSlice.js";
import { selectUapiAuth } from "./store/uapiAuthSlice.js";
import {
  getUserId,
  hasRequiredDetails,
  isValidMobileNumber,
} from "./utils/authResponse.js";
import {
  agreementIsComplete,
  kycIsComplete,
  paymentIsComplete,
} from "./utils/onboardingStatus.js";
import LoginPagePreview from "./pages/LoginPagePreview.jsx";
import OtpVerificationPagePreview from "./pages/OtpVerificationPagePreview.jsx";
import TradingCombo from "./pages/TradingCombo.jsx";
import HomePage_3, { homePage3Faqs } from "./pages/HomePage_3.jsx";
import HomeIdt from "./pages/HomeIdt.jsx";
import IdtLandingPage from "./pages/IdtLandingPage.jsx";
import OptionsSignals from "./pages/OptionsSignals.jsx";
import CashIntradaySignals from "./pages/CashIntradaySignals.jsx";
import StockFutureIntradaySignals from "./pages/StockFutureIntradaySignals.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import SubscribeCallsOverlay from "./pages/SubscribeCallsOverlay.jsx";
import {
  enableNotifications,
  listenForForegroundMessages,
  registerNotificationToken,
} from "./notificationService";

const pagePaths = {
  home: "/home",
  "home-idt": "/home-idt",
  home2: "/home2",
  home3: "/idt-home",
  "idt-landing": "/",
  login: "/login",
  "login-idt": "/login-idt",
  "idt-login": "/idt-login",
  "verify-otp": "/verify-otp",
  "verify-otp-idt": "/verify-otp-idt",
  details: "/details",
  profile: "/profile",
  services: "/services",
  pricing: "/pricing",
  kyc: "/kyc",
  agreement: "/agreement",
  download: "/download",
  "recurring-return": "/recurring-return-url",
  "live-calls": "/live-calls",
  "cash-intraday": "/cash-intraday",
  "stock-future-intraday": "/stock-future-intraday",
  "live-calls-list": "/live-calls-list",
  "services-list": "/services-list",
  "cash-intraday-list": "/cash-intraday-list",
  "stock-future-intraday-list": "/stock-future-intraday-list",
  "idt-landing-page": "/idt-landing-page",
  dashboard: "/dashboard",
};

const dashboardNavigation = [
  { page: "dashboard", label: "Home", icon: "bi-house-door" },
  {
    page: "live-calls-list",
    label: "Live Calls",
    icon: "bi-lightning-charge-fill",
  },
  {
    page: "cash-intraday-list",
    label: "Cash Trades",
    icon: "bi-currency-rupee",
  },
  {
    page: "stock-future-intraday-list",
    label: "Future Trades",
    icon: "bi-graph-up-arrow",
  },
];

const activeSidebarTextStyle = {
  backgroundImage: "linear-gradient(90deg, #fe7902 0%, #f6530b 100%)",
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  color: "#f6530b",
  WebkitTextFillColor: "transparent",
};

function DashboardSidebar({ page, onNavigate }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`d-none d-lg-block ${
        collapsed ? "col-lg-auto" : "col-lg-2"
      } bg-white border-end`}
    >
      <aside className={`sticky-top p-3`} aria-label="Dashboard sidebar">
        <div
          className={`d-flex align-items-center mb-3 ${
            collapsed ? "justify-content-center" : "justify-content-between"
          }`}
        >
          {!collapsed && (
            <p className="small fw-bold text-body-secondary text-uppercase mb-0">
              <small>Workspace</small>
            </p>
          )}
          <button
            type="button"
            className="btn btn-sm border-0 shadow-none text-body-secondary p-0"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed((isCollapsed) => !isCollapsed)}
          >
            <i
              className={`bi ${
                collapsed ? "bi-chevron-bar-right" : "bi-chevron-bar-left"
              }`}
              aria-hidden="true"
            />
          </button>
        </div>
        <nav
          className="nav flex-column gap-2"
          aria-label="Dashboard navigation"
        >
          {dashboardNavigation.map((item) => {
            const active = page === item.page;
            return (
              <button
                key={item.page}
                type="button"
                className={`nav-link text-start d-flex align-items-center ${
                  collapsed ? "justify-content-center" : "gap-2"
                } ${active ? "fw-semibold rounded-3" : "text-body-secondary"}`}
                style={
                  active
                    ? { backgroundColor: "#FFF1E6", color: "#f6530b" }
                    : undefined
                }
                aria-current={active ? "page" : undefined}
                aria-label={collapsed ? item.label : undefined}
                title={collapsed ? item.label : undefined}
                onClick={(event) => {
                  onNavigate(item.page);
                  event.currentTarget.blur();
                }}
              >
                <i
                  className={`bi ${item.icon}`}
                  aria-hidden="true"
                  style={active ? activeSidebarTextStyle : undefined}
                />
                {!collapsed && (
                  <span style={active ? activeSidebarTextStyle : undefined}>
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        <nav
          className="nav flex-column mt-3 pt-3 border-top"
          aria-label="Account navigation"
        >
          <button
            type="button"
            className={`nav-link text-start d-flex align-items-center ${
              collapsed ? "justify-content-center" : "gap-2"
            } ${
              page === "profile"
                ? "fw-semibold rounded-3"
                : "text-body-secondary"
            }`}
            style={
              page === "profile"
                ? { backgroundColor: "#FFF1E6", color: "#f6530b" }
                : undefined
            }
            aria-current={page === "profile" ? "page" : undefined}
            aria-label={collapsed ? "Profile" : undefined}
            title={collapsed ? "Profile" : undefined}
            onClick={(event) => {
              onNavigate("profile");
              event.currentTarget.blur();
            }}
          >
            <i
              className="bi bi-person-circle"
              aria-hidden="true"
              style={page === "profile" ? activeSidebarTextStyle : undefined}
            />
            {!collapsed && (
              <span
                style={page === "profile" ? activeSidebarTextStyle : undefined}
              >
                Profile
              </span>
            )}
          </button>
        </nav>
      </aside>
    </div>
  );
}

const mobileDashboardNavigation = [
  { page: "dashboard", label: "Home", icon: "bi-house-door" },
  {
    page: "live-calls-list",
    label: "Live Calls",
    icon: "bi-lightning-charge-fill",
  },
  {
    page: "cash-intraday-list",
    label: "Cash Trades",
    icon: "bi-currency-rupee",
  },
  {
    page: "stock-future-intraday-list",
    label: "Future Trades",
    icon: "bi-graph-up-arrow",
  },
];

function MobileDashboardNavigation({ page, onNavigate }) {
  return (
    <nav
      className="position-fixed bottom-0 start-0 end-0 z-3 d-flex d-lg-none bg-black rounded-4 shadow p-1 mx-3 mb-3"
      aria-label="Dashboard navigation"
    >
      {mobileDashboardNavigation.map((item) => {
        const active = page === item.page;
        const activeGradientStyle = active
          ? {
              backgroundImage:
                "linear-gradient(90deg, #fe7902 0%, #f6530b 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "#f6530b",
              WebkitTextFillColor: "transparent",
            }
          : undefined;
        return (
          <button
            key={item.page}
            type="button"
            className={`btn btn-sm flex-fill d-flex flex-column align-items-center justify-content-center gap-1 p-1 rounded-0 border-0 ${
              active ? "fw-bold" : "text-light"
            }`}
            aria-current={active ? "page" : undefined}
            onClick={() => onNavigate(item.page)}
          >
            <i
              className={`bi ${item.icon} fs-6`}
              aria-hidden="true"
              style={activeGradientStyle}
            />
            <small className="text-nowrap lh-1" style={activeGradientStyle}>
              {item.label}
            </small>
          </button>
        );
      })}
    </nav>
  );
}

const defaultDescription =
  "Explore the Intraday Traders app for analyst research, real-time market alerts, structured trade levels, app notifications and research history.";

const homePages = [
  "home",
  "home-idt",
  "home1",
  "home2",
  "home3",
  "idt-landing",
  "idt-landing-page",
  "live-calls",
  "services",
  "cash-intraday",
  "stock-future-intraday",
];

const pageSeo = {
  home: {
    title: "Intraday Traders App | Research Calls & Market Alerts",
    description: defaultDescription,
    keywords:
      "Intraday Traders app, trading research app, market alerts, research calls, trade levels, app notifications, research history",
    indexable: true,
  },
  "home-idt": {
    title: "Intraday Combo Plans | EquityPandit",
    description:
      "Choose an Intraday Combo subscription plan from EquityPandit.",
    indexable: true,
  },
  home3: {
    title: "Live Intraday Trading Calls & Recommendations | Intraday Traders",
    description:
      "Get research-backed live intraday trading calls with entry, target and stop-loss levels for cash, stock futures, index options and stock options.",
    keywords:
      "live intraday trading calls, intraday trading recommendations, cash intraday calls, stock futures calls, index options calls, stock options calls, Nifty options calls, Bank Nifty options calls",
    indexable: true,
  },
  "idt-landing": {
    title: "Intraday Trading Calls & Market Insights App | IDT by EquityPandit",
    description:
      "Explore IDT by EquityPandit for live intraday trading calls, cash and stock futures research, market insights, and clear entry, target and stop-loss levels.",
    keywords:
      "intraday trading calls, live options calls, cash intraday, stock futures, market insights",
    indexable: true,
  },
  "idt-landing-page": {
    title: "Intraday Trading Calls & Market Insights App | IDT by EquityPandit",
    description:
      "Explore IDT by EquityPandit for live intraday trading calls, cash and stock futures research, market insights, and clear entry, target and stop-loss levels.",
    keywords:
      "intraday trading calls, live options calls, cash intraday, stock futures, market insights",
    indexable: true,
  },
  "live-calls": {
    title: "Live Options Calls | Intraday Traders",
    description:
      "View the latest live options research calls from Intraday Traders.",
  },
  "live-calls-list": {
    title: "Live Options Calls | Intraday Traders",
    description:
      "View the latest live options research calls from Intraday Traders.",
  },
  "cash-intraday-list": {
    title: "Cash Intraday Calls | Intraday Traders",
    description: "View live bullish and bearish cash intraday research calls.",
  },
  "cash-intraday": {
    title: "Cash Intraday Calls | Intraday Traders",
    description: "View live bullish and bearish cash intraday research calls.",
  },
  "stock-future-intraday": {
    title: "Stock Future Intraday Calls | Intraday Traders",
    description:
      "View live bullish and bearish stock future intraday research calls.",
  },
  "stock-future-intraday-list": {
    title: "Stock Future Intraday Calls | Intraday Traders",
    description:
      "View live bullish and bearish stock future intraday research calls.",
  },
  dashboard: {
    title: "Market Dashboard | Intraday Traders",
    description:
      "Track live GIFT Nifty, Nifty, Sensex and sector index values.",
  },
  login: {
    title: "Login | Intraday Traders",
    description: "Log in securely to your Intraday Traders account.",
  },
  "idt-login": {
    title: "Login Offer | Intraday Traders",
    description:
      "Log in securely and check your available Intraday Traders offer.",
  },
  "login-idt": {
    title: "Login Offer | Intraday Traders",
    description:
      "Log in securely and check your available Intraday Traders offer.",
  },
  "verify-otp": {
    title: "Verify OTP | Intraday Traders",
    description:
      "Verify your mobile number to access your Intraday Traders account.",
  },
  "verify-otp-idt": {
    title: "Verify OTP | Intraday Traders",
    description:
      "Verify your mobile number to access your Intraday Traders account.",
  },
  details: {
    title: "Complete Profile | Intraday Traders",
    description: "Complete your Intraday Traders account profile.",
  },
  profile: {
    title: "My Profile | Intraday Traders",
    description: "View your Intraday Traders account profile.",
  },
  services: {
    title: "Choose a Plan | Intraday Traders",
    description: "Choose an Intraday Traders subscription plan.",
  },
  "services-list": {
    title: "Choose a Plan | Intraday Traders",
    description: "Choose an Intraday Traders subscription plan.",
  },
  pricing: {
    title: "Pricing | Intraday Traders",
    description:
      "Explore Intraday Traders services and choose a subscription plan.",
  },
  kyc: {
    title: "Complete KYC | Intraday Traders",
    description:
      "Complete the identity verification required for your Intraday Traders account.",
  },
  agreement: {
    title: "Service Agreement | Intraday Traders",
    description: "Review and accept your Intraday Traders service agreement.",
  },
  download: {
    title: "Download the App | Intraday Traders",
    description: "Download the Intraday Traders mobile app.",
  },
  "recurring-return": {
    title: "Subscription Status | Intraday Traders",
    description: "Review your Intraday Traders subscription status.",
  },
  "not-found": {
    title: "Page Not Found | Intraday Traders",
    description: "The requested Intraday Traders page could not be found.",
  },
};

function setMeta(selector, attribute, value) {
  const element = document.head.querySelector(selector);
  if (element) element.setAttribute(attribute, value);
}

function pageFromPath(pathname) {
  const normalizedPath =
    pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;

  if (normalizedPath === "/idt-landing") {
    return "idt-landing";
  }
  if (normalizedPath === "/idt-landing-page") {
    const params = new URLSearchParams(window.location.search);
    const source = params.get("src")?.trim();
    if (source && !params.get("sr")?.trim()) {
      params.set("sr", source);
      params.delete("src");
      const query = params.toString();
      window.history.replaceState(
        { page: "idt-landing-page" },
        "",
        `/idt-landing-page${query ? `?${query}` : ""}${window.location.hash}`,
      );
    }
    return "idt-landing-page";
  }

  if (normalizedPath === "/get") {
    const params = new URLSearchParams(window.location.search);
    const source = params.get("src");
    params.delete("src");
    if (source && !params.has("sr")) params.set("sr", source);
    const query = params.toString();
    window.history.replaceState(
      { page: "idt-landing" },
      "",
      `/${query ? `?${query}` : ""}${window.location.hash}`,
    );
    return "idt-landing";
  }

  // if (normalizedPath === "/") {
  //   window.history.replaceState(
  //     { page: "home-idt" },
  //     "",
  //     `/home-idt${window.location.search}${window.location.hash}`,
  //   );
  //   return "home-idt";
  // }

  if (normalizedPath === "/pricing") {
    window.history.replaceState(
      { page: "services-list" },
      "",
      `/services-list${window.location.search}${window.location.hash}`,
    );
    return "services-list";
  }

  if (normalizedPath === "/login") {
    window.history.replaceState(
      { page: "login-idt" },
      "",
      `/login-idt${window.location.search}${window.location.hash}`,
    );
    return "login-idt";
  }

  if (normalizedPath === "/live-calls") return "live-calls";
  if (normalizedPath === "/service") return "services";
  if (normalizedPath === "/cash-intraday") return "cash-intraday";
  if (normalizedPath === "/stock-future-intraday")
    return "stock-future-intraday";

  return (
    Object.entries(pagePaths).find(
      ([, path]) => path === normalizedPath,
    )?.[0] || "not-found"
  );
}

function SiteApp() {
  const uapiAuth = useSelector(selectUapiAuth);
  const eapiAuth = useSelector(selectEapiAuth);
  const hasMobileNumber = isValidMobileNumber(uapiAuth.mobileNumber);
  const authenticated = Boolean(uapiAuth.token || uapiAuth.refreshToken);
  const [page, setPage] = useState(() =>
    pageFromPath(window.location.pathname),
  );
  const [toast, setToast] = useState(null);
  const [userStatuses, setUserStatuses] = useState({
    kycComplete: false,
    agreementComplete: false,
    paymentComplete: false,
  });
  const [resolvingRoute, setResolvingRoute] = useState(false);
  const routeResolutionId = useRef(0);
  const [status, setStatus] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState("");
  const usesOnboardingBackground = [
    "login",
    "verify-otp",
    "details",
    "services",
    "pricing",
    "kyc",
    "agreement",
    "download",
    "recurring-return",
  ].includes(page);

  const notify = useCallback(
    (type, message) => setToast({ type, message, id: Date.now() }),
    [],
  );
  const closeToast = useCallback(() => setToast(null), []);
  const updateUserStatuses = useCallback(
    (statuses) => setUserStatuses(statuses),
    [],
  );
  const navigate = useCallback((nextPage, replace = false, options = {}) => {
    const nextPath = pagePaths[nextPage] || "/";
    let search = window.location.search;
    if (options.keepSearch === false) {
      search = "";
    }
    if (options.source) {
      const params = new URLSearchParams(search);
      params.set("sr", options.source);
      search = `?${params}`;
    }
    const nextUrl = `${nextPath}${search}`;
    window.history[replace ? "replaceState" : "pushState"](
      { page: nextPage },
      "",
      nextUrl,
    );
    setPage(nextPage);
  }, []);

  const refreshOnboardingStatuses = useCallback(
    async (currentEapiAuth = eapiAuth) => {
      try {
        const statusResponse = await api.uapi.checkAgreementStatus();
        const paymentComplete = paymentIsComplete(statusResponse);
        const agreementComplete = agreementIsComplete(statusResponse);
        let kycComplete = false;

        const epUserId =
          getUserId(currentEapiAuth?.user) ||
          getUserId(currentEapiAuth?.loginResponse);
        if (currentEapiAuth?.token && epUserId) {
          try {
            kycComplete = kycIsComplete(
              await api.eapi.getKycByUserId(epUserId),
            );
          } catch (error) {
            if (error.status !== 404) throw error;
          }
        }

        const nextStatuses = {
          paymentComplete,
          kycComplete,
          agreementComplete,
        };
        setUserStatuses(nextStatuses);
        return nextStatuses;
      } catch (error) {
        notify(
          "error",
          error.message || "Unable to check your onboarding status",
        );
        return null;
      }
    },
    [eapiAuth, notify],
  );

  const resolveOnboardingRoute = useCallback(
    async (routeContext = {}) => {
      const resolutionId = ++routeResolutionId.current;
      const state = store.getState();
      const currentUapiAuth = state.uapiAuth;
      const currentEapiAuth = state.eapiAuth;

      if (!currentUapiAuth?.token && !currentUapiAuth?.refreshToken) {
        navigate("login-idt", true);
        return "login";
      }
      if (!hasRequiredDetails(currentUapiAuth.user)) {
        navigate("details", true, { keepSearch: false });
        return "details";
      }

      setResolvingRoute(true);
      try {
        const nextStatuses = await refreshOnboardingStatuses(currentEapiAuth);
        if (resolutionId !== routeResolutionId.current) return null;
        if (!nextStatuses) {
          const fallbackPage = routeContext.dashboardEntry
            ? "dashboard"
            : "services-list";
          navigate(fallbackPage, true, { keepSearch: false });
          return fallbackPage;
        }
        const paymentComplete =
          routeContext.paymentComplete ?? nextStatuses.paymentComplete;
        const requestedPage = [
          "live-calls-list",
          "cash-intraday-list",
          "stock-future-intraday-list",
        ].includes(routeContext.destination)
          ? routeContext.destination
          : null;

        const paymentFirst =
          routeContext.loginEntry || routeContext.paymentEntry;
        const nextPage = requestedPage
          ? requestedPage
          : routeContext.dashboardEntry
            ? "dashboard"
            : paymentFirst && !paymentComplete
              ? "services-list"
              : !nextStatuses.kycComplete
                ? "kyc"
                : !nextStatuses.agreementComplete
                  ? "agreement"
                  : !paymentComplete
                    ? "services-list"
                    : "download";
        navigate(nextPage, true, { keepSearch: false });
        return nextPage;
      } catch (error) {
        if (resolutionId !== routeResolutionId.current) return null;
        notify(
          "error",
          error.message || "Unable to check your onboarding status",
        );
        return null;
      } finally {
        if (resolutionId === routeResolutionId.current)
          setResolvingRoute(false);
      }
    },
    [navigate, refreshOnboardingStatuses],
  );

  const handleDashboardTradeSelect = useCallback(
    async (destination) => {
      if (!authenticated) {
        navigate("login-idt");
        return;
      }
      const nextStatuses = await refreshOnboardingStatuses();
      if (!nextStatuses) return;
      if (!nextStatuses.kycComplete || !nextStatuses.agreementComplete) {
        await resolveOnboardingRoute({ destination });
        return;
      }
      if (!nextStatuses.paymentComplete) {
        setUserStatuses(nextStatuses);
        navigate(destination);
        return;
      }
      navigate(destination);
    },
    [
      authenticated,
      navigate,
      refreshOnboardingStatuses,
      resolveOnboardingRoute,
    ],
  );

  const handleDashboardSubscribe = useCallback(() => {
    navigate("services-list");
  }, [navigate]);

  const checkPaymentCompliance = useCallback(
    () => refreshOnboardingStatuses(store.getState().eapiAuth),
    [refreshOnboardingStatuses],
  );
  const handleComplianceRequired = useCallback(
    (statuses) => {
      navigate(!statuses?.kycComplete ? "kyc" : "agreement", false, {
        keepSearch: false,
      });
    },
    [navigate],
  );

  const refreshMySubscription = useCallback(async () => {
    const response = await api.uapi.getMySubscription();
    const payload = response?.data?.data ?? response?.data ?? response ?? {};
    const subscription = Array.isArray(payload)
      ? payload[0]
      : (payload?.subscription ?? payload?.subscriptions?.[0] ?? payload);
    setSubscriptionStatus(
      String(
        subscription?.subscriptionStatus ??
          subscription?.subscription_status ??
          "",
      )
        .trim()
        .toLowerCase(),
    );
    return payload;
  }, []);

  const handleAgreementComplete = useCallback(async () => {
    setUserStatuses((current) => ({ ...current, agreementComplete: true }));
    await resolveOnboardingRoute();
  }, [resolveOnboardingRoute]);

  useEffect(() => {
    if (page !== "dashboard" || !authenticated) return;
    refreshMySubscription().catch((error) => {
      notify("error", error.message || "Unable to check your subscription.");
    });
  }, [page, authenticated, refreshMySubscription, notify]);

  useEffect(() => {
    const seo = pageSeo[page] || pageSeo["not-found"];
    const siteUrl =
      import.meta.env.VITE_SITE_URL || "https://idt.equitypandit.in/";
    const pagePath = pagePaths[page] || window.location.pathname;
    const canonicalUrl = new URL(
      pagePath.replace(/^\//, ""),
      siteUrl,
    ).toString();
    const indexable =
      import.meta.env.VITE_APP_ENV === "live" && seo.indexable === true;

    document.title = seo.title;
    setMeta('meta[name="description"]', "content", seo.description);
    setMeta('meta[name="keywords"]', "content", seo.keywords || "");
    setMeta(
      'meta[name="robots"]',
      "content",
      indexable
        ? "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
        : "noindex, nofollow, noarchive",
    );
    setMeta(
      'meta[name="googlebot"]',
      "content",
      indexable
        ? "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
        : "noindex, nofollow, noarchive",
    );
    setMeta('meta[property="og:title"]', "content", seo.title);
    setMeta('meta[property="og:description"]', "content", seo.description);
    setMeta('meta[property="og:url"]', "content", canonicalUrl);
    setMeta('meta[name="twitter:title"]', "content", seo.title);
    setMeta('meta[name="twitter:description"]', "content", seo.description);
    setMeta('link[rel="canonical"]', "href", canonicalUrl);

    const existingStructuredData = document.getElementById(
      "page-structured-data",
    );
    existingStructuredData?.remove();
    if (page === "home3" || page === "idt-landing") {
      const structuredData = document.createElement("script");
      structuredData.id = "page-structured-data";
      structuredData.type = "application/ld+json";
      if (page === "idt-landing") {
        structuredData.textContent = JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              "@id": `${canonicalUrl}#webpage`,
              url: canonicalUrl,
              name: seo.title,
              description: seo.description,
              isPartOf: { "@id": new URL("#website", siteUrl).toString() },
              about: { "@id": `${canonicalUrl}#application` },
              inLanguage: "en-IN",
            },
            {
              "@type": "SoftwareApplication",
              "@id": `${canonicalUrl}#application`,
              name: "Intraday Traders",
              alternateName: "IDT by EquityPandit",
              applicationCategory: "FinanceApplication",
              operatingSystem: "Android, iOS",
              description: seo.description,
              url: canonicalUrl,
              publisher: {
                "@type": "Organization",
                "@id": new URL("#organization", siteUrl).toString(),
                name: "EquityPandit",
                legalName: "Equitypandit Financial Services Private Limited",
                url: siteUrl,
              },
            },
          ],
        });
        document.head.appendChild(structuredData);
      } else {
        structuredData.textContent = JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              "@id": `${canonicalUrl}#webpage`,
              url: canonicalUrl,
              name: seo.title,
              description: seo.description,
              isPartOf: {
                "@id": new URL("#website", siteUrl).toString(),
              },
              about: {
                "@id": `${canonicalUrl}#service`,
              },
              inLanguage: "en-IN",
            },
            {
              "@type": "Service",
              "@id": `${canonicalUrl}#service`,
              name: "Live Intraday Trading Calls and Recommendations",
              serviceType: "Intraday trading research and recommendations",
              description: seo.description,
              provider: {
                "@type": "Organization",
                "@id": new URL("#organization", siteUrl).toString(),
                name: "Intraday Traders",
                legalName: "Equitypandit Financial Services Private Limited",
                url: siteUrl,
              },
              areaServed: {
                "@type": "Country",
                name: "India",
              },
              audience: {
                "@type": "Audience",
                audienceType: "Indian stock market traders",
              },
              hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: "Intraday research coverage",
                itemListElement: [
                  { "@type": "Offer", name: "Cash Intraday Calls" },
                  { "@type": "Offer", name: "Stock Futures Calls" },
                  { "@type": "Offer", name: "Index Options Calls" },
                  { "@type": "Offer", name: "Stock Options Calls" },
                ],
              },
            },
            {
              "@type": "FAQPage",
              "@id": `${canonicalUrl}#faq`,
              mainEntity: homePage3Faqs.map(({ question, answer }) => ({
                "@type": "Question",
                name: question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: answer,
                },
              })),
            },
          ],
        });
        document.head.appendChild(structuredData);
      }
    }
    window.scrollTo({ top: 0, behavior: "instant" });

    return () => {
      document.getElementById("page-structured-data")?.remove();
    };
  }, [page]);

  useEffect(() => {
    const handlePopState = () =>
      setPage(pageFromPath(window.location.pathname));
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const protectedPages = [
      "services-list",
      "pricing",
      "kyc",
      "agreement",
      "download",
    ];
    const authenticatedEntryPages = [
      ...homePages,
      "login",
      "login-idt",
      "idt-login",
      "verify-otp",
      "verify-otp-idt",
    ];

    if (authenticatedEntryPages.includes(page) && authenticated) {
      resolveOnboardingRoute({ loginEntry: true });
      return;
    }
    if (["verify-otp", "verify-otp-idt"].includes(page) && !hasMobileNumber) {
      navigate("login-idt", true);
      return;
    }
    if (page === "dashboard") {
      resolveOnboardingRoute({ dashboardEntry: true });
      return;
    }
    if (page === "download" && authenticated) {
      refreshOnboardingStatuses();
      return;
    }
    if (["services-list", "pricing"].includes(page)) {
      resolveOnboardingRoute({ paymentEntry: true });
      return;
    }
    if (protectedPages.includes(page)) {
      resolveOnboardingRoute();
      return;
    }
    if (page === "profile" && !authenticated) navigate("login-idt", true);
  }, [
    navigate,
    page,
    resolveOnboardingRoute,
    refreshOnboardingStatuses,
    hasMobileNumber,
    authenticated,
  ]);

  useEffect(() => {
    if (
      [
        "live-calls-list",
        "cash-intraday-list",
        "stock-future-intraday-list",
      ].includes(page)
    ) {
      resolveOnboardingRoute({ destination: page });
    }
  }, [page, resolveOnboardingRoute]);

  useEffect(() => {
    const currentUapiAuth = store.getState().uapiAuth;
    const skipStatusPages = [
      ...homePages,
      "login",
      "login-idt",
      "idt-login",
      "verify-otp",
      "verify-otp-idt",
      "details",
      "services-list",
      "pricing",
      "kyc",
      "agreement",
      "download",
    ];
    const authenticated = Boolean(
      currentUapiAuth?.token || currentUapiAuth?.refreshToken,
    );

    if (
      !authenticated ||
      skipStatusPages.includes(page) ||
      !hasRequiredDetails(currentUapiAuth.user)
    )
      return;

    refreshOnboardingStatuses();
  }, [page, refreshOnboardingStatuses, uapiAuth.token, uapiAuth.user]);
  useEffect(() => {
    if (!authenticated) return;

    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        registerNotificationToken().catch((error) => {
          console.error("Notification token registration failed:", error);
        });
      } else if (Notification.permission === "default") {
        enableNotifications().then((result) => {
          if (!result.success) {
            console.info(
              "Notification permission was not enabled:",
              result.message,
            );
          }
        });
      }
    }
    let unsubscribe;

    listenForForegroundMessages((payload) => {
      const title = payload.notification?.title || "Notification";
      const body = payload.notification?.body || "";

      setStatus(`${title}${body ? `: ${body}` : ""}`);
    }).then((cleanup) => {
      unsubscribe = cleanup;
    });

    return () => unsubscribe?.();
  }, [authenticated]);

  const isHomePage = [
    "home",
    "home-idt",
    "home1",
    "home2",
    "home3",
    "idt-landing",
  ].includes(page);
  const bannerSource =
    new URLSearchParams(window.location.search).get("sr") ||
    (page === "idt-landing" ? "ITW" : page);

  return (
    <div
      id="top"
      // className={`min-vh-100 d-flex flex-column ${usesOnboardingBackground ? "bg-body-tertiary" : "bg-white"}`}
      className={`min-vh-100 d-flex flex-column bg-body page-${page}`}
    >
      {![
        "home-idt",
        "login-idt",
        "idt-login",
        "verify-otp-idt",
        "services",
        "live-calls",
        "cash-intraday",
        "stock-future-intraday",
      ].includes(page) && (
        <SiteHeader
          isHome={page === "home" || page === "idt-landing"}
          onHome={() => navigate("idt-landing")}
          onLogin={() => navigate("login-idt")}
          onProfile={() => navigate("profile")}
          onDashboard={() => resolveOnboardingRoute({ dashboardEntry: true })}
          onDownload={() => navigate("download")}
          onKyc={resolveOnboardingRoute}
          onAgreement={resolveOnboardingRoute}
          onLiveCalls={() =>
            resolveOnboardingRoute({ destination: "live-calls-list" })
          }
          onCashIntraday={() =>
            resolveOnboardingRoute({ destination: "cash-intraday-list" })
          }
          onStockFutureIntraday={() =>
            resolveOnboardingRoute({
              destination: "stock-future-intraday-list",
            })
          }
          notify={notify}
          onLogout={() => {
            setUserStatuses({
              kycComplete: false,
              agreementComplete: false,
              paymentComplete: false,
            });
            navigate("login-idt", true);
          }}
          statuses={userStatuses}
          hideLogin={["verify-otp", "details"].includes(page)}
        />
      )}
      {page === "home" && !authenticated && (
        <HomePage onGetStarted={() => navigate("login-idt")} />
      )}
      {page === "services" && !authenticated && (
        <SubscribeCallsOverlay
          page={page}
          onSubscribe={() => navigate("login-idt")}
        />
      )}
      {page === "live-calls" && !authenticated && (
        <SubscribeCallsOverlay
          page={page}
          onSubscribe={() => navigate("login-idt")}
        />
      )}
      {page === "cash-intraday" && !authenticated && (
        <SubscribeCallsOverlay
          page={page}
          onSubscribe={() => navigate("login-idt")}
        />
      )}
      {page === "stock-future-intraday" && !authenticated && (
        <SubscribeCallsOverlay
          page={page}
          onSubscribe={() => navigate("login-idt")}
        />
      )}
      {page === "home-idt" && !authenticated && (
        <HomeIdt
          authenticated={authenticated}
          onGetStarted={resolveOnboardingRoute}
          onOtpSent={() => {
            const hasSource = new URLSearchParams(window.location.search).has(
              "sr",
            );
            navigate(
              "verify-otp-idt",
              false,
              hasSource ? {} : { source: "home-idt" },
            );
          }}
          notify={notify}
        />
      )}
      {page === "home1" && !authenticated && (
        <HomePage1 onGetStarted={() => navigate("login-idt")} />
      )}
      {page === "home2" && !authenticated && (
        <TradingCombo onGetStarted={() => navigate("login-idt")} />
      )}
      {page === "home3" && !authenticated && (
        <HomePage_3
          authenticated={authenticated}
          onGetStarted={() =>
            authenticated
              ? resolveOnboardingRoute()
              : navigate("login-idt", false, {
                  source:
                    new URLSearchParams(window.location.search).get("sr") ||
                    "idt-home",
                })
          }
          onOtpSent={() =>
            navigate("verify-otp-idt", false, {
              source:
                new URLSearchParams(window.location.search).get("sr") ||
                "idt-home",
            })
          }
          notify={notify}
        />
      )}
      {page === "idt-landing" && !authenticated && (
        <IdtLandingPage
          onLogin={() =>
            navigate("login-idt", false, {
              source:
                new URLSearchParams(window.location.search).get("sr") || "ITW",
            })
          }
          onOtpSent={() =>
            navigate("verify-otp-idt", false, {
              source:
                new URLSearchParams(window.location.search).get("sr") || "ITW",
            })
          }
          notify={notify}
        />
      )}
      {page === "idt-landing-page" && !authenticated && (
        <IdtLandingPage
          onLogin={() =>
            navigate("login-idt", false, {
              source:
                new URLSearchParams(window.location.search).get("sr") || "ITW",
            })
          }
          onOtpSent={() =>
            navigate("verify-otp-idt", false, {
              source:
                new URLSearchParams(window.location.search).get("sr") || "ITW",
            })
          }
          notify={notify}
        />
      )}
      {page === "login" && !authenticated && (
        <LoginPage onOtpSent={() => navigate("verify-otp")} notify={notify} />
      )}
      {page === "login-idt" && !authenticated && (
        <LoginPagePreview
          onOtpSent={() => navigate("verify-otp-idt")}
          notify={notify}
          compactMobile
        />
      )}
      {page === "idt-login" && !authenticated && (
        <LoginPagePreview
          onOtpSent={() => navigate("verify-otp-idt")}
          notify={notify}
          showOfferTimer
        />
      )}
      {page === "verify-otp" && hasMobileNumber && !authenticated && (
        <OtpVerificationPage
          onBack={() => navigate("login-idt")}
          onDetailsRequired={() =>
            navigate("details", false, { keepSearch: false })
          }
          onComplete={() => resolveOnboardingRoute({ loginEntry: true })}
          notify={notify}
        />
      )}
      {page === "verify-otp-idt" && hasMobileNumber && !authenticated && (
        <OtpVerificationPagePreview
          onBack={() => navigate("login-idt")}
          onDetailsRequired={() =>
            navigate("details", false, { keepSearch: false })
          }
          onComplete={() => resolveOnboardingRoute({ loginEntry: true })}
          notify={notify}
        />
      )}
      {page === "details" && (
        <ProfileDetailsPage
          onComplete={() => resolveOnboardingRoute({ loginEntry: true })}
          notify={notify}
        />
      )}
      {[
        "dashboard",
        "live-calls-list",
        "cash-intraday-list",
        "stock-future-intraday-list",
        "profile",
      ].includes(page) && (
        <div className="row g-0 flex-grow-1">
          <DashboardSidebar
            page={page}
            onNavigate={(nextPage) =>
              nextPage === "profile"
                ? navigate("profile")
                : nextPage === "dashboard"
                  ? resolveOnboardingRoute({ dashboardEntry: true })
                  : resolveOnboardingRoute({ destination: nextPage })
            }
          />
          <div className="col d-flex flex-column">
            {page === "live-calls-list" &&
              authenticated &&
              (!userStatuses.paymentComplete ||
                !userStatuses.kycComplete ||
                !userStatuses.agreementComplete) && (
                <SubscribeCallsOverlay
                  page={page}
                  onSubscribe={() => navigate("pricing")}
                  complianceStatuses={userStatuses}
                  onKyc={() => navigate("kyc")}
                  onAgreement={() => navigate("agreement")}
                />
              )}
            {page === "live-calls-list" &&
              (!authenticated ||
                (userStatuses.paymentComplete &&
                  userStatuses.kycComplete &&
                  userStatuses.agreementComplete)) && <OptionsSignals />}
            {page === "cash-intraday-list" &&
              (!userStatuses.paymentComplete ||
                !userStatuses.kycComplete ||
                !userStatuses.agreementComplete) && (
                <SubscribeCallsOverlay
                  page={page}
                  onSubscribe={() => navigate("pricing")}
                  complianceStatuses={userStatuses}
                  onKyc={() => navigate("kyc")}
                  onAgreement={() => navigate("agreement")}
                />
              )}
            {page === "cash-intraday-list" &&
              userStatuses.paymentComplete &&
              userStatuses.kycComplete &&
              userStatuses.agreementComplete && <CashIntradaySignals />}
            {page === "stock-future-intraday-list" &&
              (!userStatuses.paymentComplete ||
                !userStatuses.kycComplete ||
                !userStatuses.agreementComplete) && (
                <SubscribeCallsOverlay
                  page={page}
                  onSubscribe={() => navigate("pricing")}
                  complianceStatuses={userStatuses}
                  onKyc={() => navigate("kyc")}
                  onAgreement={() => navigate("agreement")}
                />
              )}
            {page === "stock-future-intraday-list" &&
              userStatuses.paymentComplete &&
              userStatuses.kycComplete &&
              userStatuses.agreementComplete && <StockFutureIntradaySignals />}
            {page === "dashboard" && (
              <Dashboard
                isSubscribed={userStatuses.paymentComplete}
                onSubscribe={handleDashboardSubscribe}
                onTradeSelect={handleDashboardTradeSelect}
                subscriptionStatus={subscriptionStatus}
                onboardingStatuses={userStatuses}
                onKyc={() => resolveOnboardingRoute()}
                onAgreement={() => resolveOnboardingRoute()}
                notify={notify}
              />
            )}
            {page === "profile" && (
              <ProfilePage
                onServices={() => navigate("services-list")}
                notify={notify}
              />
            )}
            <Copyright />
            <MobileDashboardNavigation
              page={page}
              onNavigate={(nextPage) =>
                nextPage === "dashboard"
                  ? resolveOnboardingRoute({ dashboardEntry: true })
                  : resolveOnboardingRoute({ destination: nextPage })
              }
            />
          </div>
        </div>
      )}
      {page === "services-list" && (
        <ServiceListPage
          onContinue={resolveOnboardingRoute}
          onStatusChange={updateUserStatuses}
          onCheckCompliance={checkPaymentCompliance}
          onComplianceRequired={handleComplianceRequired}
          notify={notify}
        />
      )}
      {page === "pricing" && (
        <PricingPage
          onContinue={resolveOnboardingRoute}
          onStatusChange={updateUserStatuses}
          onCheckCompliance={checkPaymentCompliance}
          onComplianceRequired={handleComplianceRequired}
          notify={notify}
        />
      )}
      {page === "kyc" && (
        <KycPage onComplete={resolveOnboardingRoute} notify={notify} />
      )}
      {page === "agreement" && (
        <AgreementPage onContinue={handleAgreementComplete} notify={notify} />
      )}
      {page === "download" && <DownloadPage statuses={userStatuses} />}
      {page === "recurring-return" && (
        <RecurringReturnPage
          onContinue={resolveOnboardingRoute}
          notify={notify}
        />
      )}
      {page === "not-found" && (
        <NotFoundPage
          onHome={() =>
            authenticated ? resolveOnboardingRoute() : navigate("home", true)
          }
        />
      )}
      {/* {isHomePage && !authenticated && (
        <DiwaliBanner
          onOpenAccount={() =>
            navigate("login-idt", false, { source: bannerSource })
          }
        />
      )} */}
      {(page === "home" ||
        page === "home-idt" ||
        page === "home2" ||
        page === "home3" ||
        page === "idt-landing" ||
        page === "idt-landing-page") && <SiteFooter />}

      <AppToast toast={toast} onClose={closeToast} />
      {resolvingRoute && (
        <div className="position-fixed top-0 start-0 z-3 w-100 h-100 d-flex align-items-center justify-content-center bg-light bg-opacity-75">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Checking onboarding status</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default SiteApp;
