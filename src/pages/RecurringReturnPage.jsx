import { useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import api from '../services/api.js'
import { selectEapiAuth } from '../store/eapiAuthSlice.js'
import { selectUapiAuth } from '../store/uapiAuthSlice.js'
import { getUserName } from '../utils/authResponse.js'
import { payloadOf } from '../utils/onboardingStatus.js'
import { trackMetaEvent } from '../utils/metaPixel.js'
import { ANALYTICS_EVENTS, trackAnalyticsEvent } from '../utils/analytics.js'

const failedPaymentStatuses = new Set([
  'CANCELLED',
  'CANCELED',
  'DECLINED',
  'EXPIRED',
  'FAILED',
  'FAILURE',
  'PAYMENT_FAILED',
  'REJECTED',
])

function findValue(source, keys) {
  if (!source || typeof source !== 'object') return ''
  for (const key of keys) {
    const value = source[key]
    if (value !== undefined && value !== null && String(value).trim()) return value
  }
  for (const value of Object.values(source)) {
    const match = findValue(value, keys)
    if (match !== '') return match
  }
  return ''
}

function findValueInSources(sources, keys) {
  for (const source of sources) {
    const value = findValue(source, keys)
    if (value !== '') return value
  }
  return ''
}

const displayValue = (value) => value === undefined || value === null || value === '' ? '—' : String(value)

function formatAmount(value) {
  if (value === undefined || value === null || value === '') return '—'
  const amount = Number(value)
  return Number.isFinite(amount) ? `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'
}

function formatDate(value) {
  if (!value) return '—'
  const parts = String(value).slice(0, 10).split('-')
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : String(value)
}

function RecurringReturnPage({ onContinue, notify }) {
  const uapiAuth = useSelector(selectUapiAuth)
  const eapiAuth = useSelector(selectEapiAuth)
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const redirectedRef = useRef(false)
  const failureTrackedRef = useRef(false)
  const subscriptionId = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('sid') || params.get('subscription_id') || params.get('subscriptionId') || params.get('cf_subscription_id') || ''
  }, [])

  useEffect(() => {
    let active = true
    if (!subscriptionId) {
      notify('error', 'Subscription ID is missing from the return URL')
      setLoading(false)
      return () => { active = false }
    }

    api.uapi.getCashfreeSubscription(subscriptionId)
      .then((response) => { if (active) setPayment(payloadOf(response) || {}) })
      .catch((error) => notify('error', error.message || 'Unable to load subscription details'))
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [notify, subscriptionId])

  const details = useMemo(() => {
    const uapiUser = uapiAuth.user || {}
    const eapiUser = eapiAuth.user || {}
    const planDetails = payment?.plan_details || payment?.planDetails || {}
    const authSources = [eapiUser, uapiUser, eapiAuth.loginResponse, uapiAuth.loginResponse]
    const firstName = findValueInSources(authSources, ['firstName', 'first_name', 'givenName', 'given_name'])
    const lastName = findValueInSources(authSources, ['lastName', 'last_name', 'familyName', 'family_name'])
    const fullName = getUserName(eapiUser)
      || getUserName(uapiUser)
      || findValueInSources(authSources, ['fullName', 'full_name', 'userName', 'user_name', 'name'])
      || [firstName, lastName].filter(Boolean).join(' ')
      || findValue(payment, ['customer_name', 'customerName'])
    const mobile = findValueInSources(authSources, ['mobile', 'mobileNumber', 'mobile_number', 'phone', 'phoneNumber', 'phone_number'])
      || findValue(payment, ['customer_phone', 'customerPhone', 'customer_mobile', 'customerMobile'])
    const email = findValueInSources(authSources, ['email', 'emailAddress', 'email_address'])
      || findValue(payment, ['customer_email', 'customerEmail'])

    return [
      { label: 'Subscription ID', value: findValue(payment, ['subscriptionId', 'subscription_id', 'cfSubscriptionId', 'cf_subscription_id']) || subscriptionId },
      { label: 'Name', value: fullName },
      { label: 'Mobile', value: mobile || uapiAuth.mobileNumber },
      { label: 'Email', value: email },
      { label: 'Plan', value: findValue(planDetails, ['plan_name', 'planName', 'name', 'plan_id', 'planId']) || findValue(payment, ['plan_name', 'planName', 'subscriptionPlan', 'planCode']) },
      { label: 'Next scheduled date', value: formatDate(findValue(planDetails, ['next_scheduled_date', 'nextScheduledDate', 'next_schedule_date', 'nextScheduleDate', 'next_payment_date', 'nextPaymentDate', 'subscription_next_charge_time']) || findValue(payment, ['next_scheduled_date', 'nextScheduledDate', 'next_schedule_date', 'nextScheduleDate', 'next_payment_date', 'nextPaymentDate', 'subscription_next_charge_time', 'endDate'])) },
    ]
  }, [eapiAuth.loginResponse, eapiAuth.user, payment, subscriptionId, uapiAuth.loginResponse, uapiAuth.mobileNumber, uapiAuth.user])

  const planDetails = payment?.plan_details || payment?.planDetails || {}
  const amount = findValue(planDetails, ['plan_recurring_amount', 'planRecurringAmount', 'recurring_amount', 'amount', 'price']) || findValue(payment, ['amount', 'paymentAmount', 'subscriptionAmount', 'price'])
  const planName = findValue(planDetails, ['plan_name', 'planName', 'name', 'plan_id', 'planId'])
  const subscriptionStatus = String(findValue(payment, ['subscription_status', 'subscriptionStatus'])).trim().toUpperCase()
  const isActive = !loading && subscriptionStatus === 'ACTIVE'
  const isPaymentFailed = !loading && failedPaymentStatuses.has(subscriptionStatus)
  const isFailed = !loading && subscriptionStatus !== 'ACTIVE'

  useEffect(() => {
    if (!isActive || redirectedRef.current) return

    redirectedRef.current = true
    const numericAmount = Number(amount)
    trackAnalyticsEvent(ANALYTICS_EVENTS.PAYMENT_SUCCESS, {
      value: Number.isFinite(numericAmount) ? numericAmount : 0,
      currency: 'INR',
    })
    trackMetaEvent('Purchase', {
      content_ids: [String(subscriptionId)],
      content_name: planName || 'Intraday Traders Subscription',
      content_type: 'product',
      value: Number.isFinite(numericAmount) ? numericAmount : 0,
      currency: 'INR',
    })
    notify('success', 'Subscription activated successfully')
    onContinue({ paymentComplete: true })
  }, [amount, isActive, notify, onContinue, planName, subscriptionId])

  useEffect(() => {
    if (!isPaymentFailed || failureTrackedRef.current) return

    failureTrackedRef.current = true
    const numericAmount = Number(amount)
    trackAnalyticsEvent(ANALYTICS_EVENTS.PAYMENT_FAILED, {
      value: Number.isFinite(numericAmount) ? numericAmount : 0,
      currency: 'INR',
    })
  }, [amount, isPaymentFailed])

  const heading = loading ? 'Checking subscription' : isActive ? 'Subscription activated' : isFailed ? 'Payment failed' : 'Subscription not activated'
  const message = loading
    ? 'Please wait while we check your payment status.'
    : isActive
      ? `Your payment of ${formatAmount(amount)} was successful.`
      : isFailed
        ? 'Your payment was not completed. Please try again.'
        : 'We could not confirm an active subscription. Please check your payment status.'

  return (
    <main className="container-fluid flex-grow-1 d-flex align-items-center py-5" id="main-content">
      <div className="row justify-content-center w-100 mx-0">
        <div className="col-12 col-md-8 col-lg-6">
          <section>
            <div className="text-center mb-4">
              <i className={`bi ${loading ? 'bi-hourglass-split text-secondary' : isActive ? 'bi-check-circle-fill text-success' : isFailed ? 'bi-x-circle-fill text-danger' : 'bi-exclamation-circle-fill text-warning'} display-5`} aria-hidden="true" />
              <h1 className="fs-2 fw-bold mt-3 mb-2">{heading}</h1>
              <p className="text-secondary mb-0">{message}</p>
              {isFailed && (
                <p className="text-secondary mt-3 mb-0">
                  If money was deducted from your account, please email{' '}
                  <a className="fw-bold" href="mailto:support@equitypandit.com">support@equitypandit.com</a>{' '}
                  or call us at <a className="fw-bold" href="tel:8000816688">8000 816 688</a>.
                </p>
              )}
            </div>
            <div className="border rounded-3 p-3 p-md-4 bg-white">
              {loading && <div className="text-center py-4"><div className="spinner-border text-warning" role="status"><span className="visually-hidden">Loading subscription details</span></div></div>}
              {!loading && <dl className="mb-0">{details.filter((item) => isActive || item.label !== 'Next scheduled date').map((item) => <div className="row g-2 mb-2" key={item.label}><dt className="col-5 fw-semibold">{item.label}</dt><dd className="col-7 mb-0 text-secondary text-break">{displayValue(item.value)}</dd></div>)}</dl>}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

export default RecurringReturnPage
