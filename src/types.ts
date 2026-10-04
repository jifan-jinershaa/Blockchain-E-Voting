export type Voter = {
  id: string
  name: string
  maskedAadhaar: string
  state: string
  region: string
  constituency: string
  pollingStation: string
  voted: boolean
}

export type Candidate = {
  id: string
  constituency: string
  number: number
  name: string
  party: string
  symbol: string
  symbolCode: "leaf" | "sun" | "hand" | "kite" | "nota"
  info: string
  votes?: number
}

export type Block = {
  blockNumber: number
  timestamp: string
  transactionId: string
  voteReference: string
  previousHash: string
  currentHash: string
  status: "CONFIRMED"
}

export type Election = {
  id: string
  name: string
  active: boolean
  period: string
}

export type Results = {
  election: Election
  constituency: string
  totalVotes: number
  turnout: number
  blocksVerified: number
  integrity: number
  candidates: Candidate[]
}
