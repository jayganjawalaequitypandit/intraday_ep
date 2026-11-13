function SiteFooter() {
  return (
    <footer className="border-top bg-white py-4">
      <div className="container small text-dark">
        <p className="mb-4">
          For any grievances/support, contact our support team at{' '}
          <a className="fw-bold text-dark text-decoration-none" href="mailto:support@equitypandit.com">
            support@equitypandit.com
          </a>{' '}
          or call us at <a className="fw-bold text-dark text-decoration-none" href="tel:8000816688">8000 816 688</a>
        </p>
        <hr className="mb-4" />

        <div className="row g-4">
          <div className="col-12 col-lg-4">
            <h2 className="h6 fw-bold mb-3">SEBI Registered Research Analyst Details:</h2>
            <p className="mb-3">
              Registered Name: Equitypandit Financial Services Private Limited<br />
              Type of registration: Non-Individual<br />
              Registration No.: INH000029829<br />
              Validity: Perpetual<br />
              BSE Enlistment No.: 7469<br />
              CIN: U67120RJ2013PTC041600
            </p>
            <p className="mb-0">
              Registered Address: 209 - The Galleria, Near Sanjeev Kumar Auditorium, Pal, Adajan, Surat, Gujarat - 395009
            </p>
          </div>

          <div className="col-12 col-lg-8">
            <p className="mb-3">
              Principal Officer: Sourabh Dubey | Email:{' '}
              <a className="text-dark text-decoration-none" href="mailto:po.ra@equitypandit.com">po.ra@equitypandit.com</a>{' '}
              | Contact No.: +91 8000816688 | SEBI LO.: Ground Floor, Jeevan Nidhi 2 LIC Building, Ambedkar Circle, Bhawani Singh Rd, Jaipur, Rajasthan 302005
            </p>

            <h2 className="h6 fw-bold mb-3">Disclaimers:</h2>
            <ol className="mb-0 ps-4">
              <li className="mb-3">
                Registration granted by SEBI, membership of BASL and certification from NISM in no way guarantee performance of the intermediary or provide any assurance of returns to investors.
              </li>
              <li className="mb-3">
                The securities quoted, if any are for illustration only and are not recommendatory.
              </li>
              <li>
                Investments in securities market are subject to market risks. Read all the related documents carefully before investing.
              </li>
            </ol>
          </div>
        </div>

        <p className="text-center mb-0 mt-5">
          © Copyright 2026{' '}
          <a className="fw-bold text-dark text-decoration-none" href="https://www.equitypandit.in/" target="_blank" rel="noreferrer">
            Equitypandit Financial Services Private Limited.
          </a>{' '}
          All Rights Reserved
        </p>
      </div>
    </footer>
  )
}

export default SiteFooter
