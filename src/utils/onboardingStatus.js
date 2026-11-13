const completedValues = new Set([
  'active', 'accepted', 'approved', 'complete', 'completed', 'paid', 'signed',
  'subscribed', 'success', 'successful', 'verified',
])

export const payloadOf = (response) => response?.data?.data ?? response?.data ?? response ?? null

function valueIsComplete(value) {
  if (value === true || value === 1) return true
  return typeof value === 'string' && completedValues.has(value.trim().toLowerCase())
}

export function paymentIsComplete(response) {
  const data = payloadOf(response)
  const payment = data?.payment || data?.subscription || {}
  return [
    payment.subscriptionStatus,
    payment.status,
    payment.isPaid,
    data?.paymentComplete,
    data?.isPaymentComplete,
    data?.isPaymentCompleted,
    data?.paymentStatus,
    data?.subscriptionStatus,
    data?.isPaid,
  ].some(valueIsComplete)
}

export function agreementIsComplete(response) {
  const data = payloadOf(response)
  const agreement = data?.agreement || data?.raAgreement || data?.researchAgreement || {}
  return [
    agreement.status,
    agreement.agreementStatus,
    agreement.isSigned,
    data?.agreementComplete,
    data?.isAgreementComplete,
    data?.isAgreementCompleted,
    data?.agreementStatus,
    data?.isSigned,
    data?.signed,
  ].some(valueIsComplete)
}

export function kycIsComplete(response) {
  const data = payloadOf(response)
  if (Array.isArray(data)) return data.length > 0
  return Boolean(data && typeof data === 'object' && Object.keys(data).length > 0)
}
