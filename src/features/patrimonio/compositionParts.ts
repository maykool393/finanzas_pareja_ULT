/**
 * Cálculo de la composición del patrimonio (DESIGN.md § Patrimonio). Aparte de
 * los componentes de Composition.tsx: un archivo que exporta componentes y
 * funciones rompe el recargado en caliente de Vite.
 */

export type CompositionKey = 'cuentas' | 'inversiones' | 'deudas'

export interface CompositionPart {
  key: CompositionKey
  label: string
  amount: number
  /** Porcentaje entero; los tres suman 100. */
  pct: number
}

/** Cuentas, inversiones y deudas como parte del total que suman (las tres en positivo). */
export function compositionParts(accounts: number, investments: number, debts: number): CompositionPart[] {
  const base = accounts + investments + debts
  if (base <= 0) return []
  const pctAccounts = Math.round((accounts / base) * 100)
  const pctInvestments = Math.round((investments / base) * 100)
  return [
    { key: 'cuentas', label: 'Cuentas', amount: accounts, pct: pctAccounts },
    { key: 'inversiones', label: 'Inversiones', amount: investments, pct: pctInvestments },
    // El resto, para que los tres sumen exactamente 100.
    { key: 'deudas', label: 'Deudas', amount: debts, pct: 100 - pctAccounts - pctInvestments },
  ]
}
