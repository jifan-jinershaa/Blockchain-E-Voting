import { useEffect, useState } from "react"
import { motion } from "motion/react"
import {
  ArrowRight,
  Blocks,
  Check,
  CheckCircle2,
  ExternalLink,
  Home,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  Users,
  Vote,
} from "lucide-react"
import { useNavigate, useParams } from "react-router"
import Progress from "../components/Progress"
import SymbolIcon from "../components/SymbolIcon"
import { Alert, Button, Card, Eyebrow, Loading, Page } from "../components/ui"
import { useSession } from "../context/SessionContext"
import { api, getErrorMessage } from "../services/api"
import type { Block, Results } from "../types"

const shortHash = (value: string) => `${value.slice(0, 12)}…${value.slice(-10)}`

export function VoteSuccessPage() {
  const navigate = useNavigate()
  const { receipt, clearSession } = useSession()
  if (!receipt) return null
  const nextVoter = () => {
    clearSession()
    navigate("/", { replace: true })
  }

  return (
    <Page className="flow-page narrow-flow">
      <Progress current={7} />
      <motion.div
        className="success-mark"
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring" }}
      >
        <Check />
      </motion.div>
      <div className="flow-heading success-heading">
        <Eyebrow>Step 7 of 7 · Complete</Eyebrow>
        <h1>Vote Successfully Recorded</h1>
        <p>Your vote has been securely recorded in this academic prototype.</p>
      </div>
      <Card className="receipt-card">
        <div className="receipt-status">
          <span>
            <CheckCircle2 /> Confirmed
          </span>
          <small>Blockchain transaction</small>
        </div>
        <dl>
          <div>
            <dt>Transaction ID</dt>
            <dd>{shortHash(receipt.transactionId)}</dd>
          </div>
          <div>
            <dt>Block Number</dt>
            <dd>#{receipt.blockNumber.toLocaleString("en-IN")}</dd>
          </div>
          <div>
            <dt>Timestamp</dt>
            <dd>{new Date(receipt.timestamp).toLocaleString("en-IN")}</dd>
          </div>
          <div>
            <dt>Blockchain Status</dt>
            <dd className="confirmed">CONFIRMED</dd>
          </div>
        </dl>
        <div className="privacy-note">
          <LockKeyhole />
          <span>
            <strong>Your ballot choice remains confidential.</strong>
            <small>
              The receipt contains no candidate name or voter-to-choice link.
            </small>
          </span>
        </div>
      </Card>
      <div className="split-actions">
        <Button variant="secondary" onClick={nextVoter}>
          <RotateCcw size={18} /> Return home / next voter
        </Button>
        <Button onClick={() => navigate("/results", { replace: true })}>
          View live results <ArrowRight size={18} />
        </Button>
      </div>
      <button
        className="text-link"
        onClick={() => navigate(`/transaction/${receipt.transactionId}`)}
      >
        View full transaction details <ExternalLink size={15} />
      </button>
    </Page>
  )
}

export function AlreadyVotedPage() {
  const navigate = useNavigate()
  const { voter, clearSession } = useSession()
  const exit = () => {
    clearSession()
    navigate("/", { replace: true })
  }
  return (
    <Page className="flow-page narrow-flow">
      <Card className="already-card">
        <span className="success-seal">
          <ShieldCheck />
        </span>
        <Eyebrow>Ballot protected</Eyebrow>
        <h1>Your vote has already been recorded.</h1>
        <p>
          {voter?.name ? `${voter.name}, this` : "This"} demo voter cannot
          access another ballot for the General Election 2026.
        </p>
        <Alert tone="success">
          One voter — one vote is enforced by the backend, including after
          refresh or a new login.
        </Alert>
        <div className="split-actions">
          <Button variant="secondary" onClick={exit}>
            <Home size={18} /> Next voter
          </Button>
          <Button onClick={() => navigate("/results", { replace: true })}>
            View results <ArrowRight size={18} />
          </Button>
        </div>
      </Card>
    </Page>
  )
}

export function ResultsPage() {
  const navigate = useNavigate()
  const { voter, clearSession } = useSession()
  const [results, setResults] = useState<Results | null>(null)
  const [error, setError] = useState("")
  const constituency = voter?.constituency || "Nagercoil"

  useEffect(() => {
    api
      .getResults(constituency)
      .then(setResults)
      .catch((reason) => setError(getErrorMessage(reason)))
  }, [constituency])

  const nextVoter = () => {
    clearSession()
    navigate("/", { replace: true })
  }
  if (error)
    return (
      <Page className="flow-page">
        <Alert>{error}</Alert>
      </Page>
    )
  if (!results)
    return (
      <Page className="flow-page">
        <Loading label="Loading simulated live results…" />
      </Page>
    )
  const sorted = [...results.candidates].sort(
    (a, b) => (b.votes || 0) - (a.votes || 0),
  )

  return (
    <Page className="results-page">
      <section className="results-hero">
        <div>
          <Eyebrow>
            <span className="live-dot" /> Live election results
          </Eyebrow>
          <h1>{results.election.name}</h1>
          <p>
            <strong>Constituency:</strong> {results.constituency}
          </p>
        </div>
        <span className="simulation-tag">Simulated prototype data</span>
      </section>
      <section className="result-metrics">
        {[
          [Vote, results.totalVotes.toLocaleString("en-IN"), "Total Votes"],
          [Users, `${results.turnout}%`, "Voter Turnout"],
          [
            Blocks,
            results.blocksVerified.toLocaleString("en-IN"),
            "Blocks Verified",
          ],
          [ShieldCheck, `${results.integrity}%`, "Blockchain Integrity"],
        ].map(([Icon, value, label]) => {
          const MetricIcon = Icon as typeof Vote
          return (
            <Card key={String(label)}>
              <MetricIcon />
              <div>
                <motion.strong
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {String(value)}
                </motion.strong>
                <span>{String(label)}</span>
              </div>
            </Card>
          )
        })}
      </section>
      <section className="distribution">
        <div className="distribution-heading">
          <div>
            <Eyebrow>Constituency count</Eyebrow>
            <h2>Result distribution</h2>
          </div>
          <span>Updated just now</span>
        </div>
        <Card className="result-list">
          {sorted.map((candidate, index) => {
            const percentage = results.totalVotes
              ? ((candidate.votes || 0) / results.totalVotes) * 100
              : 0
            return (
              <div className="result-row" key={candidate.id}>
                <span className={`rank rank-${index}`}>{index + 1}</span>
                <span className="result-symbol">
                  <SymbolIcon code={candidate.symbolCode} />
                </span>
                <div className="result-info">
                  <div>
                    <span>
                      <strong>{candidate.name}</strong>
                      <small>{candidate.party}</small>
                    </span>
                    <span className="vote-total">
                      <strong>{percentage.toFixed(1)}%</strong>
                      <small>
                        {(candidate.votes || 0).toLocaleString("en-IN")} votes
                      </small>
                    </span>
                  </div>
                  <div className="bar-track">
                    <motion.i
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.9, delay: index * 0.08 }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </Card>
      </section>
      <div className="results-footer-action">
        <div>
          <ShieldCheck />
          <span>
            <strong>Blockchain integrity verified</strong>
            <small>All prototype blocks form a valid hash chain.</small>
          </span>
        </div>
        <Button onClick={nextVoter}>
          <RotateCcw size={18} /> Return home / next voter
        </Button>
      </div>
    </Page>
  )
}

export function TransactionPage() {
  const { transactionId } = useParams()
  const navigate = useNavigate()
  const { receipt, clearSession } = useSession()
  const [block, setBlock] = useState<Block | null>(
    receipt?.transactionId === transactionId ? receipt : null,
  )
  const [error, setError] = useState("")

  useEffect(() => {
    if (!block && transactionId)
      api
        .getTransaction(transactionId)
        .then((response) => setBlock(response.block))
        .catch((reason) => setError(getErrorMessage(reason)))
  }, [block, transactionId])

  if (error)
    return (
      <Page className="flow-page">
        <Alert>{error}</Alert>
      </Page>
    )
  if (!block)
    return (
      <Page className="flow-page">
        <Loading label="Verifying transaction…" />
      </Page>
    )
  return (
    <Page className="flow-page narrow-flow">
      <div className="flow-heading">
        <Eyebrow>
          <Blocks size={17} /> Educational blockchain explorer
        </Eyebrow>
        <h1>Blockchain Transaction Details</h1>
        <p>Technical receipt for the confirmed prototype block.</p>
      </div>
      <Card className="transaction-card">
        <div className="transaction-confirmed">
          <CheckCircle2 />
          <div>
            <strong>Confirmed</strong>
            <small>Block validation passed</small>
          </div>
        </div>
        <dl>
          <div>
            <dt>Transaction ID</dt>
            <dd>{block.transactionId}</dd>
          </div>
          <div>
            <dt>Block Number</dt>
            <dd>#{block.blockNumber.toLocaleString("en-IN")}</dd>
          </div>
          <div>
            <dt>Timestamp</dt>
            <dd>{new Date(block.timestamp).toLocaleString("en-IN")}</dd>
          </div>
          <div>
            <dt>Previous Hash</dt>
            <dd>{block.previousHash}</dd>
          </div>
          <div>
            <dt>Current Hash</dt>
            <dd>{block.currentHash}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd className="confirmed">CONFIRMED</dd>
          </div>
        </dl>
      </Card>
      <div className="split-actions">
        <Button
          variant="secondary"
          onClick={() => {
            clearSession()
            navigate("/")
          }}
        >
          <Home size={18} /> Return home
        </Button>
        <Button onClick={() => navigate("/results")}>
          View live results <ArrowRight size={18} />
        </Button>
      </div>
    </Page>
  )
}
