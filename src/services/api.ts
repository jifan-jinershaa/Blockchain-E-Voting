import type { Block, Candidate, Election, Results, Voter } from "../types"

type ApiResponse<T,> = T & {
  success: boolean
  message?: string
  code?: string
  alreadyVoted?: boolean
}

const request = async <T,>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<ApiResponse<T>> => {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const data = await response.json().catch(() => ({
    success: false,
    message: "The service returned an unexpected response.",
  }))
  if (!response.ok) {
    const error = new Error(
      data.message || "Something went wrong.",
    ) as Error & { data: typeof data }
    error.data = data
    throw error
  }
  return data
}

export const api = {
  authenticate: (aadhaar: string) =>
    request<{
      token: string
      voter: Voter
      alreadyVoted: boolean
    }>("/api/auth/aadhaar", {
      method: "POST",
      body: JSON.stringify({ aadhaar }),
    }),
  getSession: (token: string) =>
    request<{ voter: Voter }>("/api/session", {}, token),
  verifyFace: (token: string) =>
    request<Record<string, never>>(
      "/api/session/face-verified",
      { method: "POST" },
      token,
    ),
  checkEligibility: (token: string) =>
    request<Record<string, never>>(
      "/api/session/eligibility",
      { method: "POST" },
      token,
    ),
  getBallot: (token: string) =>
    request<{
      election: Election
      candidates: Candidate[]
    }>("/api/ballot", {}, token),
  castVote: (token: string, candidateId: string) =>
    request<{ block: Block }>(
      "/api/vote",
      { method: "POST", body: JSON.stringify({ candidateId }) },
      token,
    ),
  getResults: (constituency?: string) =>
    request<Results>(
      `/api/results?constituency=${encodeURIComponent(constituency || "Nagercoil")}`,
    ),
  getTransaction: (transactionId: string) =>
    request<{ block: Block }>(
      `/api/transaction/${encodeURIComponent(transactionId)}`,
    ),
}

export const getErrorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "A network error occurred. Please try again."
