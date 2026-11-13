# Intraday Traders

A React website for the Intraday Traders service. It contains public marketing pages and the customer onboarding flow for account registration, subscription purchase, KYC, agreement signing, and app download.

## What the application does

The active app is a single-page React application. It serves public landing pages and guides signed-in customers through the steps required to activate a subscription. Account and transaction state comes from the backend APIs; the browser app uses those statuses to decide which page the customer should see next.

The repository also contains an older, self-contained onboarding demo in `src/App.jsx`. The active entry point (`src/main.jsx`) mounts `src/SiteApp.jsx`, so `src/App.jsx` is not part of the current application flow.

## Technology

- React 19 and JSX
- Vite 7 for development and production builds
- Redux Toolkit and React Redux for authentication state
- Axios for backend API requests
- Bootstrap 5 and Bootstrap Icons for layout and UI
- Firebase Cloud Messaging for web push notifications
- Google OAuth for profile details
- Cashfree for payments and subscriptions
- Digio for service agreement e-signing
- Meta Pixel for marketing and conversion events

## Run locally

### Requirements

Install a current Node.js release and npm. This repository also has pnpm workspace and lock files; use the package manager agreed on by your team so dependency versions stay consistent.

### Install and start

```bash
npm install
npm run dev
```

Vite prints a local URL in the terminal. The development server listens on network interfaces (`host: true`), so it may also be reachable from another device on the same network.

### Build and preview

```bash
npm run build
npm run preview
```

`build` creates the production site in `dist/`; `preview` serves that built output locally. There is no test or lint command currently defined in `package.json`.

## Environment configuration

Create a local `.env` from `.env.example` and fill in values provided by the team. Do not commit `.env` or paste credentials into source files. Restart Vite after changing environment values.

| Variable | Purpose |
| --- | --- |
| `VITE_APP_ENV` | Set to `live` for production SEO indexing behavior; other values build the app as non-indexable. |
| `VITE_SITE_URL` | Canonical website origin used for SEO metadata and generated sitemap URLs. |
| `VITE_UAPI_BASE_URL` | Base URL for the UAPI account and subscription backend. |
| `VITE_EAPI_BASE_URL` | Base URL for the EAPI profile/KYC backend. |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID used by the profile form. |
| `DIGIO_ENV` | Digio signing environment; defaults to `sandbox` in Vite configuration. |
| `CASHFREE_ENV` | Cashfree SDK environment; defaults to `sandbox` in Vite configuration. |
| `VITE_FIREBASE_API_KEY` | Firebase web app API key. |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase authentication domain. |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID. |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket. |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID. |
| `VITE_FIREBASE_APP_ID` | Firebase web app ID. |
| `VITE_FIREBASE_VAPID_KEY` | Web Push VAPID key used to request an FCM token. |

Vite exposes variables prefixed with `VITE_` to browser code. Treat them as public configuration, not as a place for backend secrets. The payment and signing environments are passed into the client SDKs through Vite's `define` settings in `vite.config.js`.

## Application entry and routing

`src/main.jsx` loads global styles and providers, then mounts `SiteApp`. `SiteApp` implements routing with the browser History API and a path-to-page map; it does not use React Router. Route transitions use `pushState` or `replaceState`, and a `popstate` listener handles browser back/forward navigation.

| URL | Page / purpose |
| --- | --- |
| `/` | Main marketing homepage |
| `/home-idt` | Alternate marketing and OTP entry page |
| `/home2` | Trading combo marketing page |
| `/idt-home` | Landing page with service details and FAQ |
| `/login-idt`, `/idt-login` | OTP login entry variants |
| `/login` | Legacy login URL; redirects to `/login-idt` |
| `/verify-otp`, `/verify-otp-idt` | OTP verification variants |
| `/details` | New or incomplete customer profile form |
| `/profile` | Customer profile |
| `/services` | Subscription selection and payment |
| `/pricing` | Legacy alias; redirects to `/services` |
| `/kyc` | Customer identity verification |
| `/agreement` | Service agreement e-signing |
| `/download` | App download links |
| `/recurring-return-url` | Cashfree recurring subscription return/status page |

The `home1` rendering branch exists in `SiteApp`, but there is no `home1` path in its route map, so it is not directly addressable through the current URL router.

## Customer onboarding flow

`SiteApp` is the coordinator. On authenticated entry or access to a protected page, it checks the account state and routes the customer to the next required step:

1. **Login:** enter a mobile number and request a one-time password using UAPI.
2. **OTP verification:** verify the code with UAPI. The page may also register or authenticate the customer with EAPI.
3. **Profile details:** collect name, email, and state when required. Save the profile in UAPI, then register it with EAPI. Google profile details can be used to fill the form.
4. **Subscription:** load available plans and current payment/agreement/KYC status. Cashfree checkout handles one-time and recurring subscription payments.
5. **KYC:** EAPI checks existing KYC, requests/verifies a KYC OTP, or fetches/saves details for manual completion.
6. **Agreement:** request a signing document from UAPI, open Digio, and report the signing result back to UAPI.
7. **Download:** once required statuses are complete, show App Store and Google Play links.

The order depends on backend status. `resolveOnboardingRoute` in `src/SiteApp.jsx` checks payment first, then KYC, then agreement, and finally routes to download. Status response parsing lives in `src/utils/onboardingStatus.js`.

The recurring return page reads a subscription ID from the query string, fetches its status from UAPI, and continues onboarding when Cashfree reports the subscription as active.

## Source map

```text
src/
  main.jsx                 React entry point and global providers
  SiteApp.jsx              Active route handling, SEO, access checks, onboarding routing
  services/api.js          UAPI/EAPI Axios clients and endpoint wrappers
  store/                   Redux auth slices and persisted store
  utils/                   Auth response normalization, onboarding status, analytics helpers
  pages/                   Route-level screens and marketing page variants
  components/              Shared header, footer, layouts, toast, carousel, and UI sections
  firebase.js              Firebase app and messaging initialization
  notificationService.js   Browser push permission, FCM token, and foreground listener
  styles.css               Global application styles
public/
  assets/                  Static SDK assets and marketing images
  images/                  Page and login images
  firebase-messaging-sw.js Firebase background notification service worker
  robots.txt               Static crawler instructions
```

### Important files

- `src/SiteApp.jsx`: route table, SEO metadata, route protection, onboarding status checks, page composition.
- `src/services/api.js`: backend URLs, auth headers, token refresh, and named endpoint methods.
- `src/store/createAuthSlice.js`: shared shape and reducers used by both auth slices.
- `src/store/index.js`: Redux setup and browser local-storage persistence.
- `src/utils/authResponse.js`: extracts auth tokens/user data from backend responses and constructs registration payloads.
- `src/utils/onboardingStatus.js`: determines whether payment/agreement/KYC status responses count as complete.
- `src/pages/ServiceListPage.jsx`: service selection and Cashfree payment flow.
- `src/pages/KycPage.jsx`: KYC checks and completion paths.
- `src/pages/AgreementPage.jsx`: Digio flow and agreement status update.
- `src/pages/RecurringReturnPage.jsx`: recurring payment return handling.
- `src/App.jsx`: standalone onboarding prototype, not mounted by the current entry point.

## Authentication and API state

The Redux store keeps separate auth records for UAPI and EAPI. Each record contains a user, access token, refresh token, mobile number, and login response. The store saves these records in browser `localStorage` under `intraday-traders:uapi-auth` and `intraday-traders:eapi-auth`.

`src/services/api.js` creates one Axios client per backend. Requests include the `source: ITW` header. Authenticated requests receive a bearer access token; expired tokens are refreshed through `users/generate-access-token`, and a 401 response is retried once after refresh. If refresh fails, both auth records are cleared and the browser is sent to `/login` (which the app maps to `/login-idt`).

The backend owns authoritative customer, payment, KYC, and agreement state. Avoid treating a frontend page transition as proof that an operation completed; the application should confirm state through its backend status endpoints.

## External integrations

- **Cashfree:** the browser SDK is initialized in the subscription pages. The backend creates payment or subscription sessions; the frontend opens checkout and the return route verifies subscription status.
- **Digio:** the agreement page asks UAPI for signing details, launches `/assets/digio.js`, and posts the callback status back to UAPI.
- **Firebase Cloud Messaging:** authenticated sessions request browser notification permission, register the service worker, obtain an FCM token, and submit it to UAPI. Foreground messages are received in `src/notificationService.js`; background messages are handled in `public/firebase-messaging-sw.js`.
- **Google OAuth:** used on the profile details form to populate name and email.
- **Meta Pixel:** base page tracking is initialized in `index.html`; conversion events are sent from relevant onboarding pages via `src/utils/metaPixel.js`.

## SEO and static assets

`index.html` supplies the default SEO metadata, social tags, organization/service structured data, and Meta Pixel bootstrap. `SiteApp.jsx` updates page title, description, canonical URL, robots directives, and (for `/idt-home`) structured data as routes change.

During a Vite build, `vite.config.js` replaces the robots directive and writes `dist/sitemap.xml`. The generated sitemap currently includes `/` and `/idt-home`. The committed `public/robots.txt` points crawlers to the production sitemap.

## Making changes

- For a new page, add the component under `src/pages/`, add its URL to `pagePaths` and metadata to `pageSeo` in `SiteApp.jsx`, then add the rendering branch and any needed access behavior.
- For a backend operation, add a named wrapper in `src/services/api.js` and use it from the relevant page. Keep UAPI and EAPI auth contexts distinct.
- For onboarding changes, review `resolveOnboardingRoute` and the status parsers together with the page that performs the operation.
- For shared visual elements, check `src/components/` before adding duplicate markup.
- For build-time or environment behavior, review `.env.example` and `vite.config.js` together.

## Known points to verify with the team

- `public/firebase-messaging-sw.js` currently contains environment-specific Firebase configuration, while `src/firebase.js` reads Firebase configuration from `.env`. Confirm the intended stage/live setup before changing push notifications.
- `src/notificationService.js` has a TODO comment about sending the FCM token to the backend, and then currently does submit it through `api.uapi.storeFCMtoken`. The TODO appears outdated.
- `src/pages/PricingPage.jsx` and `src/pages/ServiceListPage.jsx` have overlapping plan-selection and payment responsibilities; confirm which one is intended for future work. The active `/pricing` route redirects to `/services`.
- The repository includes both npm and pnpm lock/workspace files. Align on one package manager to avoid dependency drift.
- `src/App.jsx` contains demo values and placeholder interactions; it is not the app currently mounted by `src/main.jsx`.

## Static app links

The app download URLs are centralized in `src/constants/appLinks.js`.
