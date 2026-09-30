import { useState } from 'react'
import { HeaderExtension } from '../components/layout/HeaderExtension'
import { Dialog } from '../components/ui/Dialog'
import { FloatingButton } from '../components/ui/FloatingButton'
import { BankIcon, CardIcon, PlusIcon, TrendUpIcon } from '../components/ui/icons'
import { AccountsSection } from '../features/accounts/AccountsSection'
import { useAccounts } from '../features/accounts/useAccounts'
import { DebtsSection } from '../features/debts/DebtsSection'
import { useDebts } from '../features/debts/useDebts'
import { InvestmentsSection } from '../features/investments/InvestmentsSection'
import { useInvestments } from '../features/investments/useInvestments'
import { CompositionBar, CompositionSheet } from '../features/patrimonio/Composition'
import { type CompositionKey, compositionParts } from '../features/patrimonio/compositionParts'
import { useCurrency } from '../hooks/useCurrency'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useHouseholdMembers } from '../hooks/useHouseholdMembers'
import { formatCurrency } from '../lib/format'
import styles from './Patrimonio.module.css'

const sum = (values: number[]) => values.reduce((acc, v) => acc + v, 0)

type CreateKind = 'account' | 'debt' | 'investment'

/** Lo que ofrece el botón flotante: cada opción abre el formulario de su sección. */
const CREATE_OPTIONS: { kind: CreateKind; title: string; description: string; Icon: typeof BankIcon }[] = [
  { kind: 'account', title: 'Cuenta', description: 'El banco, el efectivo o una tarjeta', Icon: BankIcon },
  { kind: 'debt', title: 'Deuda', description: 'Un préstamo o una compra en cuotas', Icon: CardIcon },
  { kind: 'investment', title: 'Inversión', description: 'Fondos, depósitos o acciones', Icon: TrendUpIcon },
]

/**
 * Patrimonio (DESIGN.md § Patrimonio): el total y la barra de composición en
 * la cabecera; cuentas y deudas en tarjetas que se apilan al hacer scroll;
 * inversiones en lista agrupada.
 */
export function Patrimonio() {
  useDocumentTitle('Patrimonio')
  const currency = useCurrency()
  const accountsQuery = useAccounts()
  const debtsQuery = useDebts()
  const investmentsQuery = useInvestments()
  const { accounts } = accountsQuery
  const { debts } = debtsQuery
  const { investments } = investmentsQuery
  const { members } = useHouseholdMembers()

  const [sheetOpen, setSheetOpen] = useState(false)
  const [focus, setFocus] = useState<CompositionKey | null>(null)
  const [chooserOpen, setChooserOpen] = useState(false)
  // Cada sección abre su formulario de crear cuando su número cambia.
  const [createRequests, setCreateRequests] = useState<Record<CreateKind, number>>({ account: 0, debt: 0, investment: 0 })

  const accountsTotal = sum(accounts.filter((a) => !a.archivedAt).map((a) => a.balance))
  const debtsTotal = sum(debts.filter((d) => !d.archivedAt).map((d) => d.remaining))
  const investmentsTotal = sum(investments.filter((i) => !i.archivedAt).map((i) => i.currentValue))
  const netWorth = accountsTotal + investmentsTotal - debtsTotal
  const parts = compositionParts(accountsTotal, investmentsTotal, debtsTotal)

  // El patrimonio suma tres listas: si falta una, el total sería falso.
  const totalsLoading = accountsQuery.loading || debtsQuery.loading || investmentsQuery.loading
  const totalsError = accountsQuery.error || debtsQuery.error || investmentsQuery.error
  // Primer uso: sin nada registrado, "$0" solo no dice por dónde empezar.
  const isEmptyHousehold = !totalsLoading && accounts.length === 0 && debts.length === 0 && investments.length === 0

  function requestCreate(kind: CreateKind) {
    setChooserOpen(false)
    setCreateRequests((current) => ({ ...current, [kind]: current[kind] + 1 }))
  }

  return (
    <>
      {/* La cabecera ya dice "Nuestro patrimonio": el título queda para lectores de pantalla. */}
      <h1 className="visually-hidden">Patrimonio</h1>

      <HeaderExtension>
        {totalsError ? (
          <p className={styles.error}>No se pudo calcular el patrimonio: faltan datos por cargar.</p>
        ) : totalsLoading ? (
          <p className={`amount ${styles.total}`} aria-busy="true">
            <span className={styles.skeleton} />
          </p>
        ) : (
          <p className={`amount ${styles.total}`}>
            <span className="visually-hidden">Patrimonio neto: </span>
            {formatCurrency(netWorth, currency)}
          </p>
        )}

        {!totalsLoading && !totalsError && parts.length > 0 && (
          <CompositionBar
            parts={parts}
            onOpen={(key) => {
              setFocus(key)
              setSheetOpen(true)
            }}
          />
        )}

        {isEmptyHousehold && <p className={styles.meta}>Agrega tu primera cuenta abajo para empezar a ver el patrimonio.</p>}
      </HeaderExtension>

      {/* Las secciones reciben los mismos datos que el total: si cada una los
          cargara por su cuenta, guardar en una no actualizaría el total. */}
      <AccountsSection query={accountsQuery} members={members} createRequest={createRequests.account} />
      <DebtsSection query={debtsQuery} members={members} createRequest={createRequests.debt} />
      <InvestmentsSection query={investmentsQuery} members={members} createRequest={createRequests.investment} />

      <CompositionSheet open={sheetOpen} onClose={() => setSheetOpen(false)} parts={parts} focus={focus} onFocus={setFocus} />

      <FloatingButton label="Añadir cuenta, deuda o inversión" icon={<PlusIcon />} onClick={() => setChooserOpen(true)} />

      <Dialog open={chooserOpen} onClose={() => setChooserOpen(false)} title="¿Qué quieres agregar?">
        <ul className={styles.options} role="list">
          {CREATE_OPTIONS.map(({ kind, title, description, Icon }) => (
            <li key={kind}>
              <button type="button" className={styles.option} onClick={() => requestCreate(kind)}>
                <span className={styles.optionIcon}>
                  <Icon aria-hidden="true" />
                </span>
                <span className={styles.optionText}>
                  <span className={styles.optionTitle}>{title}</span>
                  <span className={styles.optionDescription}>{description}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Dialog>
    </>
  )
}
