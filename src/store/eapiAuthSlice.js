import { createAuthSlice } from './createAuthSlice.js'

const eapiAuthSlice = createAuthSlice('eapiAuth')

export const {
  setMobileNumber: setEapiMobileNumber,
  setCredentials: setEapiCredentials,
  setTokens: setEapiTokens,
  setLoginResponse: setEapiLoginResponse,
  updateUser: updateEapiUser,
  clearCredentials: clearEapiCredentials,
} = eapiAuthSlice.actions

export const selectEapiAuth = (state) => state.eapiAuth
export const selectEapiToken = (state) => state.eapiAuth.token
export const selectEapiRefreshToken = (state) => state.eapiAuth.refreshToken
export default eapiAuthSlice.reducer
