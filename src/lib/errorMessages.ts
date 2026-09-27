/**
 * Mensajes para cuando falla una llamada a Supabase. Casi siempre es la
 * conexión (es una PWA: se usa sin red), así que dicen qué pasó y cómo seguir,
 * sin detalles técnicos. Ver DESIGN.md § Texto de la interfaz.
 */
export const ERROR_MESSAGES = {
  load: 'No se pudo cargar. Revisa tu conexión e inténtalo de nuevo.',
  save: 'No se pudo guardar. Revisa tu conexión e inténtalo de nuevo.',
  archive: 'No se pudo archivar. Revisa tu conexión e inténtalo de nuevo.',
  unarchive: 'No se pudo reactivar. Revisa tu conexión e inténtalo de nuevo.',
  delete: 'No se pudo eliminar. Revisa tu conexión e inténtalo de nuevo.',
  createHousehold: 'No se pudo crear el hogar. Revisa tu conexión e inténtalo de nuevo.',
  joinHousehold: 'No se pudo unir al hogar. Revisa tu conexión e inténtalo de nuevo.',
} as const

/**
 * El error de Postgres por una restricción `unique` (código 23505). Supabase lo
 * devuelve como un objeto con `code`. Sirve para no culpar a la conexión cuando
 * la causa es un nombre repetido.
 */
export function isUniqueViolation(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'code' in err && err.code === '23505'
}

/**
 * Un fallo de red. Supabase no lanza: devuelve un error sin `code` y con un
 * mensaje técnico ("TypeError: Failed to fetch"). Los errores de la base
 * (restricciones, datos inválidos) traen el código de Postgres.
 */
export function isNetworkError(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (!('code' in err) || !err.code)
}
