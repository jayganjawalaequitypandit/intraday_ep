import './HomeSections.css'
import phonePreview from '../assets/intraday-pro-phone-orange.png'

export function HeroSection({ onGetStarted, showFeatures }) {
  return <section className="overflow-hidden py-4 py-lg-5 bg-primary" style={{ backgroundImage: "url('/assets/hero-bg.svg')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
    <div className="container">
      <div className="row align-items-center g-4 g-xl-5">
        <div className="col-12 col-lg-6">
          <p className="d-inline-flex align-items-center gap-2 small border rounded-pill mt-3 px-3 py-1 text-warning-emphasis">
            <i aria-hidden="true" className="fa-solid fa-circle fa-2xs flex-shrink-0" />
            Clarity for every trade
          </p>
          <h1 className="display-4 fw-semibold">Trade smarter. <span className="text-warning-emphasis">See</span> the bigger picture.</h1>
          <p className="text-secondary mb-4">Live market recommendations and daily trading signals from experienced research analysts — across Index &amp; Stock Options, Cash Intraday and Stock Futures.</p>
          <div className="d-flex flex-wrap gap-3 mb-4"><button className="btn btn-warning fw-semibold px-4 py-3" onClick={onGetStarted}>Get started <i className="fa-solid fa-arrow-right ms-2" /></button><button className="btn btn-light border px-4 py-3" onClick={showFeatures}>See how it works</button></div>
          <p className="small text-secondary mt-3 mb-0">SEBI Registered Research Analyst · INH000029829</p>
        </div>
        <div className="col-12 col-lg-6 d-flex align-items-center justify-content-center">
          <img src={phonePreview} className="hero-phone-preview img-fluid object-fit-contain d-block mx-auto" alt="Intraday PRO mobile app preview" fetchPriority="high" />
        </div>
      </div></div>
  </section>
}

export function KnowTradeSection() {
  return <section className="bg-body-tertiary bg-gradient py-5"><div className="container py-lg-3"><div className="row align-items-center g-5">
    <div className="col-12 col-lg-6">
      <p className="small text-uppercase text-warning-emphasis fw-semibold">Know before you trade</p>
      <h2 className="h2 fw-semibold">Know the trade. Know the risk.<br />Take the decision.</h2>
      <p className="text-secondary mt-3">Every trade idea is presented with the information you need to evaluate the opportunity. No complicated screens, no endless market noise — just clear, structured market intelligence.</p>
      {[['success', 'Entry', 'Where to consider the trade.'], ['warning', 'Target', 'Potential exit levels.'], ['danger', 'Stop Loss', 'Defined risk level.'], ['secondary', 'Market View', 'The reasoning behind the setup.']].map(([color, title, description]) => <div className="row g-2 border-bottom border-light-subtle py-3 small align-items-center" key={title}><div className="col-5 col-sm-4"><i className={`fa-solid fa-circle text-${color} me-2`} aria-hidden="true" /><strong>{title}</strong></div><div className="col-7 col-sm-8 text-secondary">{description}</div></div>)}
    </div>
    <div className="col-12 col-lg-6">
      <article className="card border-light-subtle shadow-sm rounded-3 mx-lg-4">
        <div className="card-header bg-white border-light-subtle py-3"><span className="badge bg-light text-dark border fw-medium">EXAMPLE TRADE IDEA</span></div>
        <div className="card-body p-3 p-sm-4">
          <div className="d-flex justify-content-between gap-2"><div><h3 className="h5 fw-semibold mb-1">BANK NIFTY 51200 PE</h3><p className="small text-secondary mb-0">Weekly options trade</p></div><span className="badge bg-success-subtle text-success border border-success-subtle align-self-start">BUY</span></div>
          <div className="row g-2 text-center my-3">{[['Entry', '186.00', 'dark'], ['Target', '232.00', 'success'], ['Stop Loss', '162.00', 'danger']].map(([label, value, color]) => <div className="col-4" key={label}><div className="bg-body-tertiary border border-light-subtle rounded-2 py-2"><small className="d-block text-secondary">{label}</small><strong className={`text-${color}`}>{value}</strong></div></div>)}</div>
          <div className="border-top border-light-subtle pt-3"><h4 className="fs-6 fw-semibold">Market View</h4><p className="small text-secondary mb-0">Bank Nifty facing resistance near 51,400 with weakening breadth. A move towards the 51,000 support band is favoured in the near term.</p></div>
        </div>
      </article>
    </div>
  </div></div></section>
}

export function ClosingSection({ onGetStarted }) {
  return <section className="container">
    <div className="closing-banner d-grid align-items-center gap-4 border rounded-3 overflow-hidden p-4 p-lg-5 mb-5 text-body">
      <div>
        <h2 className="h2 fw-semibold mb-3">Start approaching it with clarity.</h2>
        <div>
          <p className="text-secondary lh-lg mb-4">Get access to live recommendations, market insights and daily trading signals from a SEBI-registered research analyst — on app or web.</p>
          <div className="d-grid d-sm-flex gap-2">
            <button className="btn btn-warning fw-semibold px-4 py-3" onClick={onGetStarted}>Get started <i className="fa-solid fa-arrow-right ms-2" aria-hidden="true" /></button>
            <a className="btn btn-light border fw-semibold px-4 py-3" href="/download">Download the app</a>
          </div>
        </div>
      </div>
      <div className="closing-banner-art">
        <img className="d-block w-100 h-auto" src="/assets/closing-mountain.png" alt="" loading="lazy" />
      </div>
    </div>
  </section>
}
