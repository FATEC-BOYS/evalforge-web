export const TOKEN_KEY = "evalforge_token"

export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export function isAuthenticated(): boolean {
  const token = getToken()
  return token !== null && token !== ""
}
