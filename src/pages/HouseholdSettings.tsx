import { type FormEvent, useState } from 'react'
import { Button } from '../components/ui/Button'
import { CurrencyPicker } from '../components/ui/CurrencyPicker'
import { FormError } from '../components/ui/FormError'
import formStyles from '../components/ui/form.module.css'
import { LoadStatus } from '../components/ui/LoadStatus'
import { RadioListGroup } from '../components/ui/RadioListGroup'
import { TextField } from '../components/ui/TextField'
import { type ExpenseSplit, SPLIT_OPTIONS } from '../features/household/preferences'
import { useAsyncAction } from '../hooks/useAsyncAction'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { type Household, type HouseholdPreferences, useHousehold } from '../hooks/useHousehold'
import { useHouseholdMembers } from '../hooks/useHouseholdMembers'
import { ERROR_MESSAGES } from '../lib/errorMessages'
import styles from './HouseholdSettings.module.css'

/**
 * Nombre, moneda y reparto de gastos del hogar, elegidos en el onboarding. El
 * onboarding ya prometía "Podrás cambiarla más adelante desde los ajustes de
 * tu hogar", pero esta pantalla no existía: una moneda mal elegida no tenía
 * arreglo.
 */
export function HouseholdSettings() {
  useDocumentTitle('Ajustes del hogar')
  const { household, loading, error, retry, updatePreferences } = useHousehold()

  return (
    <div>
      <h1 className={styles.title}>Ajustes del hogar</h1>
      <LoadStatus loading={loading} error={error} onRetry={retry}>
        {/* key: si el hogar se recarga con otros datos, el formulario vuelve a partir de ellos. */}
        {household && <SettingsForm key={household.id} household={household} onSave={updatePreferences} />}
      </LoadStatus>
    </div>
  )
}

function SettingsForm({
  household,
  onSave,
}: {
  household: Household
  onSave: (preferences: HouseholdPreferences) => Promise<void>
}) {
  const { members } = useHouseholdMembers()
  const [name, setName] = useState(household.name)
  const [currency, setCurrency] = useState(household.currency)
  const [expenseSplit, setExpenseSplit] = useState<ExpenseSplit>(household.expenseSplit)
  const [saved, setSaved] = useState(false)
  const { pending, error, run } = useAsyncAction()

  const currencyChanged = currency !== household.currency

  // Cualquier cambio después de guardar borra "Cambios guardados.": si no,
  // seguía a la vista con cambios sin guardar.
  function edited<T>(setter: (value: T) => void) {
    return (value: T) => {
      setSaved(false)
      setter(value)
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaved(false)
    run(async () => {
      await onSave({ name: name.trim(), currency, expenseSplit })
      setSaved(true)
    }, ERROR_MESSAGES.save)
  }

  return (
    <form className={formStyles.form} onSubmit={handleSubmit}>
      <TextField label="Nombre del hogar" value={name} onChange={edited(setName)} required autoComplete="off" />

      <div className={styles.field}>
        <CurrencyPicker value={currency} onChange={edited(setCurrency)} />
        {/* Los montos se guardan como números, sin moneda: cambiarla no los convierte. */}
        <p className={currencyChanged ? styles.warning : styles.hint}>
          Cambiar la moneda no convierte los montos ya registrados: solo cambia el símbolo con que se muestran.
        </p>
      </div>

      {/* El reparto solo tiene sentido con dos personas en el hogar. */}
      {members.length > 1 && (
        <div className={styles.field}>
          <p className={styles.sectionLabel}>¿Cómo prefieren repartir los gastos compartidos?</p>
          <RadioListGroup
            value={expenseSplit}
            onChange={edited(setExpenseSplit)}
            options={SPLIT_OPTIONS}
            label="¿Cómo prefieren repartir los gastos compartidos?"
          />
        </div>
      )}

      {error && <FormError>{error}</FormError>}
      {saved && !pending && (
        <p className={styles.saved} role="status">
          Cambios guardados.
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? 'Guardando…' : 'Guardar cambios'}
      </Button>
    </form>
  )
}
