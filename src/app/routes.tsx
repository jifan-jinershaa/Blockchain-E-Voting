import type { ReactNode } from "react"
import { createBrowserRouter, Navigate } from "react-router"
import Layout from "../components/Layout"
import { useSession } from "../context/SessionContext"
import AuthPage from "../pages/AuthPage"
import HomePage from "../pages/HomePage"
import {
  AlreadyVotedPage,
  ResultsPage,
  TransactionPage,
  VoteSuccessPage,
} from "../pages/ResultsPages"
import VerificationPage from "../pages/VerificationPage"
import {
  BallotPage,
  ConfirmPage,
  EligibilityPage,
  ReviewPage,
} from "../pages/VotingPages"

function VotingGuard({
  children,
  minimumStage = 1,
}: {
  children: ReactNode
  minimumStage?: number
}) {
  const { voter, token, stage } = useSession()
  if (!voter || !token) return <Navigate to="/authenticate" replace />
  if (voter.voted) return <Navigate to="/results" replace />
  if (stage < minimumStage) {
    const fallback =
      stage >= 2
        ? "/eligibility"
        : stage >= 1
          ? "/verification"
          : "/authenticate"
    return <Navigate to={fallback} replace />
  }
  return children
}

function SelectionGuard({
  children,
  minimumStage,
}: {
  children: ReactNode
  minimumStage: number
}) {
  const { selected } = useSession()
  if (!selected) return <Navigate to="/ballot" replace />
  return <VotingGuard minimumStage={minimumStage}>{children}</VotingGuard>
}

function SuccessGuard() {
  const { receipt } = useSession()
  return receipt ? <VoteSuccessPage /> : <Navigate to="/results" replace />
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: "authenticate", Component: AuthPage },
      {
        path: "verification",
        element: (
          <VotingGuard>
            <VerificationPage />
          </VotingGuard>
        ),
      },
      {
        path: "eligibility",
        element: (
          <VotingGuard minimumStage={2}>
            <EligibilityPage />
          </VotingGuard>
        ),
      },
      {
        path: "ballot",
        element: (
          <VotingGuard minimumStage={3}>
            <BallotPage />
          </VotingGuard>
        ),
      },
      {
        path: "review",
        element: (
          <SelectionGuard minimumStage={4}>
            <ReviewPage />
          </SelectionGuard>
        ),
      },
      {
        path: "confirm",
        element: (
          <SelectionGuard minimumStage={5}>
            <ConfirmPage />
          </SelectionGuard>
        ),
      },
      { path: "vote-success", Component: SuccessGuard },
      { path: "already-voted", Component: AlreadyVotedPage },
      { path: "results", Component: ResultsPage },
      { path: "transaction/:transactionId", Component: TransactionPage },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
])
