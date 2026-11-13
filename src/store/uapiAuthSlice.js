import { createAuthSlice } from './createAuthSlice.js'

const uapiAuthSlice = createAuthSlice('uapiAuth')

export const {
  setMobileNumber: setUapiMobileNumber,
  setOtpVia: setUapiOtpVia,
  setCredentials: setUapiCredentials,
  setTokens: setUapiTokens,
  setLoginResponse: setUapiLoginResponse,
  updateUser: updateUapiUser,
  clearCredentials: clearUapiCredentials,
} = uapiAuthSlice.actions

export const selectUapiAuth = (state) => state.uapiAuth
export const selectUapiToken = (state) => state.uapiAuth.token
export const selectUapiRefreshToken = (state) => state.uapiAuth.refreshToken
export default uapiAuthSlice.reducer
