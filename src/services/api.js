import axios from 'axios'
import store from '../store/index.js'
import { clearEapiCredentials, selectEapiRefreshToken, selectEapiToken, setEapiTokens } from '../store/eapiAuthSlice.js'
import { clearUapiCredentials, selectUapiRefreshToken, selectUapiToken, setUapiTokens } from '../store/uapiAuthSlice.js'
import { extractAuthData } from '../utils/authResponse.js'

const services = {
  uapi: {
    baseUrl: import.meta.env.VITE_UAPI_BASE_URL,
    selectToken: selectUapiToken,
    selectRefreshToken: selectUapiRefreshToken,
    setTokens: setUapiTokens,
  },
  uapiServe: {
    baseUrl: import.meta.env.VITE_UAPI_SERVE_BASE_URL,
    selectToken: selectUapiToken,
    selectRefreshToken: selectUapiRefreshToken,
    setTokens: setUapiTokens,
  },
  eapi: {
    baseUrl: import.meta.env.VITE_EAPI_BASE_URL,
    selectToken: selectEapiToken,
    selectRefreshToken: selectEapiRefreshToken,
    setTokens: setEapiTokens,
  },
  cmots: {
    baseUrl: import.meta.env.VITE_CMOTS_API_BASE_URL,
  },
}

const refreshRequests = { uapi: null, uapiServe: null, eapi: null }

function isJwtExpired(token) {
  try {
    const encodedPayload = String(token).replace(/^Bearer\s+/i, '').split('.')[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/')
    const paddedPayload = encodedPayload.padEnd(Math.ceil(encodedPayload.length / 4) * 4, '=')
    const payload = JSON.parse(atob(paddedPayload))
    return typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now()
  } catch {
    return false
  }
}

function clearAuthentication() {
  store.dispatch(clearUapiCredentials())
  store.dispatch(clearEapiCredentials())
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.assign('/login')
  }
}

function normalizeError(error) {
  if (!axios.isAxiosError(error)) return error
  const data = error.response?.data
  const normalized = new Error(
    data?.message || data?.error || error.message || `API request failed with status ${error.response?.status}`,
  )
  normalized.status = error.response?.status
  normalized.data = data
  normalized.cause = error
  return normalized
}

async function refreshAccessToken(serviceName) {
  if (refreshRequests[serviceName]) return refreshRequests[serviceName]

  const service = services[serviceName]
  const refreshToken = service.selectRefreshToken(store.getState())
  if (!refreshToken) {
    clearAuthentication()
    throw new Error('Authentication session has expired. Please log in again.')
  }

  refreshRequests[serviceName] = axios.post(
    new URL('users/generate-access-token', service.baseUrl).toString(),
    { refreshToken },
    { headers: { 'Content-Type': 'application/json', source: 'ITW' } },
  ).then((response) => {
    const refreshedAuth = extractAuthData(response)
    if (!refreshedAuth.token) throw new Error('Token refresh response did not contain an auth token.')

    store.dispatch(service.setTokens({
      token: refreshedAuth.token,
      refreshToken: refreshedAuth.refreshToken || refreshToken,
    }))
    return refreshedAuth.token
  }).catch((error) => {
    clearAuthentication()
    throw normalizeError(error)
  }).finally(() => {
    refreshRequests[serviceName] = null
  })

  return refreshRequests[serviceName]
}

function createApiClient(serviceName) {
  const service = services[serviceName]
  if (!service.baseUrl) throw new Error(`Missing API base URL for ${serviceName}`)
  const client = axios.create({ baseURL: service.baseUrl })

  client.interceptors.request.use(async (config) => {
    config.headers.set('source', 'ITW')
    if (!config.skipAuth) {
      let token = service.selectToken(store.getState())
      if (token && isJwtExpired(token) && service.selectRefreshToken(store.getState())) {
        token = await refreshAccessToken(serviceName)
      }
      if (token) config.headers.set('Authorization', String(token).replace(/^Bearer\s+/i, ''))
    }
    return config
  })

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config
      if (
        error.response?.status !== 401 ||
        !originalRequest ||
        originalRequest.skipAuth ||
        originalRequest.retryAfterRefresh
      ) {
        throw normalizeError(error)
      }

      originalRequest.retryAfterRefresh = true
      const token = await refreshAccessToken(serviceName)
      originalRequest.headers.set('Authorization', String(token).replace(/^Bearer\s+/i, ''))
      return client(originalRequest)
    },
  )

  return client
}

const clients = {
  uapi: createApiClient('uapi'),
  uapiServe: createApiClient('uapiServe'),
  eapi: createApiClient('eapi'),
  cmots: createApiClient('cmots'),
}

async function request(serviceName, path, options = {}) {
  const { auth = true, body, ...axiosOptions } = options
  const response = await clients[serviceName].request({
    url: path,
    ...axiosOptions,
    data: body,
    skipAuth: !auth,
  })
  return response.data
}

const api = {
  uapi: {
    request: (path, options) => request('uapi', path, options),
    getConfig: () => request('uapi', '/config', { method: 'GET', auth: false }),
    getLiveOptionCalls: () => request('uapi', '/options/calls', { method: 'GET' }),
    getMarketPulse: () => request('uapi', '/users/market-pulse'),
    getUserDashboard: () => request('uapi', '/users/dashboard'),
    getNotificationSettings: (fcmToken) =>
      request('uapi', '/users/firebase-token/notifications', {
        params: { fcmToken },
      }),
    logout: (fcmToken) =>
      request('uapi', '/users/logout', {
        method: 'GET',
        params: fcmToken ? { fcmToken } : undefined,
      }),
    updateNotificationSettings: (payload) =>
      request('uapi', '/users/firebase-token/notifications', {
        method: 'PATCH',
        body: payload,
      }),
    submitPositionVote: (vote) =>
      request('uapi', '/position-votes', { method: 'POST', body: { vote } }),
    getPositionVotes: (positionDate) =>
      request('uapi', '/position-votes', {
        params: positionDate ? { positionDate } : undefined,
      }),
    getIntradaySignals: ({ perPage = 25, currentPage = 1, signalType = 'bullish', signal } = {}) =>
      request('uapi', '/premiums/intraday-signals', {
        params: { perPage, currentPage, signalType },
        signal,
      }),
    getStockFutureIntradaySignals: ({ perPage = 25, currentPage = 1, signalType = 'bullish', signal } = {}) =>
      request('uapi', '/premiums/intraday-signals-stock-future', {
        params: { perPage, currentPage, signalType },
        signal,
      }),
    createSupportRequest: (payload) =>
      request('uapi', '/requests', { method: 'POST', body: payload }),
    login: (payload) => request('uapi', '/users/login', { method: 'POST', body: payload, auth: false }),
    verifyOtp: (payload) => request('uapi', '/users/otp-verify', { method: 'POST', body: payload, auth: false }),
    resendOtp: (payload) => request('uapi', '/users/resend-otp', { method: 'POST', body: payload, auth: false }),
    getSubscriptions: () => request('uapi', '/subscriptions?isIDTRegularOffer=true'),
    getMySubscription: () => request('uapi', '/subscriptions/my-subscriptions'),
    cancelSubscription: (subscriptionId) => {
      const id = String(subscriptionId || '').trim()
      if (!id) throw new Error('Subscription ID is required')
      return request('uapi', `/subscriptions/${encodeURIComponent(id)}/cancel`, { method: 'GET' })
    },
    checkAgreementStatus: () => request('uapi', '/users/check-status'),
    requestSignDocument: () => request('uapi', '/e-sign/sign-document', { method: 'GET' }),
    updateSignedDocumentStatus: (documentId, payload) => {
      const id = String(documentId || '').trim()
      if (!id) throw new Error('Digio document ID is required')
      return request('uapi', `/e-sign/update-document/${encodeURIComponent(id)}`, { method: 'POST', body: payload })
    },
    initializeCashfreePayment: (payload) => request('uapi', '/cashfree/pay-init', { method: 'POST', body: payload }),
    initializeCashfreeRecurringPayment: (payload) => request('uapi', '/cashfree/recurring-pay-init', { method: 'POST', body: payload }),
    getCashfreeSubscription: (subscriptionId) => {
      const id = String(subscriptionId || '').trim()
      if (!id) throw new Error('Subscription ID is required')
      return request('uapi', `/cashfree/subscription/${encodeURIComponent(id)}`)
    },
    updateById: (userId, payload) => {
      const id = String(userId || '').trim()
      if (!id) throw new Error('User ID is required for profile update')
      return request('uapi', `/users/number/${encodeURIComponent(id)}`, { method: 'PUT', body: payload })
    },
    storeFCMtoken: (payload) => request('uapi', '/users/firebase-topics', { method: 'POST', body: payload }),
  },
  uapiServe: {
    request: (path, options) => request('uapiServe', path, options),
    getMarketLive: () => request('uapiServe', '/explore/market-live'),
    getFiiDiiActivity: () => request('uapiServe', '/explore/fii-dii-activity'),
    getMarketPredictions: (coCode, options = {}) => {
      const id = String(coCode || '').trim()
      if (!id) throw new Error('Company code is required for market predictions')
      return request('uapiServe', `/market-predictions/${encodeURIComponent(id)}`, options)
    },
  },
  eapi: {
    request: (path, options) => request('eapi', path, options),
    register: (payload) => request('eapi', '/users/register', { method: 'POST', body: payload, auth: false }),
    getKycByUserId: (userId) => {
      const id = String(userId || '').trim()
      if (!id) throw new Error('EP user ID is required to check KYC status')
      return request('eapi', `/kyc/get-by-userId/${encodeURIComponent(id)}`)
    },
    sendKycOtp: (payload) => request('eapi', '/kyc/send-otp', { method: 'POST', body: payload }),
    verifyKycOtp: (payload) => request('eapi', '/kyc/verify-otp', { method: 'POST', body: payload }),
    fetchKyc: (payload) => request('eapi', '/kyc/fetch', { method: 'POST', body: payload }),
    saveKyc: (payload) => request('eapi', '/kyc', { method: 'POST', body: payload }),
  },
  cmots: {
    request: (path, options = {}) => request('cmots', path, { ...options, auth: false }),
    getIndices: () => request('cmots', '/Indices/', { auth: false }),
    getGiftNifty: () => request('cmots', '/LatestValue-GIFT-Nifty', { auth: false }),
    getPriceChartData: (coCode, exchange, options = {}) => {
      const id = String(coCode || '').trim()
      if (!id) throw new Error('Company code is required for price chart data')
      const market = String(exchange || '').trim().toLowerCase()
      if (!['nse', 'bse'].includes(market)) {
        throw new Error('Exchange must be NSE or BSE for price chart data')
      }
      return request('cmots', `/PricechartData/i/${encodeURIComponent(id)}/${market}/d/1`, {
        ...options,
        auth: false,
      })
    },
  },
}

export default api
export { request }
