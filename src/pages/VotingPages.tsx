import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  Vote,
} from "lucide-react"
import { useNavigate } from "react-router"
import Progress from "../components/Progress"
import SymbolIcon from "../components/SymbolIcon"
import { Alert, Button, Card, Eyebrow, Loading, Page } from "../components/ui"
import { useSession } from "../context/SessionContext"
import { api, getErrorMessage } from "../services/api"
import type { Candidate, Election } from "../types"

const VoterDetails = () => {
  const { voter } = useSession()
  if (!voter) return null
  return (
    <dl className="detail-grid">
      <div>
        <dt>Voter Name</dt>
        <dd>{voter.name}</dd>
      </div>
      <div>
        <dt>Masked Aadhaar</dt>
        <dd>{voter.maskedAadhaar}</dd>
      </div>
      <div>
        <dt>State</dt>
        <dd>{voter.state}</dd>
      </div>
      <div>
        <dt>Region</dt>
        <dd>{voter.region}</dd>
      </div>
      <div>
        <dt>Constituency</dt>
        <dd>{voter.constituency}</dd>
      </div>
      <div>
        <dt>Polling Station</dt>
        <dd>{voter.pollingStation}</dd>
      </div>
    </dl>
  )
}

export function EligibilityPage() {
  const navigate = useNavigate()
  const { voter, token, setStage } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const checks = [
    "Identity verified",
    "Voter found in demo electoral roll",
    "Constituency verified",
    "Demo election currently active",
    "Voter has not voted",
  ]

  const continueToBallot = async () => {
    setLoading(true)
    setError("")
    try {
      await api.checkEligibility(token!)
      setStage(3)
      navigate("/ballot")
    } catch (reason) {
      setError(getErrorMessage(reason))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Page className="flow-page">
      <Progress current={3} />
      <div className="flow-heading">
        <Eyebrow>Step 3 of 7</Eyebrow>
        <h1>Voter Eligibility</h1>
        <p>Your demo voter record meets the requirements for this election.</p>
      </div>
      <div className="eligibility-grid">
        <Card className="eligibility-status">
          <div className="success-seal">
            <ShieldCheck />
          </div>
          <span className="status-label">Eligible to vote</span>
          <h2>{voter?.name}</h2>
          <p>
            All required checks have been completed for this prototype session.
          </p>
          <ul className="eligibility-checks">
            {checks.map((check, index) => (
              <motion.li
                key={check}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CheckCircle2 /> {check}
              </motion.li>
            ))}
          </ul>
        </Card>
        <Card className="voter-record">
          <div className="card-heading">
            <div>
              <Eyebrow>Verified demo record</Eyebrow>
              <h2>Voter information</h2>
            </div>
            <MapPin />
          </div>
          <VoterDetails />
          {error && <Alert>{error}</Alert>}
          <Button
            onClick={continueToBallot}
            disabled={loading}
            className="full-button"
          >
            {loading ? "Checking eligibility…" : "Continue to ballot"}{" "}
            <ArrowRight size={18} />
          </Button>
        </Card>
      </div>
    </Page>
  )
}

export function BallotPage() {
  const navigate = useNavigate()
  const { token, voter, selected, setSelected, setStage } = useSession()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [election, setElection] = useState<Election | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .getBallot(token!)
      .then((response) => {
        setCandidates(response.candidates)
        setElection(response.election)
      })
      .catch((reason) => setError(getErrorMessage(reason)))
      .finally(() => setLoading(false))
  }, [token])

  const continueToReview = () => {
    if (!selected) {
      setError("Select exactly one candidate before continuing.")
      document
        .querySelector(".candidate-list")
        ?.scrollIntoView({ behavior: "smooth" })
      return
    }
    setStage(4)
    navigate("/review")
  }

  return (
    <Page className="flow-page">
      <Progress current={4} />
      <div className="ballot-heading">
        <div>
          <Eyebrow>Step 4 of 7 · Official demo ballot</Eyebrow>
          <h1>{election?.name || "Your Ballot"}</h1>
          <p>
            <MapPin size={17} /> {voter?.constituency}, {voter?.state}
          </p>
        </div>
        <span className="one-vote-badge">
          <Vote /> Select one candidate
        </span>
      </div>
      <div className="ballot-notice">
        <ShieldCheck />
        <div>
          <strong>Your selection is private</strong>
          <p>
            Review it carefully. The prototype will not retain a
            voter-to-candidate link after submission.
          </p>
        </div>
      </div>
      {loading ? (
        <Loading label="Preparing your constituency ballot…" />
      ) : (
        <div
          className="candidate-list"
          role="radiogroup"
          aria-label="Candidates"
        >
          {candidates.map((candidate) => {
            const active = selected?.id === candidate.id
            return (
              <motion.button
                key={candidate.id}
                className={`candidate-card ${active ? "selected" : ""}`}
                role="radio"
                aria-checked={active}
                onClick={() => {
                  setSelected(candidate)
                  setError("")
                }}
                whileTap={{ scale: 0.995 }}
                layout
              >
                <span className="candidate-number">
                  {String(candidate.number).padStart(2, "0")}
                </span>
                <span className="symbol-box">
                  <SymbolIcon code={candidate.symbolCode} />
                  <small>{candidate.symbol}</small>
                </span>
                <span className="candidate-info">
                  <strong>{candidate.name}</strong>
                  <span>{candidate.party}</span>
                  <small>{candidate.info}</small>
                </span>
                <span className="radio-mark">
                  {active && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <Check />
                    </motion.span>
                  )}
                </span>
              </motion.button>
            )
          })}
        </div>
      )}
      {error && <Alert>{error}</Alert>}
      <div className="flow-actions">
        <span>
          {selected ? `Selected: ${selected.name}` : "No candidate selected"}
        </span>
        <Button onClick={continueToReview}>
          Continue to review <ArrowRight size={18} />
        </Button>
      </div>
    </Page>
  )
}

const SelectionSummary = () => {
  const { selected, voter } = useSession()
  if (!selected) return null
  return (
    <>
      <div className="election-summary">
        <div>
          <span>Election</span>
          <strong>General Election 2026</strong>
        </div>
        <div>
          <span>State</span>
          <strong>{voter?.state}</strong>
        </div>
        <div>
          <span>Region</span>
          <strong>{voter?.region}</strong>
        </div>
        <div>
          <span>Constituency</span>
          <strong>{voter?.constituency}</strong>
        </div>
      </div>
      <Card className="selection-summary">
        <span className="symbol-large">
          <SymbolIcon code={selected.symbolCode} size={42} />
        </span>
        <div>
          <small>Your selection</small>
          <h2>{selected.name}</h2>
          <p>{selected.party}</p>
          <span>{selected.symbol}</span>
        </div>
        <CheckCircle2 className="summary-check" />
      </Card>
    </>
  )
}

export function ReviewPage() {
  const navigate = useNavigate()
  const { setStage } = useSession()
  return (
    <Page className="flow-page narrow-flow">
      <Progress current={5} />
      <div className="flow-heading">
        <Eyebrow>Step 5 of 7</Eyebrow>
        <h1>Review Your Selection</h1>
        <p>Confirm that the candidate below matches your intended selection.</p>
      </div>
      <SelectionSummary />
      <Alert tone="info">
        This is a review only. Your vote has not been cast yet.
      </Alert>
      <div className="split-actions">
        <Button variant="secondary" onClick={() => navigate("/ballot")}>
          <ArrowLeft size={18} /> Change selection
        </Button>
        <Button
          onClick={() => {
            setStage(5)
            navigate("/confirm")
          }}
        >
          Continue <ArrowRight size={18} />
        </Button>
      </div>
    </Page>
  )
}

export function ConfirmPage() {
  const navigate = useNavigate()
  const { token, selected, setReceipt } = useSession()
  const [casting, setCasting] = useState(false)
  const [error, setError] = useState("")
  const [status, setStatus] = useState(0)
  const statuses = [
    "Encrypting vote…",
    "Creating blockchain transaction…",
    "Validating block…",
    "Recording vote…",
    "Vote confirmed.",
  ]

  const castVote = async () => {
    if (!selected || casting) return
    setCasting(true)
    setError("")
    const timer = window.setInterval(
      () => setStatus((value) => Math.min(value + 1, statuses.length - 2)),
      550,
    )
    try {
      const response = await api.castVote(token!, selected.id)
      window.clearInterval(timer)
      setStatus(statuses.length - 1)
      await new Promise((resolve) => window.setTimeout(resolve, 650))
      setReceipt(response.block)
      navigate("/vote-success", { replace: true })
    } catch (reason) {
      window.clearInterval(timer)
      const data =
        reason instanceof Error && "data" in reason
          ? (reason as Error & { data: { alreadyVoted?: boolean } }).data
          : null
      if (data?.alreadyVoted) navigate("/already-voted", { replace: true })
      else {
        setError(getErrorMessage(reason))
        setCasting(false)
      }
    }
  }

  return (
    <Page className="flow-page narrow-flow">
      <Progress current={6} />
      <div className="flow-heading">
        <Eyebrow>Step 6 of 7</Eyebrow>
        <h1>Confirm Your Vote</h1>
        <p>This is your final confirmation before the ballot is submitted.</p>
      </div>
      <SelectionSummary />
      <div className="warning-panel">
        <ShieldAlert />
        <div>
          <strong>Your vote is final once submitted.</strong>
          <p>
            You will not be able to change your selection or vote again in this
            election.
          </p>
        </div>
      </div>
      {error && <Alert>{error}</Alert>}
      <div className="split-actions">
        <Button
          variant="secondary"
          disabled={casting}
          onClick={() => navigate("/review")}
        >
          <ArrowLeft size={18} /> Go back
        </Button>
        <Button disabled={casting} onClick={castVote}>
          {casting ? "Casting your vote…" : "Confirm & cast vote"}{" "}
          {!casting && <Vote size={18} />}
        </Button>
      </div>
      <AnimatePresence>
        {casting && (
          <motion.div
            className="casting-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="casting-card"
              initial={{ scale: 0.96 }}
              animate={{ scale: 1 }}
            >
              <div className="block-animation">
                <span />
                <span />
                <span />
                <ShieldCheck />
              </div>
              <Eyebrow>Secure submission in progress</Eyebrow>
              <h2>CASTING YOUR VOTE…</h2>
              <p>{statuses[status]}</p>
              <div className="casting-progress">
                <motion.i
                  animate={{
                    width: `${((status + 1) / statuses.length) * 100}%`,
                  }}
                />
              </div>
              <small>Do not close this window.</small>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Page>
  )
}
