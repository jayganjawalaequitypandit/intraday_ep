import { configureStore } from '@reduxjs/toolkit'
import eapiAuthReducer from './eapiAuthSlice.js'
import uapiAuthReducer from './uapiAuthSlice.js'

const sessionKeys = {
  uapiAuth: 'intraday-traders:uapi-auth',
  eapiAuth: 'intraday-traders:eapi-auth',
}

function readSession(key) {
  if (typeof window === 'undefined') return undefined

  try {
    const storedState = window.localStorage.getItem(key) || window.sessionStorage.getItem(key)
    if (storedState && !window.localStorage.getItem(key)) {
      window.localStorage.setItem(key, storedState)
      window.sessionStorage.removeItem(key)
    }
    return storedState ? JSON.parse(storedState) : undefined
  } catch {
    window.localStorage.removeItem(key)
    return undefined
  }
}

const preloadedState = {
  uapiAuth: readSession(sessionKeys.uapiAuth),
  eapiAuth: readSession(sessionKeys.eapiAuth),
}

export const store = configureStore({
  reducer: {
    uapiAuth: uapiAuthReducer,
    eapiAuth: eapiAuthReducer,
  },
  preloadedState,
})

if (typeof window !== 'undefined') {
  store.subscribe(() => {
    const { uapiAuth, eapiAuth } = store.getState()
    window.localStorage.setItem(sessionKeys.uapiAuth, JSON.stringify(uapiAuth))
    window.localStorage.setItem(sessionKeys.eapiAuth, JSON.stringify(eapiAuth))
  })
}

export default store
