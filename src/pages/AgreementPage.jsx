import { useCallback, useEffect, useRef, useState } from 'react'
import { AuthTrustBar } from '../components/AuthPageLayout.jsx'
import api from '../services/api.js'
import { trackMetaCustomEvent } from '../utils/metaPixel.js'
import { ANALYTICS_EVENTS, trackAnalyticsEvent } from '../utils/analytics.js'

const completeValues = ['complete', 'completed', 'approved', 'accepted', 'signed', 'active']

function agreementIsComplete(source) {
  if (!source || typeof source !== 'object') return false

  const data = source?.data?.data || source?.data || source
  const agreement = data.agreement || data.raAgreement || data.researchAgreement
  const agreementStatus = agreement?.status || agreement?.agreementStatus

  if (typeof agreementStatus === 'string') {
    return completeValues.includes(agreementStatus.trim().toLowerCase())
  }
  if (agreementStatus === true || agreementStatus === 1) return true

  const directValues = [
    data.agreementComplete,
    data.isAgreementComplete,
    data.isAgreementCompleted,
    data.isSigned,
    data.signed,
    data.agreementStatus,
  ]

  if (directValues.some((value) => value === true || value === 1)) return true
  if (directValues.some((value) => typeof value === 'string' && completeValues.includes(value.toLowerCase()))) return true

  return false
}

function AgreementPage({ onContinue, notify }) {
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [signing, setSigning] = useState(false)
  const [digioReady, setDigioReady] = useState(() => typeof window.Digio === 'function')
  const [requestSignData, setRequestSignData] = useState({})
  const [digioSignUpdate, setDigioSignUpdate] = useState({ status: '', details: {} })
  const submittedDocumentRef = useRef('')
  const processedUpdateRef = useRef('')

  const checkAgreementStatus = useCallback(async (showPendingMessage = false) => {
    setChecking(true)
    try {
      const response = await api.uapi.checkAgreementStatus()
      if (agreementIsComplete(response)) {
        onContinue()
        return true
      }
      if (showPendingMessage) notify('error', 'Please complete the agreement before continuing')
    } catch (error) {
      notify('error', error.message || 'Unable to check agreement status')
    } finally {
      setChecking(false)
    }
    return false
  }, [notify, onContinue])

  useEffect(() => {
    let active = true

    const checkStatus = async () => {
      await checkAgreementStatus(false)
      if (active) setLoading(false)
    }

    checkStatus()
    return () => { active = false }
  }, [checkAgreementStatus])

  useEffect(() => {
    if (typeof window.Digio === 'function') {
      setDigioReady(true)
      return undefined
    }

    let script = document.querySelector('script[src="/assets/digio.js"]')
    if (!script) {
      script = document.createElement('script')
      script.src = '/assets/digio.js'
      script.async = true
      document.body.appendChild(script)
    }

    const handleLoad = () => setDigioReady(typeof window.Digio === 'function')
    const handleError = () => notify('error', 'Unable to load the agreement signing service')
    script.addEventListener('load', handleLoad)
    script.addEventListener('error', handleError)

    return () => {
      script.removeEventListener('load', handleLoad)
      script.removeEventListener('error', handleError)
    }
  }, [notify])

  const requestSignDocument = async () => {
    if (!digioReady || typeof window.Digio !== 'function') {
      notify('error', 'Agreement signing is still loading. Please try again.')
      return
    }

    trackMetaCustomEvent('AgreementInitiated')
    setSigning(true)
    setDigioSignUpdate({ status: '', details: {} })
    try {
      const response = await api.uapi.requestSignDocument()
      const data = response?.data?.data || response?.data || response
      if (!data?.id) throw new Error('Signing document ID was not returned by the server')
      setRequestSignData(data)
    } catch (error) {
      setSigning(false)
      notify('error', error.message || 'Unable to request the agreement document')
    }
  }

  useEffect(() => {
    if (!requestSignData.id || submittedDocumentRef.current === requestSignData.id) return

    const identifier = requestSignData.signing_parties?.[0]?.identifier
    const accessTokenId = requestSignData.access_token?.id
    if (!identifier || !accessTokenId || typeof window.Digio !== 'function') {
      setSigning(false)
      notify('error', 'Incomplete signing details were returned by the server')
      return
    }

    submittedDocumentRef.current = requestSignData.id
    window.paymentID = requestSignData.paymentId

    try {
      const digio = new window.Digio({
        environment: DIGIO_ENV,
        callback: (response = {}) => {
          const cancelled = response.error_code === 'CANCELLED' || Boolean(response.error_code)
          setDigioSignUpdate({
            status: cancelled ? 'CANCELLED' : 'SUCCESS',
            details: { ...response, paymentID: window.paymentID },
          })
          setSigning(false)
        },
        theme: {
          darkColor: '#AB3498',
          secondaryColor: '#000000',
        },
        Is_redirection_approach: false,
        is_iframe: true,
      })
      digio.init()
      digio.submit(requestSignData.id, identifier, accessTokenId)
    } catch (error) {
      submittedDocumentRef.current = ''
      setSigning(false)
      notify('error', error.message || 'Unable to open the agreement document')
    }
  }, [notify, requestSignData])

  useEffect(() => {
    if (!digioSignUpdate.status) return

    const documentId = digioSignUpdate.details.digio_doc_id || requestSignData.id
    const updateKey = `${documentId}:${digioSignUpdate.status}`
    if (!documentId || processedUpdateRef.current === updateKey) return
    processedUpdateRef.current = updateKey

    const updateStatus = async () => {
      try {
        const succeeded = digioSignUpdate.status === 'SUCCESS'
        await api.uapi.updateSignedDocumentStatus(documentId, {
          status: succeeded ? 'success' : 'cancel',
        })

        if (succeeded) {
          trackMetaCustomEvent('AgreementCompleted', {
            document_id: documentId,
          })
          trackAnalyticsEvent(ANALYTICS_EVENTS.AGREEMENT_COMPLETE)
          notify('success', 'Agreement signed successfully')
          onContinue()
        } else {
          notify('error', 'Agreement signing was cancelled')
        }
      } catch (error) {
        processedUpdateRef.current = ''
        notify('error', error.message || 'Unable to update the agreement status')
      }
    }

    updateStatus()
  }, [digioSignUpdate, notify, onContinue, requestSignData.id])

  if (loading) return <main className="container flex-grow-1 d-flex align-items-center justify-content-center py-5"><div className="spinner-border text-warning" role="status"><span className="visually-hidden">Checking agreement status</span></div></main>

  return (
    <main className="container flex-grow-1 py-4 py-md-5" id="main-content">
      <div className="row justify-content-center w-100 mx-0">
        <div className="col-12 col-lg-6">
          <section className="card border rounded-4 shadow-sm" aria-labelledby="agreement-title">
            <div className="card-body p-4 text-center">
              <div className="d-flex align-items-center gap-3 mb-3" aria-hidden="true">
                <hr className="flex-grow-1 text-secondary opacity-25" />
                <span className="d-inline-flex align-items-center justify-content-center fs-1" style={{ color: '#FA5B05' }}>
                  <i className="fa fa-handshake" aria-hidden="true"></i>
                </span>
                <hr className="flex-grow-1 text-secondary opacity-25" />
              </div>

              <p className="text-secondary mb-1">Exclusive Intraday Services by</p>
              <h2 className="h4 fw-bold mb-1" style={{ color: '#FA5B05' }}>EquityPandit Financial Services Pvt. Ltd.</h2>
              <p className="text-secondary mb-4">21 Years of Research Excellence</p>

              <h1 className="display-6 fw-bold mb-3" id="agreement-title">Service Agreement</h1>
              <p className="fs-5 text-secondary mb-3">Kindly accept this before activating your services.</p>
              <button className="btn btn-warning fw-semibold fs-5 w-100 py-3" type="button" onClick={requestSignDocument} disabled={checking || signing || !digioReady}>
                {signing && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
                {signing ? 'Opening agreement...' : 'Accept & continue'}
              </button>
            </div>
          </section>
          <AuthTrustBar />
        </div>
      </div>
    </main>
  )
}

export default AgreementPage
