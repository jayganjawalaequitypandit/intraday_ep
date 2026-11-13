function NotFoundPage({ onHome }) {
  return (
    <main className="container flex-grow-1 d-flex align-items-center justify-content-center py-5" id="main-content">
      <section className="text-center">
        <p className="display-1 fw-bold text-warning mb-2">404</p>
        <h1 className="fs-2 fw-bold mb-3">Page not found</h1>
        <p className="text-secondary mb-4">The page you are looking for does not exist or has been moved.</p>
        <button className="btn btn-warning fw-semibold px-4" type="button" onClick={onHome}>
          <i className="bi bi-house-door me-2" aria-hidden="true" />Go to home page
        </button>
      </section>
    </main>
  )
}

export default NotFoundPage


