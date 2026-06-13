export interface DimensionScore {
  score: number
  justification: string
}

export interface EvaluationResult {
  scores: Record<string, DimensionScore>
  latency_ms: number
  verdict: "PASS" | "FAIL"
  model: string
}

export interface EvalRequest {
  task: string
  input: string
  model: string
}

export interface EvalResponse {
  request: EvalRequest
  result: EvaluationResult
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

async function apiFetch<T>(
  path: string,
  options?: RequestInit & { token?: string }
): Promise<T> {
  const { token, ...fetchOptions } = options ?? {}
  const baseUrl = process.env.NEXT_PUBLIC_API_URL

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers ?? {}),
  }

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...fetchOptions,
    headers,
  })

  if (!response.ok) {
    let message = response.statusText
    try {
      const body = await response.json()
      message = body.detail ?? body.message ?? message
    } catch {
      // use statusText if body is not JSON
    }
    throw new ApiError(response.status, message)
  }

  return response.json() as Promise<T>
}

export async function register(email: string, password: string): Promise<TokenResponse> {
  return apiFetch<TokenResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
}

export async function login(email: string, password: string): Promise<TokenResponse> {
  return apiFetch<TokenResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
}

export async function evaluate(request: EvalRequest, token: string): Promise<EvalResponse> {
  return apiFetch<EvalResponse>("/evaluate", {
    method: "POST",
    body: JSON.stringify(request),
    token,
  })
}
