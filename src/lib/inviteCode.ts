import { ERROR_MESSAGES, isNetworkError } from './errorMessages'
import { supabase } from './supabase'

/**
 * Código de invitación del hogar: 8 caracteres de un alfabeto sin los que se
 * confunden (0/O, 1/I). Lo genera la base (households.invite_code) y unirse
 * pasa por la función join_household (migración 20260928204816).
 */

/** "48gw-gdkh " → "48GWGDKH": como se guarda. join_household también lo normaliza. */
export function normalizeInviteCode(raw: string): string {
  return raw.toUpperCase().replace(/[^0-9A-Z]/g, '')
}

/** "48GWGDKH" → "48GW-GDKH": en dos grupos, para leerlo y dictarlo. */
export function formatInviteCode(code: string): string {
  const clean = normalizeInviteCode(code)
  return clean.length > 4 ? `${clean.slice(0, 4)}-${clean.slice(4)}` : clean
}

/** Link del QR y de "Compartir": abre la app en /unirse/<código>. */
export function inviteUrl(code: string): string {
  return `${window.location.origin}/unirse/${normalizeInviteCode(code)}`
}

const JOIN_ERROR_MESSAGES = {
  invalid: 'Ese código no existe. Revisa que esté bien escrito, o pídele a tu pareja que lo copie de nuevo desde "Ver más".',
  full: 'Ese hogar ya tiene dos personas. Pídele a tu pareja que revise el código.',
  already: 'Ya perteneces a un hogar. Recarga la página para entrar.',
  network: ERROR_MESSAGES.joinHousehold,
} as const

/**
 * Une al usuario al hogar del código. Devuelve el mensaje para mostrar si
 * falla, o null si salió bien. Cada error de la base trae su código
 * (P0002 no existe, TW003 lleno, TW002 ya tiene hogar); el detalle técnico va
 * a la consola.
 */
export async function joinHousehold(code: string): Promise<string | null> {
  const { error } = await supabase.rpc('join_household', { p_code: normalizeInviteCode(code) })
  if (!error) return null

  console.error(error)
  if (isNetworkError(error)) return JOIN_ERROR_MESSAGES.network
  if (error.code === 'TW003') return JOIN_ERROR_MESSAGES.full
  if (error.code === 'TW002') return JOIN_ERROR_MESSAGES.already
  return JOIN_ERROR_MESSAGES.invalid
}
