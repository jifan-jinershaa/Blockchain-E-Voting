import { motion } from "motion/react"
import {
  ArrowRight,
  Blocks,
  BrainCircuit,
  CheckCircle2,
  Fingerprint,
  LockKeyhole,
  ShieldCheck,
  Users,
} from "lucide-react"
import { useNavigate } from "react-router"
import { useSession } from "../context/SessionContext"
import { Button, Card, Eyebrow, Page } from "../components/ui"

const features = [
  {
    icon: Fingerprint,
    title: "Aadhaar-Based Identity",
    text: "Uses fictional demo records for simulated identity matching.",
  },
  {
    icon: BrainCircuit,
    title: "AI Face Verification",
    text: "Demonstrates a guided, simulated identity verification flow.",
  },
  {
    icon: Users,
    title: "One Voter — One Vote",
    text: "Duplicate ballots are rejected by the backend, not just the browser.",
  },
  {
    icon: Blocks,
    title: "Blockchain Security",
    text: "Each vote creates a hash-linked block with validation.",
  },
]

export default function HomePage() {
  const navigate = useNavigate()
  const { voter } = useSession()
  const start = () =>
    navigate(
      voter?.voted ? "/results" : voter ? "/verification" : "/authenticate",
    )

  return (
    <Page>
      <section className="hero">
        <div className="hero-copy">
          <Eyebrow>
            <ShieldCheck size={17} /> Secure public-service prototype
          </Eyebrow>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Secure Digital Voting <span>for India</span>
          </motion.h1>
          <p className="hero-subtitle">
            A secure, transparent and verifiable electronic voting prototype
            powered by simulated AI verification and blockchain technology.
          </p>
          <div className="hero-actions">
            <Button onClick={start}>
              Cast your vote <ArrowRight size={19} />
            </Button>
            <Button variant="secondary" onClick={() => navigate("/results")}>
              View live results
            </Button>
          </div>
          <p className="micro-disclaimer">
            No real Aadhaar, biometric, or government election services are
            used.
          </p>
        </div>
        <Card className="election-card">
          <div className="card-topline">
            <span>Current demo election</span>
            <span className="live-pill">
              <i /> Polling active
            </span>
          </div>
          <div className="emblem">
            <ShieldCheck size={48} />
          </div>
          <h2>General Election 2026</h2>
          <p>Demo Election Period</p>
          <div className="secure-row">
            <LockKeyhole size={18} /> Blockchain validation active
          </div>
          <Button onClick={start}>
            Vote now <ArrowRight size={18} />
          </Button>
        </Card>
      </section>

      <section
        className="metric-strip"
        aria-label="Illustrative prototype metrics"
      >
        <div className="metric-label">
          Illustrative
          <br />
          prototype metrics
        </div>
        <div>
          <strong>970M+</strong>
          <span>Registered Voters</span>
        </div>
        <div>
          <strong>100%</strong>
          <span>Tamper Resistant</span>
        </div>
        <div>
          <strong>99.99%</strong>
          <span>System Accuracy</span>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <Eyebrow>Built around public trust</Eyebrow>
          <h2>A clear, verifiable voting journey</h2>
          <p>
            Every stage is intentionally separated so voters can understand what
            the prototype is doing.
          </p>
        </div>
        <div className="feature-grid">
          {features.map(({ icon: Icon, title, text }, index) => (
            <motion.article
              className="feature-card"
              key={title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
            >
              <span className={`feature-icon feature-${index}`}>
                <Icon />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
              <span className="feature-check">
                <CheckCircle2 size={16} /> Prototype ready
              </span>
            </motion.article>
          ))}
        </div>
      </section>
    </Page>
  )
}
