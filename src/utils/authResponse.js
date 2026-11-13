export function isValidMobileNumber(value) {
  return /^[1-9][0-9]{9}$/.test(String(value ?? ''))
}

export function assertSuccessfulResponse(response, fallbackMessage) {
  const candidates = [response, response?.data, response?.data?.data]
  const failedResponse = candidates.find((candidate) =>
    candidate && typeof candidate === 'object' && (
      candidate.success === false ||
      candidate.status === false ||
      String(candidate.status || '').toLowerCase() === 'error' ||
      String(candidate.status || '').toLowerCase() === 'failed'
    )
  )

  if (!failedResponse) return response

  throw new Error(
    failedResponse.message ||
    failedResponse.error?.message ||
    failedResponse.error ||
    fallbackMessage,
  )
}

export function extractAuthData(response) {
  const payload = response?.data?.data || response?.data || response || {}
  const responseData = response?.data || {}
  const user = payload.user || payload.userData || payload.profile || (
    payload.firstName || payload.name || payload.fullName || payload.email ? payload : null
  )
  const token = response?.data?.authentication?.token
    || response?.data?.authentication?.accessToken
    || response?.data?.authentication?.access_token
    || response?.data?.authentication?.jwtToken
    || response?.data?.authentication?.jwt
    || response?.data?.authentication?.authToken
    || payload.authentication?.token
    || payload.authentication?.accessToken
    || payload.authentication?.access_token
    || payload.authentication?.authToken
    || responseData.token
    || responseData.accessToken
    || responseData.access_token
    || responseData.jwtToken
    || responseData.jwt
    || responseData.authToken
    || responseData.authorization?.accessToken
    || payload.token
    || payload.accessToken
    || payload.access_token
    || payload.jwtToken
    || payload.jwt
    || payload.authToken
    || payload.authorization?.accessToken
    || payload.tokens?.access?.token
    || null
  const refreshToken = response?.data?.authentication?.refreshToken
    || response?.data?.authentication?.refresh_token
    || payload.authentication?.refreshToken
    || payload.authentication?.refresh_token
    || responseData.refreshToken
    || responseData.refresh_token
    || responseData.authorization?.refreshToken
    || payload.refreshToken
    || payload.refresh_token
    || payload.authorization?.refreshToken
    || payload.tokens?.refresh?.token
    || null

  return { user, token, refreshToken }
}

export function hasRequiredDetails(user) {
  const name = user?.firstName || user?.name || user?.fullName
  return Boolean(name && user?.email)
}

export function isNewOrIncompleteUser(response, user) {
  const candidates = [
    response,
    response?.data,
    response?.data?.data,
    response?.user,
    response?.data?.user,
    response?.data?.data?.user,
    user,
  ].filter((candidate) => candidate && typeof candidate === 'object')

  return candidates.some((candidate) =>
    candidate.isNewUser === true ||
    candidate.newUser === true ||
    candidate.isNew === true ||
    candidate.isRegistered === false ||
    candidate.profileComplete === false ||
    candidate.isProfileComplete === false ||
    candidate.registrationComplete === false
  ) || !hasRequiredDetails(user)
}

export function getUserName(user) {
  return user?.firstName || user?.name || user?.fullName || ''
}

export function getUserId(source) {
  if (!source || typeof source !== 'object') return ''

  const directId = source.id || source._id || source.userId || source.userID || source.user_id
  if (directId) return directId

  const nestedSources = [source.data, source.user, source.userData, source.profile, source.result, source.details]
  for (const nestedSource of nestedSources) {
    const nestedId = getUserId(nestedSource)
    if (nestedId) return nestedId
  }

  return ''
}

export function getSource() {
  return new URLSearchParams(window.location.search).get('sr')?.trim() || 'ITW'
}

export function createEapiRegistration(user, mobileNumber) {
  return {
    firstName: getUserName(user),
    email: user.email,
    countryCode: '+91',
    mobile: String(mobileNumber),
    source: "ITW",
  }
}
