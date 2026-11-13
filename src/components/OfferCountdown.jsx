import { useEffect, useState } from 'react'
import loginOfferBackground from '../assets/login-offer-background.png'

const OFFER_DURATION_MS = 1 * 60 * 60 * 1000
const OFFER_END_STORAGE_KEY = 'intradayOfferEndsAt'

function getOfferEndTime() {
  const storedEndTime = Number(window.localStorage.getItem(OFFER_END_STORAGE_KEY))
  if (Number.isFinite(storedEndTime) && storedEndTime > Date.now()) return storedEndTime

  const endTime = Date.now() + OFFER_DURATION_MS
  window.localStorage.setItem(OFFER_END_STORAGE_KEY, String(endTime))
  return endTime
}

function OfferCountdown({ contained = false, flush = false, label, stacked = false }) {
  const [offerEndTime, setOfferEndTime] = useState(getOfferEndTime)
  const [remainingTime, setRemainingTime] = useState(() => Math.max(offerEndTime - Date.now(), 0))

  useEffect(() => {
    const timer = window.setInterval(() => {
      const nextRemainingTime = offerEndTime - Date.now()

      if (nextRemainingTime <= 0) {
        const nextOfferEndTime = Date.now() + OFFER_DURATION_MS
        window.localStorage.setItem(OFFER_END_STORAGE_KEY, String(nextOfferEndTime))
        setOfferEndTime(nextOfferEndTime)
        setRemainingTime(OFFER_DURATION_MS)
        return
      }

      setRemainingTime(nextRemainingTime)
    }, 1000)

    return () => window.clearInterval(timer)
  }, [offerEndTime])

  const totalSeconds = Math.floor(remainingTime / 1000)
  const countdown = [
    { label: 'h : ', value: Math.floor(totalSeconds / 3600) },
    { label: 'm : ', value: Math.floor((totalSeconds % 3600) / 60) },
    { label: 's', value: totalSeconds % 60 },
  ]

  return (
    <div
      className={`${flush ? 'rounded-top-4' : contained ? 'rounded-4' : 'rounded-bottom-4'} text-center mb-2`}
      // style={{
      //   backgroundImage: `url(${loginOfferBackground})`,
      //   backgroundPosition: 'center',
      //   backgroundSize: 'cover',
      //   marginInline: contained || flush ? 0 : '-1.5rem',
      //   marginBottom: contained || flush ? 0 : '-1.5rem',
      // }}
      role="timer"
      aria-label="Limited time offer countdown"
    >
      <div className="d-flex align-items-center fst-italic justify-content-center gap-2 flex-nowrap">
      <span className="small fst-italic">
        <small>{label || "Login To Check Available Offer"}</small>
      </span>
      <span className="small">
        {countdown.map((unit) => (
          <span className="text-danger" key={unit.label}>
              {String(unit.value).padStart(2, '0')}<span>{unit.label}</span>
           </span>
          // <span className="bg-white rounded-2 shadow-sm px-2 py-1" key={unit.label} style={{ minWidth: '46px' }}>
          //   <strong className="d-block fs-5 lh-1" style={{ color: '#FA5B05' }}>
          //     {String(unit.value).padStart(2, '0')}
          //   </strong>
          //   <small className="d-block text-secondary mt-1" style={{ fontSize: '.6rem' }}>{unit.label}</small>
          // </span>
        ))}
      </span>
      </div>
    </div>
  )
}

export default OfferCountdown
