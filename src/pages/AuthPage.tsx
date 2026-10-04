import { useState, type FormEvent } from "react"
import { ArrowRight, Fingerprint, LockKeyhole, ShieldCheck } from "lucide-react"
import { useNavigate } from "react-router"
import Progress from "../components/Progress"
import { Alert, Button, Card, Eyebrow, Page } from "../components/ui"
import { useSession } from "../context/SessionContext"
import { api, getErrorMessage } from "../services/api"

const demos = [
  ["1234 1234 2312", "Kanyakumari"],
  ["1234 1234 4455", "Chennai"],
  ["1234 1234 7788", "Thiruvananthapuram"],
]

const formatAadhaar = (value: string) =>
  value
    .replace(/\D/g, "")
    .slice(0, 12)
    .replace(/(\d{4})(?=\d)/g, "$1 ")

export default function AuthPage() {
  const navigate = useNavigate()
  const { setAuth } = useSession()
  const [aadhaar, setAadhaar] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError("")
    if (aadhaar.replace(/\D/g, "").length !== 12) {
      setError("Enter a complete 12-digit demo Aadhaar number.")
      return
    }
    setLoading(true)
    try {
      const response = await api.authenticate(aadhaar)
      setAuth(response.token, response.voter)
      navigate(response.alreadyVoted ? "/already-voted" : "/verification")
    } catch (reason) {
      setError(getErrorMessage(reason))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Page className="flow-page">
      <Progress current={1} />
      <div className="flow-heading">
        <Eyebrow>Step 1 of 7</Eyebrow>
        <h1>Voter Authentication</h1>
        <p>Verify your identity to continue to the voting process.</p>
      </div>
      <div className="auth-grid">
        <Card className="form-card">
          <div className="icon-badge orange">
            <Fingerprint />
          </div>
          <h2>Enter demo Aadhaar number</h2>
          <p className="muted">
            No OTP is required. This checks only the fictional records stored in
            this prototype.
          </p>
          <form onSubmit={submit}>
            <label htmlFor="aadhaar">Aadhaar Number</label>
            <div className="input-wrap">
              <Fingerprint size={21} />
              <input
                id="aadhaar"
                inputMode="numeric"
                autoComplete="off"
                placeholder="1234 1234 2312"
                value={aadhaar}
                onChange={(event) =>
                  setAadhaar(formatAadhaar(event.target.value))
                }
                aria-describedby="aadhaar-help"
              />
            </div>
            <p id="aadhaar-help" className="field-help">
              <LockKeyhole size={14} /> Your full number is never displayed
              after verification.
            </p>
            {error && <Alert>{error}</Alert>}
            <Button type="submit" disabled={loading} className="full-button">
              {loading ? "Verifying demo record…" : "Verify Aadhaar"}{" "}
              <ArrowRight size={18} />
            </Button>
          </form>
        </Card>
        <aside className="demo-panel">
          <div>
            <Eyebrow>
              <ShieldCheck size={16} /> Try a demo identity
            </Eyebrow>
            <h2>Prototype voter records</h2>
            <p>
              Choose any fictional voter below. Each is assigned a
              constituency-specific ballot.
            </p>
          </div>
          <div className="demo-list">
            {demos.map(([number, region]) => (
              <button
                key={number}
                onClick={() => setAadhaar(number)}
                className="demo-option"
              >
                <span>
                  <strong>{number}</strong>
                  <small>{region} voter</small>
                </span>
                <ArrowRight size={18} />
              </button>
            ))}
          </div>
          <div className="simulation-note">
            <strong>Simulated authentication</strong>
            <p>No request is made to UIDAI or any government database.</p>
          </div>
        </aside>
      </div>
    </Page>
  )
}
