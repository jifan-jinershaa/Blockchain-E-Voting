import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { Check, ScanFace, Sparkles } from "lucide-react"
import { useNavigate } from "react-router"
import Progress from "../components/Progress"
import { Alert, Button, Card, Eyebrow, Page } from "../components/ui"
import { useSession } from "../context/SessionContext"
import { api, getErrorMessage } from "../services/api"

const statuses = [
  "Initializing camera…",
  "Detecting face…",
  "Analyzing facial features…",
  "Matching voter identity…",
  "Identity verified.",
]

export default function VerificationPage() {
  const navigate = useNavigate()
  const reduced = useReducedMotion()
  const { token, setStage } = useSession()
  const [index, setIndex] = useState(0)
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (index >= statuses.length - 1) {
      api
        .verifyFace(token!)
        .then(() => {
          setStage(2)
          setVerified(true)
        })
        .catch((reason) => setError(getErrorMessage(reason)))
      return
    }
    const timer = window.setTimeout(
      () => setIndex((value) => value + 1),
      reduced ? 120 : 720,
    )
    return () => window.clearTimeout(timer)
  }, [index, reduced, setStage, token])

  return (
    <Page className="flow-page">
      <Progress current={2} />
      <div className="flow-heading">
        <Eyebrow>Step 2 of 7</Eyebrow>
        <h1>AI Identity Verification</h1>
        <p>Follow the on-screen guide while the simulated scan completes.</p>
      </div>
      <div className="verification-layout">
        <div
          className="camera-panel"
          aria-label="Simulated face scanning animation"
        >
          <div className="camera-top">
            <span>
              <i /> Demo camera active
            </span>
            <span>SIMULATION</span>
          </div>
          <div className="face-frame">
            <ScanFace strokeWidth={1} />
            {!verified && (
              <motion.div
                className="scan-line"
                animate={{ y: [-110, 110, -110] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
              />
            )}
            <div className="landmarks">
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>
          <div className="scan-status">
            <motion.span
              key={statuses[index]}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {verified ? <Check /> : <span className="pulse-ring" />}{" "}
              {statuses[index]}
            </motion.span>
            <div className="scan-progress">
              <motion.i
                animate={{ width: `${((index + 1) / statuses.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
        <Card className="verification-card">
          <span className="purple-icon">
            <Sparkles />
          </span>
          <h2>
            {verified
              ? "AI verification successful"
              : "Verification in progress"}
          </h2>
          <p>
            This educational animation does not access a real camera or perform
            biometric identification.
          </p>
          <ul className="check-list">
            {statuses.slice(0, 4).map((status, itemIndex) => (
              <li
                key={status}
                className={itemIndex < index || verified ? "done" : ""}
              >
                <Check size={17} /> {status.replace("…", "")}
              </li>
            ))}
          </ul>
          {error && <Alert>{error}</Alert>}
          <Button
            disabled={!verified}
            onClick={() => navigate("/eligibility")}
            className="full-button"
          >
            Continue
          </Button>
        </Card>
      </div>
    </Page>
  )
}
