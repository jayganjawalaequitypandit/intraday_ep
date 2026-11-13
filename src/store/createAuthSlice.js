import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  mobileNumber: '',
  otpVia: 'text',
  authenticated: false,
  loginResponse: null,
}

export function createAuthSlice(name) {
  return createSlice({
    name,
    initialState,
    reducers: {
      setMobileNumber(state, action) {
        state.mobileNumber = action.payload
      },
      setOtpVia(state, action) {
        state.otpVia = action.payload
      },
      setCredentials(state, action) {
        state.user = action.payload.user
        state.token = action.payload.token
        if (Object.prototype.hasOwnProperty.call(action.payload, 'refreshToken')) {
          state.refreshToken = action.payload.refreshToken
        } else if (action.payload.token === null) {
          state.refreshToken = null
        }
        state.authenticated = Boolean(action.payload.token)
      },
      setTokens(state, action) {
        state.token = action.payload.token
        if (action.payload.refreshToken) state.refreshToken = action.payload.refreshToken
        state.authenticated = Boolean(action.payload.token)
      },
      setLoginResponse(state, action) {
        state.loginResponse = action.payload
      },
      updateUser(state, action) {
        state.user = { ...state.user, ...action.payload }
      },
      clearCredentials() {
        return { ...initialState }
      },
    },
  })
}
