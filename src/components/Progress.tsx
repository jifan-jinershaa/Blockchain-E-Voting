import { Check } from "lucide-react"

const steps = [
  "Aadhaar Verification",
  "Identity Verification",
  "Eligibility",
  "Ballot",
  "Review",
  "Confirm",
  "Vote Recorded",
]

export default function Progress({ current }: { current: number }) {
  return (
    <nav className="progress-wrap" aria-label="Voting progress">
      <ol className="progress-list">
        {steps.map((step, index) => (
          <li
            key={step}
            className={
              index + 1 < current
                ? "complete"
                : index + 1 === current
                  ? "active"
                  : ""
            }
          >
            <span className="step-number">
              {index + 1 < current ? (
                <Check size={15} />
              ) : (
                String(index + 1).padStart(2, "0")
              )}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </nav>
  )
}
