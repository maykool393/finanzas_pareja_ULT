const MESSAGES: Record<string, string> = {
  'Invalid login credentials': 'Correo o contraseña incorrectos.',
  'User already registered': 'Ya existe una cuenta con ese correo.',
  'Auth session missing!': 'Este enlace no es válido o ya expiró. Solicita uno nuevo.',
  'New password should be different from the old password.':
    'La nueva contraseña debe ser distinta a la actual.',
}

export function translateAuthError(message: string): string {
  return MESSAGES[message] ?? message
}
