function MarketSnapshot() {
  return (
    <section className="bg-warning-subtle p-3 rounded-4 shadow-lg" id="features" aria-labelledby="market-title">
      <div className="bg-white rounded-4 p-4 p-xl-5">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h2 className="fs-6 fw-semibold mb-0" id="market-title">Market snapshot</h2>
          <span className="badge text-bg-success">Live</span>
        </div>
        <div className="display-6 fw-semibold text-dark">24,875.40</div>
        <div className="small fw-semibold text-success mt-1">+186.25 (0.75%)</div>
        <div className="progress mt-4" role="progressbar" aria-label="Market strength" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100">
          <div className="progress-bar bg-warning" style={{ width: '75%' }} />
        </div>
        <div className="d-flex justify-content-between align-items-center mt-4 text-secondary small">
          <span><i className="bi bi-lightning-charge text-warning me-2" />Fast setup</span>
          <span><i className="bi bi-shield-check text-warning me-2" />Secure access</span>
        </div>
      </div>
    </section>
  )
}

export default MarketSnapshot

