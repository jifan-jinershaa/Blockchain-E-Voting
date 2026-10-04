import crypto from "node:crypto"

const hash = (value) => crypto.createHash("sha256").update(value).digest("hex")

export const createBlock = ({ blockchain, voterId, candidateId }) => {
  const previous = blockchain.at(-1)
  const blockNumber = 98742 + blockchain.length
  const timestamp = new Date().toISOString()
  const transactionId = `0x${crypto.randomBytes(16).toString("hex")}`
  const voteReference = hash(
    `${voterId}:${candidateId}:${transactionId}:${timestamp}`,
  )
  const previousHash = previous?.currentHash ?? hash("BHARAT-E-VOTE-GENESIS")
  const payload = `${blockNumber}|${timestamp}|${transactionId}|${voteReference}|${previousHash}`

  return {
    blockNumber,
    timestamp,
    transactionId,
    voteReference,
    previousHash,
    currentHash: hash(payload),
    status: "CONFIRMED",
  }
}

export const validateBlockchain = (blockchain) => {
  let previousHash = hash("BHARAT-E-VOTE-GENESIS")
  for (const block of blockchain) {
    const payload = `${block.blockNumber}|${block.timestamp}|${block.transactionId}|${block.voteReference}|${block.previousHash}`
    if (
      block.previousHash !== previousHash ||
      block.currentHash !== hash(payload)
    )
      return false
    previousHash = block.currentHash
  }
  return true
}
