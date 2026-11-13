export default function DashboardBreadcrumb({ currentPage }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-3 small">
      <ol className="breadcrumb mb-0" style={{ "--bs-breadcrumb-divider": '">"' }}>
        <li className="breadcrumb-item">
          <a className="link-secondary text-decoration-none" href="/dashboard">
            Dashboard
          </a>
        </li>
        <li className="breadcrumb-item active text-body-emphasis" aria-current="page">
          {currentPage}
        </li>
      </ol>
    </nav>
  );
}
