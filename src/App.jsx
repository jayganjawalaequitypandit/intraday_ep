import { useEffect, useMemo, useRef, useState } from 'react'
import { APP_STORE_URL, GOOGLE_PLAY_URL } from './constants/appLinks.js'

const accountStates = {
  new: { registered: false, kycComplete: false, agreementComplete: false, paymentComplete: false, subscriptionActive: false },
  existing: { registered: true, kycComplete: false, agreementComplete: false, paymentComplete: false, subscriptionActive: false },
  kycDone: { registered: true, kycComplete: true, agreementComplete: false, paymentComplete: false, subscriptionActive: false },
  complianceDone: { registered: true, kycComplete: true, agreementComplete: true, paymentComplete: false, subscriptionActive: false },
  paidPending: { registered: true, kycComplete: false, agreementComplete: false, paymentComplete: true, subscriptionActive: false },
  paidKycDone: { registered: true, kycComplete: true, agreementComplete: false, paymentComplete: true, subscriptionActive: false },
  active: { registered: true, kycComplete: true, agreementComplete: true, paymentComplete: true, subscriptionActive: true },
}

const stepNames = { 1: 'Account', 2: 'Plan', 3: 'KYC', 4: 'Agreement', 5: 'Payment', 6: 'Activate', 7: 'Download' }
const plans = [
  { name: 'Monthly', price: 2999, term: '30 days', note: 'Flexible monthly access' },
  { name: 'Quarterly', price: 7999, term: '90 days', note: 'Save 11%', popular: true },
  { name: 'Yearly', price: 24999, term: '365 days', note: 'Save 30%' },
]

function buildJourney(account) {
  if (!account) return [1]
  if (account.subscriptionActive) return [1, 7]
  const steps = [1]
  if (!account.paymentComplete) steps.push(2, 5)
  if (!account.kycComplete || !account.agreementComplete) {
    steps.push(6)
    if (!account.kycComplete) steps.push(3)
    if (!account.agreementComplete) steps.push(4)
  }
  steps.push(7)
  return steps
}

const money = (amount) => `₹${amount.toLocaleString('en-IN')}`

function Progress({ journey, step }) {
  const activeIndex = journey.indexOf(step)
  return (
    <>
      <div className="d-flex justify-content-between align-items-end mb-3">
        <div>
          <div className="fw-bold">Get started</div>
          <div className="small text-secondary">Step {activeIndex + 1} of {journey.length} · {stepNames[step]}</div>
        </div>
        <span className="badge rounded-pill bg-warning-subtle text-dark">{Math.round(((activeIndex + 1) / journey.length) * 100)}%</span>
      </div>
      <div className="progress" role="progressbar" aria-label="Onboarding progress" aria-valuenow={activeIndex + 1} aria-valuemin="1" aria-valuemax={journey.length}>
        <div className="progress-bar bg-warning" style={{ width: `${((activeIndex + 1) / journey.length) * 100}%` }} />
      </div>
      <div className="d-none d-md-flex justify-content-between mt-2 gap-2">
        {journey.map((item, index) => <span key={item} className={`small flex-fill text-center ${index === activeIndex ? 'fw-bold text-dark' : 'text-secondary'}`}>{stepNames[item]}</span>)}
      </div>
    </>
  )
}

function AccountStep({ onRoute }) {
  const [view, setView] = useState('mobile')
  const [mobile, setMobile] = useState('9876543210')
  const [demoState, setDemoState] = useState('existing')
  const [otp, setOtp] = useState(['4', '8', '1', '', '', ''])
  const otpRefs = useRef([])

  const sendOtp = () => setView('otp')
  const verifyOtp = () => {
    const account = { ...accountStates[demoState] }
    if (!account.registered) setView('profile')
    else onRoute(account, account.subscriptionActive)
  }

  const updateOtp = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...otp]
    next[index] = digit
    setOtp(next)
    if (digit && index < 5) otpRefs.current[index + 1]?.focus()
  }

  if (view === 'otp') return (
    <div>
      <button className="btn btn-link link-dark p-0 text-decoration-none mb-4" onClick={() => setView('mobile')}><i className="bi bi-arrow-left me-2" />Change number</button>
      <span className="badge rounded-pill text-bg-warning text-uppercase px-3 py-2">Secure verification</span>
      <h1 className="display-6 fw-bold mt-2">Enter the OTP</h1>
      <p className="text-secondary mb-4">We sent a 6-digit code to <strong>+91 {mobile.slice(0, 5)} {mobile.slice(5)}</strong>.</p>
      <div className="row g-2 mb-3" aria-label="One-time password">
        {otp.map((digit, index) => (
          <div className="col" key={index}><input ref={(element) => { otpRefs.current[index] = element }} className="form-control text-center fw-bold fs-5 px-1" inputMode="numeric" maxLength="1" value={digit} onChange={(event) => updateOtp(index, event.target.value)} onKeyDown={(event) => { if (event.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus() }} aria-label={`OTP digit ${index + 1}`} /></div>
        ))}
      </div>
      <div className="d-flex justify-content-between small mb-4">
        <span className="text-secondary">Code expires in <span>01:28</span></span>
        <button className="btn btn-link p-0 text-dark fw-semibold text-decoration-none">Resend OTP</button>
      </div>
      <button className="btn btn-warning fw-semibold w-100" onClick={verifyOtp}>Verify & continue <i className="bi bi-arrow-right ms-2" /></button>
    </div>
  )

  if (view === 'profile') return (
    <div>
      <span className="badge rounded-pill text-bg-warning text-uppercase px-3 py-2">One last detail</span>
      <h1 className="display-6 fw-bold mt-2">Complete your profile</h1>
      <p className="text-secondary mb-4">Use a provider or enter your details to continue.</p>
      <div className="row g-2 mb-3">
        <div className="col-md-6"><button className="btn btn-outline-dark w-100"><i className="bi bi-google me-2" />Google</button></div>
        <div className="col-6 col-md-3"><button className="btn btn-outline-dark w-100"><i className="bi bi-apple me-2" />Apple</button></div>
        <div className="col-6 col-md-3"><button className="btn btn-outline-dark w-100"><i className="bi bi-microsoft me-2" />Microsoft</button></div>
      </div>
      <div className="d-flex align-items-center gap-3 my-3"><hr className="flex-grow-1" /><span className="small text-secondary">or</span><hr className="flex-grow-1" /></div>
      <div className="row g-3 mb-4">
        <div className="col-md-6"><label className="form-label" htmlFor="fullName">Full name</label><input id="fullName" className="form-control" defaultValue="Priyank Rathod" /></div>
        <div className="col-md-6"><label className="form-label" htmlFor="email">Email address</label><input id="email" type="email" className="form-control" defaultValue="priyank@example.com" /></div>
      </div>
      <button className="btn btn-warning fw-semibold w-100" onClick={() => onRoute({ ...accountStates.new, registered: true }, false)}>Continue <i className="bi bi-arrow-right ms-2" /></button>
    </div>
  )

  return (
    <div>
      <span className="badge rounded-pill text-bg-warning text-uppercase px-3 py-2">Trade with clarity</span>
      <h1 className="display-6 fw-bold mt-2">Start with your mobile number</h1>
      <p className="text-secondary mb-4">We’ll check your account and take you only through the steps you need.</p>
      <label className="form-label" htmlFor="mobile">Mobile number</label>
      <div className="input-group mb-3">
        <span className="input-group-text bg-white">+91</span>
        <input id="mobile" className="form-control" inputMode="numeric" maxLength="10" value={mobile} onChange={(event) => setMobile(event.target.value.replace(/\D/g, ''))} placeholder="98765 43210" />
      </div>
      <details className="mb-4">
        <summary className="small text-secondary">Choose a demo account state</summary>
        <select className="form-select form-select-sm mt-2" value={demoState} onChange={(event) => setDemoState(event.target.value)}>
          <option value="new">New user</option>
          <option value="existing">Existing — KYC & agreement pending</option>
          <option value="kycDone">Existing — KYC done</option>
          <option value="complianceDone">Existing — KYC + agreement done</option>
          <option value="paidPending">Paid — KYC + agreement pending</option>
          <option value="paidKycDone">Paid — agreement pending</option>
          <option value="active">Existing — service active</option>
        </select>
      </details>
      <button className="btn btn-warning fw-semibold w-100" onClick={sendOtp} disabled={mobile.length !== 10}>Send OTP <i className="bi bi-arrow-right ms-2" /></button>
      <div className="d-flex align-items-center gap-2 text-secondary small mt-4"><i className="bi bi-shield-check text-success" /><span>Your information is encrypted and securely handled.</span></div>
    </div>
  )
}

function PlanStep({ selectedPlan, onSelect, onBack, onNext }) {
  return (
    <div>
      <span className="badge rounded-pill text-bg-warning text-uppercase px-3 py-2">Subscription</span>
      <h1 className="display-6 fw-bold mt-2">Choose a plan</h1>
      <p className="text-secondary mb-4">Get the same focused trading experience on the schedule that works for you.</p>
      <div className="row g-3 mb-4">
        {plans.map((plan) => (
          <div className="col-md-4" key={plan.name}>
            <button className={`btn text-start w-100 h-100 border rounded-4 p-3 ${selectedPlan.name === plan.name ? 'border-warning bg-warning-subtle shadow-sm' : 'bg-white'}`} onClick={() => onSelect(plan)} aria-pressed={selectedPlan.name === plan.name}>
              <span className="d-flex justify-content-between align-items-center gap-2">
                <strong>{plan.name}</strong>{plan.popular && <span className="badge text-bg-warning">POPULAR</span>}
              </span>
              <span className="fs-3 fw-bold d-block mt-3">{money(plan.price)}</span>
              <span className="text-secondary small">{plan.term} · {plan.note}</span>
            </button>
          </div>
        ))}
      </div>
      <Navigation onBack={onBack} onNext={onNext} />
    </div>
  )
}

function KycStep({ onBack, onComplete }) {
  return (
    <div>
      <span className="badge rounded-pill text-bg-warning text-uppercase px-3 py-2">Identity check</span>
      <h1 className="display-6 fw-bold mt-2">Complete KYC</h1>
      <p className="text-secondary mb-4">Confirm your identity to activate research services.</p>
      <div className="row g-3 mb-4">
        <div className="col-md-6"><label className="form-label" htmlFor="pan">PAN number</label><input id="pan" className="form-control text-uppercase" defaultValue="ABCDE1234F" /></div>
        <div className="col-md-6"><label className="form-label" htmlFor="dob">Date of birth</label><input id="dob" className="form-control" defaultValue="14 / 08 / 1992" /></div>
        <div className="col-md-8"><label className="form-label" htmlFor="address">Address</label><input id="address" className="form-control" defaultValue="14 Market Road" /></div>
        <div className="col-md-4"><label className="form-label" htmlFor="pincode">Pincode</label><input id="pincode" className="form-control" defaultValue="400001" /></div>
      </div>
      <Navigation onBack={onBack} onNext={onComplete} nextLabel="Verify KYC" />
    </div>
  )
}

function AgreementStep({ onBack, onComplete }) {
  const [agreement, setAgreement] = useState(false)
  const [esign, setEsign] = useState(false)
  return (
    <div>
      <span className="badge rounded-pill text-bg-warning text-uppercase px-3 py-2">Compliance</span>
      <h1 className="display-6 fw-bold mt-2">Review the agreement</h1>
      <p className="text-secondary mb-4">Read and accept the Research Services Agreement and MITC before activation.</p>
      <div className="border bg-light p-3 rounded-3 mb-3"><strong>Research Services Agreement & MITC</strong><p className="text-secondary small mb-0 mt-2">Review the service terms, risk disclosures and consent details before accepting.</p></div>
      <button className="btn btn-outline-dark w-100 mb-4"><i className="bi bi-file-earmark-text me-2" />View Agreement + MITC</button>
      <div className="form-check mb-3"><input className="form-check-input" id="agreement" type="checkbox" checked={agreement} onChange={(event) => setAgreement(event.target.checked)} /><label className="form-check-label" htmlFor="agreement">I agree to the Agreement & MITC.</label></div>
      <div className="form-check mb-4"><input className="form-check-input" id="esign" type="checkbox" checked={esign} onChange={(event) => setEsign(event.target.checked)} /><label className="form-check-label" htmlFor="esign">I agree to electronic acceptance.</label></div>
      <Navigation onBack={onBack} onNext={onComplete} nextLabel="Accept & continue" disabled={!agreement || !esign} />
    </div>
  )
}

function PaymentStep({ plan, onBack, onComplete }) {
  const [method, setMethod] = useState('UPI')
  return (
    <div>
      <span className="badge rounded-pill text-bg-warning text-uppercase px-3 py-2">Checkout</span>
      <h1 className="display-6 fw-bold mt-2">Complete payment</h1>
      <p className="text-secondary mb-4">Choose a payment method and review your order.</p>
      <div className="row g-4 mb-4">
        <div className="col-md-7">
          <div className="row g-2 mb-3">
            {['UPI', 'Card', 'Bank'].map((item) => <div className="col-4" key={item}><button className={`btn w-100 border py-3 ${method === item ? 'border-warning bg-warning-subtle' : 'btn-light'}`} onClick={() => setMethod(item)}><i className={`bi ${item === 'UPI' ? 'bi-qr-code' : item === 'Card' ? 'bi-credit-card' : 'bi-bank'} me-2`} /><span>{item}</span></button></div>)}
          </div>
          {method === 'UPI' && <><label className="form-label" htmlFor="upi">UPI ID</label><input id="upi" className="form-control" defaultValue="priyank@upi" /></>}
          {method === 'Card' && <><label className="form-label" htmlFor="card">Card number</label><input id="card" className="form-control mb-2" placeholder="•••• •••• •••• ••••" /><div className="row g-2"><div className="col-6"><input className="form-control" placeholder="MM / YY" aria-label="Expiry date" /></div><div className="col-6"><input className="form-control" placeholder="CVV" aria-label="CVV" /></div></div></>}
          {method === 'Bank' && <><label className="form-label" htmlFor="bank">Choose bank</label><select id="bank" className="form-select"><option>HDFC Bank</option><option>ICICI Bank</option><option>State Bank of India</option><option>Axis Bank</option></select></>}
        </div>
        <div className="col-md-5"><div className="bg-dark text-white p-4 rounded-4"><span className="small text-white-50">Selected plan</span><strong className="d-block mt-1">{plan.name} · {plan.term}</strong><hr /><div className="d-flex justify-content-between align-items-end"><span className="small text-white-50">Total</span><strong className="fs-4">{money(plan.price)}</strong></div></div></div>
      </div>
      <Navigation onBack={onBack} onNext={onComplete} nextLabel={`Pay ${money(plan.price)}`} />
    </div>
  )
}

function ActivateStep({ account, onBack, onNext }) {
  const pending = [!account.kycComplete && 'KYC', !account.agreementComplete && 'Agreement'].filter(Boolean)
  return (
    <div className="text-center">
      <div className="d-inline-flex align-items-center justify-content-center rounded-4 bg-success-subtle text-success fs-1 p-3 mb-4"><i className="bi bi-check-lg" /></div><br />
      <span className="badge rounded-pill text-bg-warning text-uppercase px-3 py-2">Payment successful</span>
      <h1 className="display-6 fw-bold mt-2">Finish account activation</h1>
      <p className="text-secondary mb-4">Complete the remaining one-time steps to start using the service.</p>
      <div className="border rounded-4 p-3 mb-4 text-start bg-light">
        {pending.length ? pending.map((item) => <div className="d-flex justify-content-between py-2" key={item}><strong>{item}</strong><span className="small text-secondary">Required</span></div>) : <div className="text-center fw-semibold">Ready to activate</div>}
      </div>
      <Navigation onBack={onBack} onNext={onNext} nextLabel="Continue activation" />
    </div>
  )
}

function DownloadStep({ returningActive }) {
  return (
    <div className="text-center">
      <div className="d-inline-flex align-items-center justify-content-center rounded-4 bg-success-subtle text-success fs-1 p-3 mb-4"><i className="bi bi-check-lg" /></div><br />
      <span className="badge rounded-pill text-bg-warning text-uppercase px-3 py-2">{returningActive ? 'Already active' : 'Service activated'}</span>
      <h1 className="display-6 fw-bold mt-2">{returningActive ? 'Your subscription is active' : 'Download the app'}</h1>
      <p className="text-secondary mb-4">Sign in with the same mobile number to start trading with clarity.</p>
      <div className="row g-3 justify-content-center">
        {[{ name: 'iPhone / iPad', icon: 'bi-apple', store: 'App Store', href: APP_STORE_URL }, { name: 'Android', icon: 'bi-android2', store: 'Google Play', href: GOOGLE_PLAY_URL }].map((item) => (
          <div className="col-md-6" key={item.name}><div className="border rounded-4 p-4 h-100"><i className={`bi ${item.icon} fs-2`} /><strong className="d-block mt-2 mb-3">{item.name}</strong><div className="ratio ratio-1x1 w-50 mx-auto mb-3 border border-warning border-5 rounded-4 bg-white" aria-label={`QR code placeholder for ${item.name}`}><div className="d-flex align-items-center justify-content-center"><i className="bi bi-qr-code display-3" /></div></div><a className="btn btn-dark" href={item.href} target="_blank" rel="noreferrer"><i className={`bi ${item.icon} me-2`} />Download on {item.store}</a></div></div>
        ))}
      </div>
    </div>
  )
}

function Navigation({ onBack, onNext, nextLabel = 'Continue', disabled = false }) {
  return <div className="d-flex gap-2"><button className="btn btn-outline-dark flex-fill" onClick={onBack}>Back</button><button className="btn btn-warning fw-semibold flex-fill" onClick={onNext} disabled={disabled}>{nextLabel}</button></div>
}

function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [account, setAccount] = useState(null)
  const [returningActive, setReturningActive] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(plans[1])
  const journey = useMemo(() => buildJourney(account), [account])

  useEffect(() => {
    const script = document.createElement('script')
    script.src = '/assets/digio.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const move = (direction) => {
    const index = journey.indexOf(step)
    const nextIndex = index + direction
    if (nextIndex >= 0 && nextIndex < journey.length) setStep(journey[nextIndex])
  }

  const routeAccount = (nextAccount, isActive) => {
    setAccount(nextAccount)
    setReturningActive(isActive)
    const nextJourney = buildJourney(nextAccount)
    setStep(nextJourney[1] || 7)
  }

  const completeFlag = (flag) => {
    const nextAccount = { ...account, [flag]: true }
    if (nextAccount.paymentComplete && nextAccount.kycComplete && nextAccount.agreementComplete) nextAccount.subscriptionActive = true
    const currentJourney = buildJourney(account)
    const currentIndex = currentJourney.indexOf(step)
    setAccount(nextAccount)
    const nextJourney = buildJourney(nextAccount)
    setStep(currentJourney[currentIndex + 1] && nextJourney.includes(currentJourney[currentIndex + 1]) ? currentJourney[currentIndex + 1] : nextJourney[Math.min(currentIndex, nextJourney.length - 1)] || 7)
  }

  return (
      <main className="container flex-grow-1 py-4 py-lg-5" id="main-content">
        <div className="row justify-content-center"><div className="col-12 col-lg-9 col-xl-8">
          <section className="bg-white border rounded-4 overflow-hidden shadow-lg" id="onboarding">
            <div className="p-4 border-bottom"><Progress journey={journey} step={step} /></div>
            <div className="p-4 p-md-5">
              {step === 1 && <AccountStep onRoute={routeAccount} />}
              {step === 2 && <PlanStep selectedPlan={selectedPlan} onSelect={setSelectedPlan} onBack={() => move(-1)} onNext={() => move(1)} />}
              {step === 3 && <KycStep onBack={() => move(-1)} onComplete={() => completeFlag('kycComplete')} />}
              {step === 4 && <AgreementStep onBack={() => move(-1)} onComplete={() => completeFlag('agreementComplete')} />}
              {step === 5 && <PaymentStep plan={selectedPlan} onBack={() => move(-1)} onComplete={() => completeFlag('paymentComplete')} />}
              {step === 6 && <ActivateStep account={account} onBack={() => move(-1)} onNext={() => move(1)} />}
              {step === 7 && <DownloadStep returningActive={returningActive} />}
            </div>
          </section>
        </div></div>
      </main>
  )
}

export default OnboardingPage
