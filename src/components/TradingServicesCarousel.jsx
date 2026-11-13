import { useEffect, useState } from 'react'
import loginOfferBackground from '../assets/login-offer-background.png'

const TRADING_SERVICES = [
  'Live Options Recommendations',
  'Cash Intraday Trades',
  'Stock Futures Intraday Trades',
]

function TradingServicesCarousel({ promotional = false }) {
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % TRADING_SERVICES.length)
    }, 2500)

    return () => window.clearInterval(timer)
  }, [])

  return (
    <div
      className={promotional ? 'p-3' : 'mb-4'}
      // style={promotional ? {
      //   backgroundImage: `url(${loginOfferBackground})`,
      //   backgroundPosition: 'center',
      //   backgroundRepeat: 'no-repeat',
      //   backgroundSize: 'cover',
      // } : undefined}
      aria-label="Trading services"
    >
      <div className="carousel slide" aria-live="polite">
        <div className="carousel-inner py-1">
          {TRADING_SERVICES.map((service, index) => (
            <div
              className={`carousel-item ${index === activeSlide ? 'active' : ''}`}
              key={service}
              aria-hidden={index !== activeSlide}
            >
              <div className="trading-services-copy text-center overflow-hidden">
                <strong className="d-block fs-5 lh-sm" style={{ color: '#FA5B05' }}>{service}</strong>
                {/* <span className="d-block text-secondary-300 mt-1">SEBI Registered Research Analyst</span> */}
              </div>
            </div>
          ))}
        </div>

        <div className="d-flex justify-content-center gap-2 mt-2" aria-label="Choose a trading service">
          {TRADING_SERVICES.map((service, index) => (
            <button
              className="border-0 p-0"
              style={{
                width: '28px',
                height: '4px',
                borderRadius: '4px',
                backgroundColor: index === activeSlide ? '#FA5B05' : '#dee2e6',
              }}
              type="button"
              key={service}
              onClick={() => setActiveSlide(index)}
              aria-label={`Show ${service}`}
              aria-current={index === activeSlide ? 'true' : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default TradingServicesCarousel
