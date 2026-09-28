const KEY = 'pendingHouseholdInvite'

/**
 * Código de invitación pendiente, del link/QR (/unirse/:code). Sobrevive
 * al viaje de ida y vuelta por email de la confirmación de registro porque
 * también se codifica en `emailRedirectTo` (ver Login.tsx) — esto es solo
 * la vía rápida para cuando todo ocurre en la misma sesión de navegador
 * (ya con sesión, o inicio de sesión en vez de registro).
 */
export function setPendingInvite(code: string) {
  localStorage.setItem(KEY, code)
}

export function getPendingInvite(): string | null {
  return localStorage.getItem(KEY)
}

export function clearPendingInvite() {
  localStorage.removeItem(KEY)
}
