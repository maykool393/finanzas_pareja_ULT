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
} as const
