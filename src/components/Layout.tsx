import { BarChart3, CircleHelp, LogIn, ShieldCheck } from "lucide-react"
import { NavLink, Outlet, useNavigate } from "react-router"
import { useSession } from "../context/SessionContext"
import { Button } from "./ui"

export default function Layout() {
  const { voter, clearSession } = useSession()
  const navigate = useNavigate()

  const nextVoter = () => {
    clearSession()
    navigate("/")
  }

  return (
    <div className="app-shell">
      <div className="prototype-ribbon">
        Prototype System — Academic demonstration only. Not connected to
        Aadhaar, UIDAI, Election Commission databases, or live election
        infrastructure.
      </div>
      <header className="site-header">
        <NavLink to="/" className="brand" aria-label="BHARAT E-VOTE home">
          <span className="brand-mark">
            <ShieldCheck aria-hidden="true" />
          </span>
          <span>
            <strong>BHARAT E-VOTE</strong>
            <small>Electronic Voting Platform</small>
          </span>
        </NavLink>
        <nav className="header-nav" aria-label="Primary navigation">
          <NavLink to="/results">
            <BarChart3 size={18} /> <span>View Results</span>
          </NavLink>
          <a href="#help">
            <CircleHelp size={18} /> <span>Help</span>
          </a>
          {voter ? (
            <Button
              variant="ghost"
              onClick={nextVoter}
              aria-label="End current session and return home"
            >
              <span className="voter-chip">
                <ShieldCheck size={18} /> Verified Voter{" "}
                <small>{voter.maskedAadhaar}</small>
              </span>
            </Button>
          ) : (
            <NavLink to="/authenticate" className="login-link">
              <LogIn size={18} /> Voter Login
            </NavLink>
          )}
        </nav>
      </header>
      <Outlet />
      <footer id="help" className="site-footer">
        <div>
          <strong>BHARAT E-VOTE</strong>
          <p>Secure, transparent, educational voting technology.</p>
        </div>
        <div>
          <strong>Need help?</strong>
          <p>
            Use a listed demo Aadhaar number. No OTP or real biometric data is
            used.
          </p>
        </div>
        <p className="footer-note">
          Prototype System — Not an official government service.
        </p>
      </footer>
    </div>
  )
}
