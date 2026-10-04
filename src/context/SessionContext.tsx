import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { Block, Candidate, Voter } from "../types"

type SessionValue = {
  token: string | null
  voter: Voter | null
  selected: Candidate | null
  receipt: Block | null
  stage: number
  setAuth: (token: string, voter: Voter) => void
  setSelected: (candidate: Candidate | null) => void
  setReceipt: (block: Block) => void
  setStage: (stage: number) => void
  clearSession: () => void
}

const TOKEN_KEY = "bev-token"
const VOTER_KEY = "bev-voter"
const SELECTION_KEY = "bev-selection"
const RECEIPT_KEY = "bev-receipt"
const STAGE_KEY = "bev-stage"

const read = <T,>(key: string): T | null => {
  try {
    const value = sessionStorage.getItem(key)
    return value ? JSON.parse(value) : null
  } catch {
    return null
  }
}

const SessionContext = createContext<SessionValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [token, updateToken] = useState<string | null>(() =>
    sessionStorage.getItem(TOKEN_KEY),
  )
  const [voter, updateVoter] = useState<Voter | null>(() =>
    read<Voter>(VOTER_KEY),
  )
  const [selected, updateSelected] = useState<Candidate | null>(() =>
    read<Candidate>(SELECTION_KEY),
  )
  const [receipt, updateReceipt] = useState<Block | null>(() =>
    read<Block>(RECEIPT_KEY),
  )
  const [stage, updateStage] = useState(() =>
    Number(sessionStorage.getItem(STAGE_KEY) || 0),
  )

  const value = useMemo<SessionValue>(
    () => ({
      token,
      voter,
      selected,
      receipt,
      stage,
      setAuth: (nextToken, nextVoter) => {
        sessionStorage.setItem(TOKEN_KEY, nextToken)
        sessionStorage.setItem(VOTER_KEY, JSON.stringify(nextVoter))
        updateToken(nextToken)
        updateVoter(nextVoter)
        sessionStorage.setItem(STAGE_KEY, "1")
        updateStage(1)
      },
      setSelected: (candidate) => {
        if (candidate)
          sessionStorage.setItem(SELECTION_KEY, JSON.stringify(candidate))
        else sessionStorage.removeItem(SELECTION_KEY)
        updateSelected(candidate)
      },
      setReceipt: (block) => {
        const nextVoter = voter ? { ...voter, voted: true } : null
        sessionStorage.setItem(RECEIPT_KEY, JSON.stringify(block))
        if (nextVoter)
          sessionStorage.setItem(VOTER_KEY, JSON.stringify(nextVoter))
        updateReceipt(block)
        updateVoter(nextVoter)
        sessionStorage.removeItem(SELECTION_KEY)
        updateSelected(null)
        sessionStorage.setItem(STAGE_KEY, "7")
        updateStage(7)
      },
      setStage: (nextStage) => {
        sessionStorage.setItem(STAGE_KEY, String(nextStage))
        updateStage(nextStage)
      },
      clearSession: () => {
        ;[TOKEN_KEY, VOTER_KEY, SELECTION_KEY, RECEIPT_KEY, STAGE_KEY].forEach(
          (key) => sessionStorage.removeItem(key),
        )
        updateToken(null)
        updateVoter(null)
        updateSelected(null)
        updateReceipt(null)
        updateStage(0)
      },
    }),
    [receipt, selected, stage, token, voter],
  )

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  )
}

export const useSession = () => {
  const value = useContext(SessionContext)
  if (!value) throw new Error("useSession must be used inside SessionProvider")
  return value
}
