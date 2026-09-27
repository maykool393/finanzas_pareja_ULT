import type { CategoryInput } from './api'

/**
 * Categorías para empezar, que se crean de un toque desde el estado vacío.
 * El hogar empieza sin ninguna, y sin categorías no se pueden armar
 * presupuestos. Son las más comunes; después se editan o archivan como
 * cualquier otra.
 */
export const SUGGESTED_CATEGORIES: CategoryInput[] = [
  { name: 'Supermercado', type: 'expense', icon: 'groceries', color: 'green' },
  { name: 'Hogar', type: 'expense', icon: 'home', color: 'purple' },
  { name: 'Transporte', type: 'expense', icon: 'transport', color: 'coral' },
  { name: 'Salud', type: 'expense', icon: 'health', color: 'pink' },
  { name: 'Entretención', type: 'expense', icon: 'entertainment', color: 'purple' },
  { name: 'Suscripciones', type: 'expense', icon: 'subscriptions', color: 'coral' },
  { name: 'Sueldo', type: 'income', icon: 'salary', color: 'green' },
]
