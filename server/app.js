import crypto from "node:crypto"
import express from "express"
import { createBlock, validateBlockchain } from "./blockchain/blockchain.js"
import { readStore, writeStore } from "./services/store.js"

export const app = express()
const sessions = new Map()

app.use(express.json())

const publicVoter = (voter) => ({
  id: voter.id,
  name: voter.name,
  maskedAadhaar: `XXXX XXXX ${voter.aadhaar.slice(-4)}`,
  state: voter.state,
  region: voter.region,
  constituency: voter.constituency,
  pollingStation: voter.pollingStation,
  voted: voter.voted,
})

const getSession = (request) => {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, "")
  return token ? sessions.get(token) : null
}

const requireSession = (request, response, next) => {
  const session = getSession(request)
  if (!session) return response.status(401).json({
      success: false,
      code: "SESSION_EXPIRED",
      message: "Your demo session has expired. Please authenticate again.",
    })
  request.demoSession = session
  next()
}

app.get("/api/health", (_request, response) => {
  response.json({ ok: true, service: "BHARAT E-VOTE demo API" })
})

app.post("/api/auth/aadhaar", (request, response) => {
  const aadhaar = String(request.body?.aadhaar ?? "").replace(/\D/g, "")
  if (aadhaar.length !== 12) return response.status(400).json({
      success: false,
      code: "INVALID_AADHAAR",
      message: "Enter a valid 12-digit demo Aadhaar number.",
    })
  const store = readStore()
  const voter = store.voters.find((item) => item.aadhaar === aadhaar)
  if (!voter) return response.status(404).json({
      success: false,
      code: "UNKNOWN_VOTER",
      message: "No demo voter was found for this Aadhaar number.",
    })

  const token = crypto.randomUUID()
  sessions.set(token, {
    voterId: voter.id,
    faceVerified: false,
    eligibilityChecked: false,
  })
  response.json({
    success: true,
    token,
    voter: publicVoter(voter),
    alreadyVoted: voter.voted,
    message: voter.voted
      ? "Your vote has already been recorded."
      : "Aadhaar verified using simulated demo records.",
  })
})

app.get("/api/session", requireSession, (request, response) => {
  const store = readStore()
  const voter = store.voters.find(
    (item) => item.id === request.demoSession.voterId,
  )
  if (!voter)
    return response
      .status(404)
      .json({ success: false, message: "Demo voter record is unavailable." })
  response.json({
    success: true,
    voter: publicVoter(voter),
    session: request.demoSession,
  })
})

app.post("/api/session/face-verified", requireSession, (request, response) => {
  request.demoSession.faceVerified = true
  response.json({
    success: true,
    message: "Simulated identity verification completed.",
  })
})

app.post("/api/session/eligibility", requireSession, (request, response) => {
  const store = readStore()
  const voter = store.voters.find(
    (item) => item.id === request.demoSession.voterId,
  )
  if (!voter?.eligible || !store.election.active || voter.voted) {
    return response.status(403).json({
      success: false,
      alreadyVoted: Boolean(voter?.voted),
      message: voter?.voted
        ? "This voter has already cast a ballot."
        : "This voter is not currently eligible to vote.",
    })
  }
  if (!request.demoSession.faceVerified) return response.status(403).json({
      success: false,
      message: "Complete simulated identity verification first.",
    })
  request.demoSession.eligibilityChecked = true
  response.json({ success: true })
})

app.get("/api/ballot", requireSession, (request, response) => {
  const store = readStore()
  const voter = store.voters.find(
    (item) => item.id === request.demoSession.voterId,
  )
  if (voter?.voted) return response.status(409).json({
      success: false,
      alreadyVoted: true,
      message: "This voter has already cast a ballot.",
    })
  if (!request.demoSession.eligibilityChecked)
    return response.status(403).json({
      success: false,
      message: "Complete the eligibility check before opening the ballot.",
    })
  response.json({
    success: true,
    election: store.election,
    candidates: store.candidates.filter(
      (candidate) => candidate.constituency === voter.constituency,
    ),
  })
})

app.post("/api/vote", requireSession, (request, response) => {
  const store = readStore()
  const voter = store.voters.find(
    (item) => item.id === request.demoSession.voterId,
  )
  if (!voter)
    return response
      .status(404)
      .json({ success: false, message: "Voter record not found." })
  if (!voter.eligible) return response.status(403).json({
      success: false,
      message: "This voter is not eligible for the demo election.",
    })
  if (!store.election.active) return response.status(403).json({
      success: false,
      code: "ELECTION_CLOSED",
      message: "The demo election is currently closed.",
    })
  if (voter.voted) return response.status(409).json({
      success: false,
      alreadyVoted: true,
      message: "This voter has already cast a ballot.",
    })
  if (
    !request.demoSession.faceVerified ||
    !request.demoSession.eligibilityChecked
  ) {
    return response.status(403).json({
      success: false,
      message: "Complete all required verification steps before voting.",
    })
  }
  const candidate = store.candidates.find(
    (item) => item.id === request.body?.candidateId,
  )
  if (!candidate || candidate.constituency !== voter.constituency) {
    return response.status(400).json({
      success: false,
      code: "INVALID_CONSTITUENCY",
      message: "This candidate is not on your constituency ballot.",
    })
  }

  try {
    const block = createBlock({
      blockchain: store.blockchain,
      voterId: voter.id,
      candidateId: candidate.id,
    })
    store.blockchain.push(block)
    if (!validateBlockchain(store.blockchain))
      throw new Error("Blockchain validation failed")
    voter.voted = true
    store.counts[candidate.id] = (store.counts[candidate.id] ?? 0) + 1
    store.transactions.push({
      voterId: voter.id,
      transactionId: block.transactionId,
    })
    writeStore(store)
    response.status(201).json({ success: true, block })
  } catch {
    response.status(500).json({
      success: false,
      code: "BLOCKCHAIN_ERROR",
      message:
        "The vote could not be recorded securely. No ballot was submitted.",
    })
  }
})

app.get("/api/results", (request, response) => {
  const store = readStore()
  const requested = String(request.query.constituency ?? "Nagercoil")
  const available = new Set(
    store.candidates.map((candidate) => candidate.constituency),
  )
  const constituency = available.has(requested) ? requested : "Nagercoil"
  const candidates = store.candidates
    .filter((candidate) => candidate.constituency === constituency)
    .map((candidate) => ({
      ...candidate,
      votes: store.counts[candidate.id] ?? 0,
    }))
  const totalVotes = candidates.reduce(
    (sum, candidate) => sum + candidate.votes,
    0,
  )
  response.json({
    success: true,
    election: store.election,
    constituency,
    totalVotes,
    turnout: 72.4,
    blocksVerified: 98742 + store.blockchain.length,
    integrity: validateBlockchain(store.blockchain) ? 100 : 0,
    candidates,
  })
})

app.get("/api/blockchain/validate", (_request, response) => {
  const store = readStore()
  response.json({
    success: true,
    valid: validateBlockchain(store.blockchain),
    blocks: store.blockchain.length,
  })
})

app.get("/api/transaction/:transactionId", (request, response) => {
  const store = readStore()
  const block = store.blockchain.find(
    (item) => item.transactionId === request.params.transactionId,
  )
  if (!block)
    return response
      .status(404)
      .json({ success: false, message: "Transaction not found." })
  response.json({ success: true, block })
})

app.use((error, _request, response, _next) => {
  console.error(error)
  response.status(500).json({
    success: false,
    message: "The demo service is temporarily unavailable.",
  })
})
