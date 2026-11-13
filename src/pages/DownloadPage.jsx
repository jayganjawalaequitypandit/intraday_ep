import { useSelector } from 'react-redux'
import phonePreview from '../assets/intraday-pro-phone-orange.png'
import appStoreBadge from '../assets/app-store-badge.svg'
import googlePlayBadge from '../assets/google-play-badge.svg'
import { APP_STORE_URL, GOOGLE_PLAY_URL } from '../constants/appLinks.js'
import { selectEapiAuth } from '../store/eapiAuthSlice.js'
import { selectUapiAuth } from '../store/uapiAuthSlice.js'
import { getUserName } from '../utils/authResponse.js'
import './DownloadPage.css'

const platforms = [
  { name: 'Google Play', href: GOOGLE_PLAY_URL, badge: googlePlayBadge },
  { name: 'App Store', href: APP_STORE_URL, badge: appStoreBadge },
]

function DownloadPage({ statuses }) {
  const eapiAuth = useSelector(selectEapiAuth)
  const uapiAuth = useSelector(selectUapiAuth)
  const name = getUserName(eapiAuth.user) || getUserName(uapiAuth.user) || 'Trader'
  const isSubscribed = Boolean(statuses?.paymentComplete)

  return (
    <main className="container flex-grow-1 py-4" id="main-content">
      <section className="download-hero overflow-hidden rounded-4 border bg-white shadow-sm" aria-labelledby="download-title">
        <div className="row g-0 align-items-center">
          <div className="col-12 col-lg-7">
            <div className="p-4 p-md-5">
              {isSubscribed ? (
                <div className="d-flex align-items-start gap-3 rounded-3 border border-success-subtle bg-success-subtle p-3 p-md-4 mb-4" role="status">
                  <span className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success text-white flex-shrink-0 fs-5" style={{ width: '44px', height: '44px' }}>
                    <i className="bi bi-check-lg" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="h5 fw-bold text-success-emphasis mb-1">You’re all set, <span className='text-capitalize'>{name}</span>!</h2>
                    <p className="text-success-emphasis mb-0">
                      Your subscription is active. Download the app and sign in with your registered mobile number to access your calls.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-3 border border-warning-subtle bg-warning-subtle p-3 p-md-4 mb-4">
                  <h2 className="h5 fw-bold text-dark mb-1">Take your trading desk with you, <span className='text-capitalize'>{name}</span>.</h2>
                  <p className="text-body-secondary mb-0">
                    Download the Intraday Traders app and sign in with your mobile number to explore the app and market updates.
                  </p>
                </div>
              )}

              <p className="text-warning-emphasis fw-semibold mb-3">Trade on the go</p>
              <h1 className="display-4 fw-bold lh-1 text-dark mb-3" id="download-title">Take Intraday <span style={{color:"#FA5B05"}}>PRO</span> wherever you trade.</h1>
              <p className="lead text-secondary mb-4">
                {isSubscribed
                  ? 'Get your subscribed trading recommendations and signals directly on your phone.'
                  : 'Explore market updates and discover research-backed trading recommendations on your phone.'}
              </p>

              <p className="fw-semibold text-dark mb-2">
                {isSubscribed ? 'Download the app to access your calls:' : 'Download the app to get started:'}
              </p>
              <div className="row g-2 mb-4" aria-label="App download options">
                {platforms.map((platform) => {
                  const DownloadControl = platform.href ? 'a' : 'button'
                  return (
                  <div className="col-12 col-sm-auto" key={platform.name}>
                    <DownloadControl className="download-store-badge" href={platform.href} target={platform.href ? '_blank' : undefined} rel={platform.href ? 'noreferrer' : undefined} type={platform.href ? undefined : 'button'} disabled={!platform.href} title={!platform.href ? 'App Store link coming soon' : undefined} aria-label={`Download IDT on ${platform.name}`}>
                      <img src={platform.badge} alt={platform.name} width={117} height={35} />
                    </DownloadControl>
                  </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-5 align-self-stretch">
            <div className="download-phone-panel h-100 d-flex align-items-end justify-content-center px-4 pt-4 overflow-hidden">
              <img className="download-phone-image img-fluid d-block object-fit-contain" src={phonePreview} alt="Intraday PRO mobile app preview" />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default DownloadPage
